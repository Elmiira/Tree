import { Injectable } from '@nestjs/common';

import { Db, InjectConnection, ObjectID } from './mongo/index';

@Injectable()
export class AppService {
  constructor(@InjectConnection() private readonly mongoConnection: Db) { }
  async getHello(): Promise<string> {
		//   const  me =  await this.mongoConnection.collection("test").insertOne({name: "elmira", family: "khodaie"});
		//   console.log(" the result of insertion is : ,", me)
		try {
			const users =    await this.mongoConnection.collection("test").find().toArray();
			console.log("users are  *******v-->  ",  users)
		     return 'Hello World my dude!';
		} catch (error) {
			console.log(error);
			return("errorr")
		}
		
  }
}
