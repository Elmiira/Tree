// tslint:disable:variable-name
// tslint:disable:object-literal-shorthand
import { Inject } from '@nestjs/common';
import { mongoConnectionToken, mongoClientToken } from './constants';

export const InjectConnection = () => Inject(mongoConnectionToken);

export const InjectClient = () => Inject(mongoClientToken);

