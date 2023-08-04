// Import necessary decorators from TypeORM for defining entities and columns.
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

// Define a database entity class named "User" using the @Entity decorator.
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;
}
