import DbClient from 'server/db';
let dbClient = new DbClient();

const getPropertyQueryString = `
    WITH RECURSIVE environment_tree AS (
        SELECT
            env.id AS env_id,
            env.name AS env_name,
            env.inherits AS env_inherits,
            1 AS depth
        FROM environments env
        WHERE env.name = $1

        UNION ALL
        SELECT
            env.id AS env_id,
            env.name AS env_name,
            env.inherits AS env_inherits,
            env_tree.depth + 1 AS depth
        FROM environment_tree env_tree
        JOIN environments env ON env_tree.env_inherits = env.id

    ),
    environment_tree_with_depth AS (
        SELECT env_id, sum(depth) AS child_count
        FROM environment_tree
        GROUP BY env_id
    )
    selected_properties AS (
        SELECT DISTINCT ON (prop.name)
            prop.name AS name,
            prop.parent AS parent
        FROM contexts con
        JOIN properties prop ON prop.parent = con.id
        JOIN environment_tree_with_depth env_tree ON env_tree.env_id = con.parent
        WHERE con.parent IN (SELECT env_id FROM environment_tree)
        ORDER BY prop.name, env_tree.child_count ASC
    )
    SELECT
        prop.name AS name,
        prop.value AS value,
        prop.version AS version,
        con.name AS context,
        prop.override_required
    FROM contexts con
    JOIN properties prop ON prop.parent = con.id
    JOIN environment_tree_with_depth env_tree ON env_tree.env_id = con.parent
    WHERE con.parent IN (SELECT env_id FROM environment_tree) AND
        (prop.name, prop.parent) IN (SELECT name, parent FROM selected_properties) AND
        con.name = $2 AND
        prop.name = $3
    ORDER BY prop.name, string_to_array(version, '.')::INT[] DESC;
`;

const createNewPropertyQueryString = `
    INSERT INTO
        properties
            (name, value, parent, creation_user, type, description, override_required, version)
    VALUES
        (
            $1,
            $2,
            (SELECT
                id
            FROM
                contexts
            WHERE name = $3 AND
                (SELECT
                    id
                FROM
                    environments
                WHERE name = $4
                LIMIT 1) = parent
            LIMIT 1),
            $5,
            $6,
            $7,
            $8,
            $9
        )
`;

const getExistingVersion = `
    SELECT
        version
    FROM
        properties
    WHERE
        name = $1 AND
        (SELECT
            id
        FROM
            contexts
        WHERE name = $2 AND
            (SELECT
                id
            FROM
                environments
            WHERE name = $3
            LIMIT 1) = parent
        LIMIT 1) = parent
    ORDER BY
        string_to_array(version, '.')::INT[] DESC

`;

class PropertiesManager {
    async getProperty(environmentName, contextName, propertyName) {
        console.log('inside contexts management', environmentName, contextName, propertyName);
        let properties = await dbClient.executeQuery(getPropertyQueryString, [environmentName, contextName, propertyName]);
        console.log('context properties done', properties.rows);
        return properties.rows;
    }

    async createProperty(propertyJson, environmentName, contextName) {
        let queryParams = [
            propertyJson.name,
            propertyJson.value,
            contextName,
            environmentName,
            propertyJson.user,
            propertyJson.type,
            propertyJson.description,
            propertyJson.overrideRequired
        ];

        return await dbClient.db.transaction(async (client) => {
            let latestVersion = await client.rows(getExistingVersion, propertyJson.name, contextName, environmentName);

            console.log('latestVersion', latestVersion);

            if (latestVersion.length) {
                latestVersion = latestVersion[0].version;
                console.log('latestVersion stringify', latestVersion);
                let majorVersion = latestVersion.substring(0, latestVersion.indexOf('.'));
                let minorVersion = latestVersion.substring(latestVersion.indexOf('.') + 1);
                if (propertyJson.major) {
                    latestVersion = (Number(majorVersion) + 1) + '.0';
                } else {
                    latestVersion = majorVersion + '.' + (Number(minorVersion) + 1);
                }
            } else {
                latestVersion = '1.0';
            }

            queryParams.push(latestVersion);


            console.log('queryParams', queryParams);
            return await client.queryArgs(createNewPropertyQueryString, queryParams);
        });


    }
}

const propertiesManager = new PropertiesManager();

export default propertiesManager;