
import { Inject }  from '@nestjs/common';
import { mongoConnectionToken, mongoClientToken } from './constants';

export const InjectConnection = () => Inject(mongoConnectionToken);
export const InjectClient            = () => Inject(mongoClientToken);

