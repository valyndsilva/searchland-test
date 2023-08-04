import { AppDataSource } from "../data-source";
import { NextFunction, Request, Response } from "express"; // Import Express middleware types.
import { User } from "../entity/User"; // Import the User entity.

// Define a UserController class to manage user-related operations.
export class UserController {
  private userRepository = AppDataSource.getRepository(User); // Get the repository for User entity.

  // Retrieve all users from the database.
  async all(request: Request, response: Response, next: NextFunction) {
    return this.userRepository.find();
  }

  // Retrieve a single user by ID.
  async one(request: Request, response: Response, next: NextFunction) {
    const id = parseInt(request.params.id);
    // Find a user by the provided ID.
    const user = await this.userRepository.findOne({
      where: { id },
    });
    // If user is not found, return a message, otherwise return the user.
    if (!user) {
      return "unregistered user";
    }
    return user;
  }

  // Save a new user to the database.
  async save(request: Request, response: Response, next: NextFunction) {
    const { id, name, email } = request.body;

    // Create a new User instance using the provided data.
    const user = Object.assign(new User(), {
      id,
      name,
      email,
    });
    // Save the new user to the database and return the saved user.
    return this.userRepository.save(user);
  }
  // Remove a user by ID from the database.
  async remove(request: Request, response: Response, next: NextFunction) {
    const id = parseInt(request.params.id);
    // Find the user to be removed by ID.
    let userToRemove = await this.userRepository.findOneBy({ id });
    // If user is not found, return a message, otherwise remove the user and return a success message.
    if (!userToRemove) {
      return "this user does not exist";
    }

    await this.userRepository.remove(userToRemove);
    return "user has been removed";
  }
}
