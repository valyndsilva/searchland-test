import * as express from "express";
import * as morgan from "morgan";
import * as trpcExpress from "@trpc/server/adapters/express";
import { router, createContext } from "./trpc";
import { usersRouter } from "./routes/users";
import * as cors from "cors";

// Create an instance of the Express application.
const app = express();
// Create a router using the TRPC router and users router.
const appRouter = router({
  user: usersRouter,
});
// Use CORS middleware to enable Cross-Origin Resource Sharing.
app.use(cors());
// Use the morgan middleware for HTTP request logging, using the "dev" format.
app.use(morgan("dev"));
// Use trpcExpress.createExpressMiddleware to integrate TRPC with Express.
app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext, // Provide the createContext function for TRPC context creation.
  })
);

// Define the type of the appRouter for exporting.
export type AppRouter = typeof appRouter;

export default app;
