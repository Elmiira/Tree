import IMongoModuleOptions from './IMongoModuleOptions';
import { MongoClient }                 from 'mongodb';
import { readFile }                          from 'fs-extra';
import { Logger } from '@nestjs/common';

export class ConnectionService {
	private client?: MongoClient;
	 logger = new Logger();

	constructor(private readonly options: IMongoModuleOptions,){ }

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
				this.logger.error('Mongo: could not open configuration file');
				this.logger.error('Mongo: configuration file address: ', config.credentialsFilePath);
				console.error(e);
			}
		}

		let authString = '';
		if (user && password) {
			user = encodeURIComponent(user);
			password = encodeURIComponent(password);
			authString = `${user}:${password}@`;
		}

		const connectionURL = `mongodb://${authString}${config.host}/${config.name}$`;

		return new Promise<MongoClient>((resolve, reject) => {
			const connectToMongo = () => {
				return MongoClient.connect(
					connectionURL,
					{
						useUnifiedTopology: true ,
						useNewUrlParser: true,
						appname: 'TreeService',
						reconnectTries: retryAttempts,
						autoReconnect: true,
					},
				)
					.then((client) => {
						this.logger.log('Mongo: Ready');
						resolve(client);
					})
					.catch((err) => {
						this.logger.error('Mongo: Connection Failed', err);
						this.logger.error('Mongo Connection URL:', connectionURL);
						this.logger.error(`Mongo Config:, ${config}`);
						this.logger.log('Mongo: Trying to reconnect in 5 seconds');
						setTimeout(() => {
							connectToMongo();
						}, retryDelay || 5000);
					});
			};
			connectToMongo();
		});
	}

	async createIndex(collectionName, index): Promise<boolean> {
		return true;
	}
}