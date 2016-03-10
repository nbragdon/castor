import PgAsync from 'pg-async';

const USERNAME = 'catapult';
const PASSWORD = 'catapult123';
const HOST = 'localhost';
const DATABASE_NAME = 'configuration_management';

export default class DbClient {
    constructor() {
        this.defaultConnectionString = `postgres://${USERNAME}:${PASSWORD}@${HOST}/${DATABASE_NAME}`;
        this.db = new PgAsync(this.defaultConnectionString);
    }

    createDbConnection(connectionString) {
        if (connectionString != null) {
            this.db = db;
        }
    }

    setDbClient(dbClient) {
        this.db = dbClient;
    }

    async executeQuery(queryString, ...parameters) {
        console.log('entereted execute query', ...parameters);
        if (parameters.length && typeof parameters[0] == 'object') {
            return await this.db.queryArgs(queryString, ...parameters);
        }
        return await this.db.query(queryString, ...parameters);
    }
}