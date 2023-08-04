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
