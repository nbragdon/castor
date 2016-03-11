import DbClient from 'server/db';
let dbClient = new DbClient();

const getPropertiesForEnvironmentQueryString = `
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
    ),
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
    (prop.name, prop.parent) IN (SELECT name, parent FROM selected_properties)
    ORDER BY prop.name, string_to_array(version, '.')::INT[] DESC;
`;

const createNewEnvironmentQueryString = `
    INSERT INTO
        environments
            (name, inherits, cloned_from, creation_user)
    VALUES
        (
            $1,
            (SELECT id FROM environments WHERE name = $2 LIMIT 1),
            (SELECT id FROM environments WHERE name = $3 LIMIT 1),
            $4
        )
`;

const getEnvironmentIdFromNameQuery = `
    SELECT
        id
    FROM
        environments
    WHERE
        environments.name = $1
`;

class EnvironmentsManager {
    async getEnvironmentProperties(environmentName) {
        console.log('inside property management', environmentName);
        let properties = await dbClient.executeQuery(getPropertiesForEnvironmentQueryString, [environmentName]);
        console.log('properties done', properties.rows);
        return properties.rows;
    }

    async createEnvironment(environmentJson) {
        let queryParams = [
            environmentJson.name,
            environmentJson.inheritsFrom,
            environmentJson.clonedFrom,
            environmentJson.user
        ]
        if (environmentJson.cloned_from) {
            /*
                TODO: implement environment cloning
                This is tricky because it needs to go through and find all of the
                properties that it is getting through inheritance and copy them over to new
                contexts that belong to this environment
             */
        } else {
            return await dbClient.executeQuery(createNewEnvironmentQueryString, queryParams);
        }
    }
}

const environmentsManager = new EnvironmentsManager();

export default environmentsManager;