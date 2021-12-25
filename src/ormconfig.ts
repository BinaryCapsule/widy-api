import { ConnectionOptions } from 'typeorm';
import { Day } from './days/enities/day.entity';
import { Section } from './sections/entities/section.entity';
import { Task } from './tasks/entities/task.entity';
import { Scope } from './scopes/entities/scope.entity';

// const sslObj =
//   process.env.NODE_ENV === 'production'
//     ? {
//         ssl: {
//           rejectUnauthorized: false,
//         },
//       }
//     : {};

const connectionOptions: ConnectionOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: process.env.TYPEORM_SYNC === 'true',
  migrations: ['dist/migrations/*.js'],
  entities: [Day, Section, Task, Scope],
  cli: {
    migrationsDir: 'src/migrations',
  },
  ssl: {
    rejectUnauthorized: false,
  },
  // ...sslObj,
};

export = connectionOptions;
