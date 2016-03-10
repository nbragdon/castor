import DbClient from 'server/db';
let dbClient = new DbClient();

const getPropertiesForContextQueryString = `
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
        con.name = $2
    ORDER BY prop.name, string_to_array(version, '.')::INT[] DESC;
`;

const createNewContextQueryString = `
    INSERT INTO
        contexts
            (name, parent, creation_user)
    VALUES
        (
            $1,
            (SELECT id FROM environments WHERE name = $2 LIMIT 1),
            $3
        )
`;

class ContextsManager {
    async getContextProperties(environmentName, contextName) {
        console.log('inside contexts management', environmentName, contextName);
        let properties = await dbClient.executeQuery(getPropertiesForContextQueryString, [environmentName, contextName]);
        console.log('context properties done', properties.rows);
        return properties.rows;
    }

    async createContext(contextJson, environmentName) {
        let queryParams = [
            contextJson.name,
            environmentName,
            contextJson.user
        ];

        return await dbClient.executeQuery(createNewContextQueryString, queryParams);
    }
}

const contextsManager = new ContextsManager();

export default contextsManager;