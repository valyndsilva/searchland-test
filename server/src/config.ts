// Load and configure environment variables from the .env file using the "dotenv" package.
require("dotenv").config();
// Retrieve the value of the "PORT" environment variable, or default to 3000 if not set.
export const port = process.env.PORT || 3000;
