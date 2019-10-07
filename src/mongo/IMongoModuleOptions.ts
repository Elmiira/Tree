export default interface IMongoModuleOptions {
  name: string;
  host?: string;
  user?: string;
  password?: string;
  retryDelay?: number;
  retryAttempts?: number;
  credentialsFilePath?: string;
  connectionStringOptions?: string;
}