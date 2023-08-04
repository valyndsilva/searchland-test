import { initTRPC } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";

// "createContext" takes an object with "req"  and "res" properties as an argument
// These arguments are options for creating an Express context.
export const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({});

// Initialize a TRPC context using "initTRPC.context()" and create a new instance named "t".
const t = initTRPC.context().create();

// Extract the router, middleware, and publicProcedure from the TRPC context instance "t".
// These will be used to define and manage TRPC routes, middleware, and procedures.
export const router = t.router;
export const middleware = t.middleware;
export const publicProcedure = t.procedure;
