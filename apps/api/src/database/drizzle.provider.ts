import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import * as schema from './schema';

export const DRIZZLE = 'DRIZZLE';
export type DrizzleDB = NodePgDatabase<typeof schema>;

export const drizzleProvider = {
  provide: DRIZZLE,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const pool = new Pool({
      host: configService.get<string>('database.host'),
      port: configService.get<number>('database.port'),
      user: configService.get<string>('database.user'),
      password: configService.get<string>('database.password'),
      database: configService.get<string>('database.name'),
    });
    return drizzle(pool, { schema });
  },
};
