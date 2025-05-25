import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
config({ path: '.env' });

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT_CONTAINER || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations_history',
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
