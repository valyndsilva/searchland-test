import { AppDataSource } from "../data-source"; // Import the data source configuration.
import { User } from "../entity/User"; // Import the User entity.
import { publicProcedure, router } from "../trpc"; // Import TRPC procedures and router.
import { z } from "zod"; // Import Zod for data validation and schema definition.

// Define a TRPC query procedure "getUsers" to retrieve a list of users.
// Test data
// const getUsers = publicProcedure.query(() => {
  // return [
  //   {
  //     name: "valyn",
  //     email: "valyn@test.com",
  //   },
  // ];
// });

// Define a TRPC query procedure "getUsers" to retrieve a list of users.
const getUsers = publicProcedure.query(async () => {
  // Use the TypeORM manager to fetch all User entities from the database.
  const users = await AppDataSource.manager.find(User);
  return users;
});

// Define a TRPC mutation procedure "createUser" to create a new user.
const createUser = publicProcedure
  .input(
    z.object({
      name: z.string(),
      email: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    // console.log(input);
    // return "created user";

    // Create a new User entity instance using the input data.
    const newUser = AppDataSource.getRepository(User).create(input);
    // Save the new User entity to the database and return the saved user.
    const savedUser = await AppDataSource.getRepository(User).save(newUser);
    return savedUser;
  });

// Define a TRPC mutation procedure "deleteUser" to delete a user by their ID.
const deleteUser = publicProcedure
  .input(z.string())
  .mutation(async ({ input }) => {
    const userToBeDeleted = AppDataSource.getRepository(User);
    // Check if the user with the given ID exists in the database.
    if (!userToBeDeleted) throw new Error("User not found!");
    // Delete the user with the given ID and return true to indicate success.
    await userToBeDeleted.delete(input);
    return true;
  });

// Create a TRPC router for handling user-related procedures (create, get, delete).
export const usersRouter = router({
  create: createUser, // Attach the "createUser" procedure to the "create" endpoint.
  get: getUsers, // Attach the "getUsers" procedure to the "get" endpoint.
  delete: deleteUser, // Attach the "deleteUser" procedure to the "delete" endpoint.
});
