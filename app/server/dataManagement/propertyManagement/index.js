import DbClient from 'server/db';
let dbClient = new DbClient();

const queryString = `
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
    SELECT DISTINCT ON (prop.name)
            prop.name AS name,
            prop.value AS value,
            con.name AS context,
            prop.override_required
        FROM contexts con
        JOIN properties prop ON prop.parent = con.id
        JOIN environment_tree_with_depth env_tree ON env_tree.env_id = con.parent
        WHERE con.parent IN (SELECT env_id FROM environment_tree)
        ORDER BY prop.name, env_tree.child_count ASC;
`;

class PropertyManagement {
    async getEnvironmentProperties(environmentName) {
        console.log('inside property management', environmentName);
        let properties = await dbClient.executeQuery(queryString, [environmentName]);
        console.log('properties done', properties.rows);
        return properties.rows;
    }
}

const propertyManagment = new PropertyManagement();

export default propertyManagment;