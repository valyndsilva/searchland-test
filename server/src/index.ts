import app from "./app";
import { port } from "./config";
import { AppDataSource } from "./data-source";

// Establish database connection and start the server
AppDataSource.initialize()
  .then(() => {
    // Database initialised successful
    console.log("Database initialised!");
    // Start server and make it listen on the specified port
    app.listen(port);
    console.log("Server on port", port);
  })
  .catch((err) => {
    console.error("Error during Database initialisation:", err);
  });
