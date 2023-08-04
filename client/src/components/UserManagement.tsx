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
