import { createTRPCReact } from "@trpc/react-query"; // Import the createTRPCReact function.
import { AppRouter } from "../../server/src/app"; // Import the AppRouter type from the server.

// Create a TRPC React hook instance.
export const trpc = createTRPCReact<AppRouter>();
