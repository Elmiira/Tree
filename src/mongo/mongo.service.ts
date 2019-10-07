import { MongoClient } from 'mongodb';
import IMongoModuleOptions from './IMongoModuleOptions';
import { readFile } from 'fs-extra';

export class ConnectionService {
	private client?: MongoClient;

	constructor(private readonly options: IMongoModuleOptions) { }

	async getClient(): Promise<MongoClient> {
		if (this.client === undefined) {
			this.client = await this.connect();
		}
		return this.client;
	}

	async connect(): Promise<MongoClient> {
		const { retryAttempts, retryDelay, ...config } = this.options;
		let { user, password } = config;
		if (config.credentialsFilePath) {
			try {
				const credentials = await readFile(config.credentialsFilePath, 'utf8');
				const credentialsParsed = JSON.parse(credentials);
				user = credentialsParsed.user;
				password = credentialsParsed.password;
			} catch (e) {
				console.error('Mongo: could not open configuration file');
				console.error('Mongo: configuration file address: ', config.credentialsFilePath);
				console.error(e);
			}
		}

		let authString = '';
		if (user && password) {
			user = encodeURIComponent(user);
			password = encodeURIComponent(password);
			authString = `${user}:${password}@`;
		}

		let options = '';
		if (config.connectionStringOptions) {
			options = `?${config.connectionStringOptions}`;
		}

		const connectionURL = `mongodb://${authString}${config.host}/${
			config.name
			}${options}`;

		console.log("connectionURL    ------------>", connectionURL)
		return new Promise<MongoClient>((resolve, reject) => {
			const connectToMongo = () => {
				return MongoClient.connect(
					connectionURL,
					{
						appname: 'SERVICE_NAME',
						reconnectTries: retryAttempts,
						autoReconnect: true,
					},
				)
					.then((client) => {
						console.info('Mongo: Ready');
						resolve(client);
					})
					.catch((err) => {
						console.error('Mongo: Connection Failed', err);
						console.error('Mongo Connection URL:', connectionURL);
						console.error('Mongo Config:', config);
						console.info('Mongo: Trying to reconnect in 5 seconds');
						setTimeout(() => {
							connectToMongo();
						}, retryDelay || 5000);
					});
			};
			connectToMongo();
		});
	}
}
