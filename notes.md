# SearchLand Test Notes

## Setup a Monorepo

```
mkdir searchland-test
cd searchland-test
```

## Setup Server (Node.js + Express + tRPC + TypeORM):

```
mkdir server
cd server
npm install -g typeorm
typeorm init --database postgres --express
npm i --save-dev @types/express
npm install
npm run start
```

You get an error since PostgreSQL is not yet setup:

```
Error: connect ECONNREFUSED ::1:5432
    at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1494:16) {
  errno: -61,
  code: 'ECONNREFUSED',
  syscall: 'connect',
  address: '::1',
  port: 5432
}
```

### Setup PostgreSQL locally using docker.

#### Create server/docker-compose.yml:

Define the PostgreSQL container and its configuration here.

```
version: "3.8"
services:
  postgres:
    image: postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - '5432:5432'
```

#### Start the PostgreSQL Container:

This command will download the PostgreSQL image if not already downloaded and start the container in detached mode (-d).

Run in server terminal:

```
docker compose up -d
npm run start
```

You now get a different error:

```
  length: 100,
  severity: 'FATAL',
  code: '28P01',
  detail: undefined,
  hint: undefined,
  position: undefined,
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'auth.c',
  line: '326',
  routine: 'auth_failed'
```

#### Update Data Source Credentials (PostgreSQL Database):

Go to src/data-source.ts and update the username, password and database to be postgres:

```
import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "postgres",
  database: "postgres",
  synchronize: true,
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
});

```

Run in server terminal:

```
npm run start
```

#### Stop the PostgreSQL Container:

When you're done working with the PostgreSQL container, you can stop and remove it using the following command.

Run in server terminal:

```
docker compose down
npm run start
```

You receive an error since the docker container isn't running anymore.

#### Restart the PostgreSQL Container:

Run in server terminal:

```
docker compose up -d
npm run start
```

### Set up app configuration for port:

Create server/src/config.ts:

```
require("dotenv").config();
export const port = process.env.PORT || 3000;
```

Run in server terminal:

```
export PORT=3001
npm run dev
unset PORT
```

Run in server terminal:

```
npm install dotenv
```

Create .env in server root directory:
In .env:

```
PORT=3000
```

### Initialise Database connection, start Express.js server, and listen on a specified port:

#### Install nodemon for Hot reloading:

This helps avoid need to restart app manually after changes.

Run in server terminal:

```
 npm install nodemon -D
```

Add script to package.json:

```
"dev": "nodemon -w *.ts -w .env src/index.ts"
```

Run in server terminal:

```
npm run dev
```

#### Install morgan for API logging:

Run in server terminal:

```
npm install morgan
npm i --save-dev @types/morgan
```

Now if you do any API requests (GET,POST,PATCH, DELETE) it logs it in the terminal.

#### Install CORS:

Run in server terminal:

```
npm install cors
npm install @types/cors --save-dev
```

#### Set up Express:

##### Create server/src/app.ts:

```
import * as express from "express";
import * as morgan from "morgan";
import * as cors from "cors";

// Create an instance of the Express application.
const app = express();

// Use CORS middleware to enable Cross-Origin Resource Sharing.
app.use(cors());

// Use the morgan middleware for HTTP request logging, using the "dev" format.
app.use(morgan("dev"));

export default app;

```

##### In server/src/index.ts:

```
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

```

### Add tRPC to Express Project:

Refer https://trpc.io/docs/server/routers

Run in server terminal:

```
npm install @trpc/server zod
```

#### Initialize tRPC

In server/src/trpc.ts:

```
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

```

#### Create users route:

In server/src/routes/users.ts:
Add some test user dummy data.

```
import { publicProcedure, router } from "../trpc"; // Import TRPC procedures and router.

// Define a TRPC query procedure "getUsers" to retrieve a list of users.
// Test data
const getUsers = publicProcedure.query(() => {
   return [
    {
      name: "valyn",
      email: "valyn@test.com",
    },
  ];
});
// Create a TRPC router for handling user-related procedures (create)
export const usersRouter = router({
  get: getUsers, // Attach the "createUser" procedure to the "create" endpoint.
});

```

#### Defining a Router:

Update server/src/app.ts:

```
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
```

## Setup Client (Vite + React + TS + Shadcn-ui + TailwindCSS):

```
npm init vite@latest
✔ Project name: … client
✔ Select a framework: › React
✔ Select a variant: › TypeScript
cd client
npm install
sudo npm install @trpc/client @trpc/server @trpc/react-query @tanstack/react-query
npm run dev
```

### Setup Tailwind CSS and Shadcn-ui:

#### Install Tailwind CSS:

Run in client terminal:

```
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### Edit client/tsconfig.json:

```
  "baseUrl": ".",
  "paths": {
    "@/*": ["./src/*"]
  }
```

#### Update vite.config.ts:

Run in client terminal:

```
# (so you can import "path" without error)
npm i -D @types/node
```

Update client/vite.config.ts:

```
import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

#### Install Shadcn-ui:

Run in client terminal:

```
npx shadcn-ui@latest init
✔ Would you like to use TypeScript (recommended)? … no / yes
✔ Which style would you like to use? › Default
✔ Which color would you like to use as base color? › Slate
✔ Where is your global CSS file? … src/globals.css
✔ Would you like to use CSS variables for colors? … no / yes
✔ Where is your tailwind.config.js located? … tailwind.config.js
✔ Configure the import alias for components: … src/components
✔ Configure the import alias for utils: … src/lib/utils
✔ Are you using React Server Components? … no / yes
✔ Write configuration to components.json. Proceed? … yes
```

#### Add shadcn-ui components:

Run in client terminal:

```
npx shadcn-ui@latest add button
npx shadcn-ui@latest add table
# Add tanstack/react-table dependency:
npm install @tanstack/react-table
```

These components will be saved in client/src/components/ui

#### Create Basic DataTable using Shadcn-ui:

Refer https://ui.shadcn.com/docs/components/data-table

##### Create Column Definitions:

In client/components/ui/columns.tsx:

```
import { ColumnDef } from "@tanstack/react-table"; // Import the ColumnDef type from react-table.
import { trpc } from "../../trpc"; // Import the trpc hook instance.

// Define the User interface representing user data.
interface User {
  id: number;
  name: string;
  email: string;
}

// Define an array of ColumnDef objects representing table columns for the User data.
export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: "Id",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "actions", // A virtual accessor for rendering actions (e.g., buttons)
    header: "Actions",
    cell: ({ row }) => {
      // Define the rendering logic for the "actions" column cell here.
      const deleteUser = trpc.user.delete.useMutation(); // Create a mutation hook for deleting a user.
      const utils = trpc.useContext(); // Get the TRPC context utilities.
      return (
        <button onClick={() => console.log("user id:", row.original.id)}>
          Delete
        </button>

      );
    },
  },
];
```

##### Create DataTable Component:

In client/src/components/DataTable.tsx:
Add necessary styles for the table using TailwindCSS here.

```
// Required for shadcn. Refer: https://ui.shadcn.com/docs/components/data-table
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "./ui/button";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export default function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div>
      <div className="rounded-md border border-slate-500 text-center">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-slate-700 border-slate-500 bg-slate-700"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="text-white text-center"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-slate-700 border-slate-500"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center hover:bg-transparent"
                >
                  No user data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          className="bg-slate-500 hover:bg-slate-600 px-3 py-2 rounded-md text-white"
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          className="bg-slate-500 hover:bg-slate-600 px-3 py-2 rounded-md text-white"
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

```

You can use the <DataTable/> component as below:

```
<DataTable columns={columns} data={data} />
```

### Create tRPC Hooks:

In client/src/trpc.ts:

```
import { createTRPCReact } from "@trpc/react-query"; // Import the createTRPCReact function.
import { AppRouter } from "../../server/src/app"; // Import the AppRouter type from the server.

// Create a TRPC React hook instance.
export const trpc = createTRPCReact<AppRouter>();
```

### Add tRPC providers

In client/src/App.tsx:

```
import "./globals.css";
import { useState } from "react";
import { trpc } from "./trpc"; // Import the trpc hook instance.
import { httpBatchLink } from "@trpc/client"; // Import the httpBatchLink from trpc client.
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // Import components for React Query.

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
      test
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;
```

### Create Client Components:

#### In client/src/components/UserList.tsx:

```
import { DataTable } from "."; // Import the shadcn react-table DataTable component.
import { trpc } from "../trpc"; // Import the trpc hook instance.
import { columns } from "./ui/columns"; // Import the shadcn react-table columns configuration.

const UserList = () => {
  // Use the trpc.user.get.useQuery() hook to fetch user data.
  // const users = trpc.user.get.useQuery();
  const { data, isLoading, isError, error } = trpc.user.get.useQuery();
  // Handle loading state: Display "Loading..." if data is being fetched.
  if (isLoading) return <div>Loading...</div>;
  // Handle error state: Display error message if fetching data encountered an error.
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      {/* <div>{JSON.stringify(users.data)}</div> */}
      {data && <DataTable columns={columns} data={data} />}
    </div>
  );
};

export default UserList;

```

#### In client/src/components/AddUserForm.tsx:

```
import { ChangeEvent, FormEvent, useState } from "react"; // Import React hooks for state and events.
import { trpc } from "../trpc"; // Import the trpc hook instance.
import { Button } from "./ui/button"; // Import the shadcn Button component.

const AddUserForm = () => {
  // Define the initial state for the user input fields.
  const initialUserState = {
    name: "",
    email: "",
  };
  const [user, setUser] = useState(initialUserState);

  const addUser = trpc.user.create.useMutation(); // Create a mutation hook for adding a user
  const utils = trpc.useContext(); // Get the TRPC context utilities.

  // Define the submit handler for the form.
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // console.log(e);
    // console.log(user);

    // Perform the addUser mutation using the user data.
    addUser.mutate(user, {
      onSuccess: () => {
        console.log("User added successfully");
        setUser(initialUserState); // clear input fields after user is added successfully.
        utils.user.get.invalidate(); // Invalidate the user data query cache.
      },
    });
  };
  // Define the change handler for input fields.
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // console.log(e);
    setUser({ ...user, [e.target.name]: e.target.value }); // Update user state based on input changes.
  };

  return (
    <div className="py-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col space-y-2 bg-slate-900 p-5 rounded-md"
      >
        <h2 className="text-xl font-bold text-center">Add a user:</h2>
        <div className="grid md:grid-cols-8 gap-4">
          <input
            type="text"
            value={user.name}
            placeholder="Name"
            autoFocus
            name="name"
            onChange={handleChange}
            className="md:col-span-3 bg-slate-800 text-white focus:bg-slate-700 px-3 py-2 w-full rounded-md mb-3 outline-none"
          />
          <input
            type="email"
            value={user.email}
            placeholder="Email"
            name="email"
            onChange={handleChange}
            className="md:col-span-3 bg-slate-800 text-white focus:bg-slate-700 px-3 py-2 w-full rounded-md mb-3 outline-none"
          />
          <Button
            type="submit"
            className="md:col-span-2 bg-slate-500 hover:bg-slate-600 px-3 py-2 rounded-md text-white"
          >
            Add User
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddUserForm;
```

#### In client/src/components/UserManagement.tsx:

```
import UserList from "./UserList";
import AddUserForm from "./AddUserForm";

const UserManagement = () => {
  return (
    <div className="flex flex-col min-h-screen py-5">
      <div className="max-w-7xl mx-auto w-full px-5 lg:px-0 ">
        <h1 className="text-3xl font-bold py-5">User Management</h1>
        <UserList />
        <AddUserForm />
      </div>
    </div>
  );
};

export default UserManagement;
```

#### Update client/src/App.tsx:

```
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

```

On both server and client terminals:

```
npm run dev
```

Go to http://localhost:5173

You will see status error / loading if you don't have cors installed on the server. Make sure CORS is installed and setup.

#### Install Zod on the server:

Zod is mainly used for data validation and schema definition.

Run in server terminal:

```
npm install zod
```

### Create Mutations:

Refer https://orkhan.gitbook.io/typeorm/docs/example-with-express

Update server/routes/users.ts:

```
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

```

### Add a Delete User button in DataTable for each user row :

#### Update the client/src/components/ui/columns.tsx:

Add a delete button to each user row in the data table column

```
import { ColumnDef } from "@tanstack/react-table"; // Import the ColumnDef type from react-table.
import { trpc } from "../../trpc"; // Import the trpc hook instance.

// Define the User interface representing user data.
interface User {
  id: number;
  name: string;
  email: string;
}

// Define an array of ColumnDef objects representing table columns for the User data.
export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: "Id",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "actions", // A virtual accessor for rendering actions (e.g., buttons)
    header: "Actions",
    cell: ({ row }) => {
      // Define the rendering logic for the "actions" column cell here.
      const deleteUser = trpc.user.delete.useMutation(); // Create a mutation hook for deleting a user.
      const utils = trpc.useContext(); // Get the TRPC context utilities.
      return (
        // <button onClick={() => console.log("user id:", row.original.id)}>
        //   Delete
        // </button>
        <button
          className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded-md text-white"
          onClick={() =>
            deleteUser.mutate(row.original.id.toString(), {
              onSuccess: (data) => {
                if (data) {
                  utils.user.get.invalidate(); // Invalidate the user data query cache.
                }
              },
              onError: (error) => {
                console.log(error);
              },
            })
          }
        >
          Delete
        </button>
      );
    },
  },
];

```

## Test the application:

Run on both client and server terminals:

```
npm run dev
```

Go to http://localhost:5173/
Try adding and deleting a user.
