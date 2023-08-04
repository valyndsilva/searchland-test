import "./globals.css";
import { useState } from "react";
import { trpc } from "./trpc"; // Import the trpc hook instance.
import { httpBatchLink } from "@trpc/client"; // Import the httpBatchLink from trpc client.
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // Import components for React Query.
import UserManagement from "./components/UserManagement"; // Import the UserManagement component.

function App() {
  // Use the useState hook to create a new QueryClient instance.
  const [queryClient] = useState(() => new QueryClient());
  // Use the useState hook to create a new trpc client instance.
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        // Configure an HTTP batch link with a specified URL.
        httpBatchLink({
          url: "http://localhost:3000/trpc", // URL of the TRPC endpoint on the server.
        }),
      ],
    })
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <UserManagement />
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;
