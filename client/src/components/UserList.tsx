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
