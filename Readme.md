# SearchLand Test App:

Welcome to the SearchLand Test App! This README provides a step-by-step guide to set up and run both the server and client components of the app.

## Server Setup

2. Navigate to the server directory:

```
cd server
```

2. Create environtment variables:

In the `server` directory, create a `.env` file.

```
PORT=3000
```

Ensure that the server is running on the specified port (default is 3000).
Customize the `PORT` value in .env if needed.

3. Install server dependencies:

```
npm install
```

3. Install Docker:
Make sure you have docker installed on your system.
For Mac: https://docs.docker.com/desktop/install/mac-install/
For Windows: https://docs.docker.com/desktop/install/windows-install/

4. Start the PostgreSQL Container:
   This command will start a PostgreSQL database container in detached mode.

```
docker compose up -d
```

5. Start the server:

```
npm run dev
```

6. When you're done testing the app, stop and remove the PostgreSQL container:

```
docker compose down
```

This command will stop and remove the PostgreSQL container.

## Client Setup:

1. Navigate to the client directory:

```
cd client
```

2. Install client dependencies:

```
npm install
```

3. Start the client:

```
npm run dev
```

4. Test the application:
   Go to http://localhost:5173/ and Try adding and deleting a user.

## Additional Information

- The server should be running before starting the client.
- The client application can be accessed at http://localhost:5173 (default port).
- Make sure to customize configuration and environment variables as needed.
- If you'd like to see the detailed implementation guide about the application,check out [notes.md](notes.md).
  Enjoy using the SearchLand Test App! :)
