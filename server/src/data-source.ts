// Import the "reflect-metadata" package, required for TypeORM decorators.
import "reflect-metadata";
// Import the DataSource class from the "typeorm" package, used for configuring database connections.
import { DataSource } from "typeorm";
// Import the User entity from the "./entity/User" module. This represents a database table/model.
import { User } from "./entity/User";
// Create a new instance of the DataSource class named "AppDataSource".
export const AppDataSource = new DataSource({
  // Specify the type of the database, in this case, PostgreSQL.
  type: "postgres",
  // Provide the database connection details.
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "postgres",
  database: "postgres",
  // Setting "synchronize" to true will automatically create database tables based on entity definitions.
  synchronize: true,
  // Setting "logging" to false disables logging of database queries and operations.
  logging: false,
  // Specify the entities (models/tables) that TypeORM should be aware of.
  entities: [User],
  // Migrations and subscribers are not configured, so leave empty.
  migrations: [],
  subscribers: [],
});
