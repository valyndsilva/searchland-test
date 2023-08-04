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
