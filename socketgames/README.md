Fruits Click Game Dashboard Documentation
Overview
The Fruits Click Game Dashboard is a web-based application built with a Node.js/Express backend and a React frontend. It allows players to increment a click count by clicking a "Banana" button, view real-time rankings, and enables admins to manage users (create, block, unblock, delete). The application uses MongoDB Atlas for data storage, Socket.io for real-time updates, and JWT for authentication. Key features include real-time click count updates, admin-created player accounts, and real-time block/unblock notifications with dynamic button disabling.
This documentation covers all functionalities, setup instructions, usage, and technical details as of May 27, 2025.
Table of Contents

Features
System Architecture
Backend Details (server.js)
Frontend Details
Player Dashboard (PlayerDashboard.jsx)
Admin Dashboard (AdminDashboard.jsx)
Other Components


Setup Instructions
Usage Guide
Player Usage
Admin Usage


Testing Scenarios
Security Considerations
Performance Notes
Future Enhancements

Features

User Registration and Login:

Users (players or admins) can register with an email, password, and role (player or admin).
Login with email and password, authenticated via JWT.
Blocked users are prevented from logging in with a "User is blocked" message.


Admin Player Creation:

Admins can create player accounts by specifying an email and password.
Only players can be created (not admins) to maintain security.
Newly created players appear in the admin dashboard in real-time.


Real-Time Click Counting:

Players click a "Banana" button to increment their click count.
Click counts are saved to MongoDB and updated in real-time on the player dashboard (personal count) and admin dashboard (all users).
Rankings are updated in real-time, showing all players sorted by click count.


User Blocking and Unblocking:

Admins can block/unblock users via the admin dashboard.
Blocked users:
Receive a real-time message: "You have been blocked by the admin. You cannot increase your count."
Have their Banana button disabled immediately.
Cannot log in if logged out.


Unblocked users:
Receive a real-time message: "You have been unblocked by the admin. You can now increase your count." (disappears after 3 seconds).
Have their Banana button re-enabled immediately.


All block/unblock actions update the admin dashboard in real-time.


User Deletion:

Admins can delete users, removing them from the database.
Deleted users are removed from the admin dashboard in real-time.


Real-Time Updates:

Socket.io ensures real-time updates for:
Click counts and rankings.
User list in the admin dashboard (after create, block, unblock, delete).
Block/unblock notifications and button state changes on the player dashboard.




Responsive UI:

Built with React and styled using Tailwind CSS.
Features a clean, responsive design for both player and admin dashboards.



System Architecture

Backend:

Framework: Node.js with Express.js.
Database: MongoDB Atlas (cloud-hosted).
Real-Time Communication: Socket.io for bidirectional updates.
Authentication: JWT with bcrypt for password hashing.
Port: 5000.
CORS: Configured for http://localhost:5173 (frontend).


Frontend:

Framework: React with Vite.
Styling: Tailwind CSS.
Real-Time Client: Socket.io-client.
Port: 5173 (default Vite port).
Routing: React Router for navigation.


Data Flow:

Users interact with the frontend, sending HTTP requests (e.g., login, create player) to the backend.
The backend processes requests, updates MongoDB, and emits Socket.io events for real-time updates.
The frontend listens for Socket.io events to update the UI dynamically.



Backend Details (server.js)
The backend (server.js) handles API routes, database operations, authentication, and real-time updates.
Key Components

MongoDB Connection:

Connects to MongoDB Atlas using the connection string: mongodb+srv://anujsaini75072:7906444281@cluster0.g5exdn6.mongodb.net/.
Uses Mongoose for schema management and async connection with error handling.


User Schema:

Fields: email (unique, required), password (hashed), role (player or admin), clickCount (default 0), isBlocked (default false).
Model: User.


Middleware:

authenticate: Verifies JWT tokens (secret: ABCD1234) and attaches user data to requests.


API Routes:

POST /api/auth/register:
Registers a new user with email, password, and role.
Hashes password using bcrypt.
Response: 201 (success) or 400 (error, e.g., duplicate email).


POST /api/auth/login:
Authenticates users with email and password.
Checks if user is blocked.
Returns JWT token and role on success.
Response: 200 (success), 400 (invalid credentials), 403 (blocked), or 500 (server error).


POST /api/users (admin only):
Creates a player account with email and password.
Restricts role to player.
Emits updateActiveUsers event to refresh admin dashboard.
Response: 201 (success), 400 (error), or 403 (unauthorized).


GET /api/users (admin only):
Retrieves all users for the admin dashboard.
Response: 200 (users list) or 403 (unauthorized).


PUT /api/users/:id (admin only):
Updates a user's isBlocked status.
Emits userBlocked or userUnblocked event to the specific user if online.
Emits updateActiveUsers to refresh admin dashboard.
Response: 200 (success), 400 (error), 403 (unauthorized), or 404 (user not found).


DELETE /api/users/:id (admin only):
Deletes a user by ID.
Emits updateActiveUsers to refresh admin dashboard.
Response: 200 (success), 403 (unauthorized), or 404 (user not found).




Socket.io Logic:

Maintains an activeUsers Map to track connected users with their socket IDs.
Events:
playerConnected: Validates user token, stores user in activeUsers, and emits updateActiveUsers with all users.
bananaClick: Increments click count if user is not blocked, emits updateClickCount (to the user), updateRankings (to all players), and updateActiveUsers (to admins).
userBlocked: Sent to a specific user when blocked, with a message.
userUnblocked: Sent to a specific user when unblocked, with a message.
disconnect: Removes user from activeUsers and emits updateActiveUsers.


Ensures blocked users cannot connect or click.



Frontend Details
The frontend is a React application with Vite, styled using Tailwind CSS, and uses Socket.io-client for real-time updates.
Player Dashboard (PlayerDashboard.jsx)

Path: /player (protected route).
Functionality:
Displays a "Banana" button to increment click count.
Shows the player's current click count and real-time rankings (all players sorted by click count).
Displays block/unblock messages in real-time:
Block: Red alert, persists until unblocked.
Unblock: Green alert, clears after 3 seconds.


Disables the Banana button when blocked, with visual feedback (opacity-50 cursor-not-allowed).
Includes a logout button.


Socket.io Events:
Emits: playerConnected (on mount), bananaClick (on button click).
Listens: updateClickCount (updates personal count), updateRankings (updates rankings), userBlocked (sets block state and message), userUnblocked (clears block state and sets message).


Styling: Tailwind CSS for responsive, clean design.

Admin Dashboard (AdminDashboard.jsx)

Path: /admin (protected route).
Functionality:
Create Player Form: Allows admins to create player accounts with email and password.
User Management Table: Lists all users with email, role, click count, status (Active/Blocked), and actions (Block/Unblock, Delete).
Updates in real-time when users are created, blocked, unblocked, deleted, or update their click count.
Includes a logout button.


Socket.io Events:
Emits: playerConnected (on mount).
Listens: updateActiveUsers (updates user list).


API Calls:
POST /api/users (create player).
PUT /api/users/:id (block/unblock).
DELETE /api/users/:id (delete user).


Styling: Tailwind CSS for a responsive table and form.

Other Components

App.js:
Defines routes: / (home), /login, /register, /player (protected), /admin (protected).
Uses React Router for navigation.


Login.jsx:
Form for email and password login.
Stores JWT token in localStorage and redirects based on role (/player or /admin).
Displays error messages (e.g., "User is blocked").


Register.jsx:
Form for email, password, and role registration.
Redirects to login on success.


ProtectedRoute.jsx:
Ensures only authenticated users with the correct role access /player or /admin.
Redirects unauthenticated users to /login.


main.jsx:
Entry point, renders the React app with React Router.


App.css: Minimal custom CSS (mostly Tailwind).
index.css: Configures Tailwind CSS.

Setup Instructions

Prerequisites:

Node.js (v16 or higher).
MongoDB Atlas account (ensure IP is whitelisted).
Git (optional, for cloning).


Backend Setup:

Create a backend directory and navigate to it:mkdir backend
cd backend


Initialize a Node.js project:npm init -y


Install dependencies:npm install express mongoose bcryptjs jsonwebtoken cors socket.io


Save the provided server.js in the backend directory.
Ensure the MongoDB Atlas connection string is correct (update credentials if needed).
Run the backend:node server.js


Verify: Server runs on http://localhost:5000 and logs "MongoDB connected".


Frontend Setup:

Create a fruit-click-game directory:mkdir fruit-click-game
cd fruit-click-game


Initialize a Vite React project:npm create vite@latest . -- --template react
npm install


Install dependencies:npm install axios react-router-dom socket.io-client tailwindcss postcss autoprefixer


Initialize Tailwind CSS:npx tailwindcss init -p


Update tailwind.config.js:/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
};


Update src/index.css:@tailwind base;
@tailwind components;
@tailwind utilities;


Save the provided frontend files (App.js, PlayerDashboard.jsx, AdminDashboard.jsx, Login.jsx, Register.jsx, ProtectedRoute.jsx, main.jsx, App.css) in the appropriate src directories.
Run the frontend:npm run dev


Verify: Frontend runs on http://localhost:5173.


Environment Variables (Recommended):

Create a .env file in the backend directory:MONGO_URI=mongodb+srv://anujsaini75072:7906444281@cluster0.g5exdn6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=ABCD1234


Update server.js to use dotenv:require('dotenv').config();
// Replace hard-coded MONGO_URI and JWT_SECRET with process.env.MONGO_URI and process.env.JWT_SECRET


Install dotenv:npm install dotenv





Usage Guide
Player Usage

Register:

Navigate to http://localhost:5173/register.
Enter email, password, and select role (player).
Submit to create an account.


Login:

Go to http://localhost:5173/login.
Enter email and password.
On success, redirect to /player.


Player Dashboard:

Click the "Banana" button to increment your click count.
View your current click count and real-time rankings.
If blocked by an admin:
See a red alert: "You have been blocked by the admin. You cannot increase your count."
Banana button is disabled.


If unblocked:
See a green alert: "You have been unblocked by the admin. You can now increase your count." (disappears after 3 seconds).
Banana button is re-enabled.


Click "Logout" to exit.



Admin Usage

Register/Login:

Register as an admin at /register (select admin role) or use existing admin credentials.
Login at /login to access /admin.


Admin Dashboard:

Create Player:
Fill in email and password in the "Create New Player" form.
Submit to create a player account.
New player appears in the user management table immediately.


Manage Users:
View all users with email, role, click count, and status (Active/Blocked).
Click "Block" to block a user or "Unblock" to unblock.
Click "Delete" to remove a user.
Table updates in real-time for all actions.


Click "Logout" to exit.



Testing Scenarios

User Registration and Login:

Register a player (player@example.com, role: player) and an admin (admin@example.com, role: admin).
Login as player → Redirect to /player.
Login as admin → Redirect to /admin.
Attempt login with blocked user → Verify "User is blocked" error.


Admin Player Creation:

As admin, create a player (newplayer@example.com).
Verify player appears in the user management table.
Login as the new player to confirm credentials work.


Real-Time Click Counting:

As player, click the Banana button multiple times.
Verify click count updates in real-time on the player dashboard.
Check admin dashboard to confirm click count updates.
Verify rankings on player dashboard update in real-time.


Block/Unblock Functionality:

Open two browsers:
Admin logged in at /admin.
Player logged in at /player.


As admin, block the player:
Verify player sees a red alert: "You have been blocked by the admin. You cannot increase your count."
Verify Banana button is disabled.
Verify admin table shows user as "Blocked".


As admin, unblock the player:
Verify player sees a green alert: "You have been unblocked by the admin. You can now increase your count." (clears after 3 seconds).
Verify Banana button is re-enabled.
Verify admin table shows user as "Active".


Log out player while blocked, attempt login → Verify "User is blocked".
Unblock player, login again → Verify success.


User Deletion:

As admin, delete a player.
Verify player is removed from the user management table in real-time.
Attempt login as deleted player → Verify "User not found".



Security Considerations

JWT Secret: The hard-coded ABCD1234 in server.js should be replaced with an environment variable (e.g., process.env.JWT_SECRET) using dotenv.
MongoDB Credentials: The MongoDB Atlas connection string contains sensitive credentials. Store it in a .env file and restrict access.
Password Hashing: Uses bcrypt with 10 salt rounds, which is secure but can be tuned for performance/security balance.
Role Restriction: Admins can only create players, preventing unauthorized admin accounts.
Blocked Users: Cannot login or connect via Socket.io, ensuring they cannot bypass restrictions.
CORS: Configured for http://localhost:5173. Update for production domains.
Improvements:
Add HTTPS for production.
Implement token refresh for long-lived sessions.
Add password strength validation.
Use rate limiting on API endpoints to prevent brute-force attacks.




Performance Notes

Database Queries:

Fetching all users for updateActiveUsers and updateRankings may be inefficient for large user bases. Consider:
Pagination for the admin user list.
Emitting only changed data instead of all users.


Indexes on email (already unique)email and clickCount fields are recommended for faster queries.


Socket.IO:

The activeUsers Map ensures efficient lookup for real-time notifications.
Broadcasting updateActiveUsers to all admins can be optimized by sending only changed data.
Frequent emissions (updateRankings, updateActiveUsers) may increase network overhead with high user activity.


Frontend:

React state updates are optimized with targeted setState calls.
Tailwind CSS ensures minimal CSS bundle size.
Consider memoization (e.g., useMemo) for large rankings lists if performance degrades.




Future Improvements

Auto-Logout for Blocked Users:

Automatically log out blocked users by invalidating their JWT or redirecting to /login.
Implement a Socket.IO event to force disconnect.


Enhanced Validation:

Add client-side validation for email format and password strength in Register.jsx and AdminDashboard.jsx.
Server-side validation for password complexity.


User Profile Management:

Allow users to update their profile (e.g., email, password).
Add a user details view for admins.


Improved Notifications:

Use modals or toast notifications instead of alerts for better UX.
Add animations for block/unblock messages (e.g., fade-in/out).


Analytics:

Track user activity (e.g., clicks per minute, session duration) for admin insights.
Display historical click trends on the player dashboard.


Scalability:

Implement pagination or lazy loading for large user lists.
Use Redis for activeUsers for faster session management.
Optimize Socket.IO emissions with rooms or namespaces.


Accessibility:

Ensure ARIA attributes for screen readers (e.g., for disabled buttons, alerts).
Add keyboard navigation support for the Banana button and forms.




This documentation covers the Fruits Click Game Dashboard with all functionalities as implemented in May 2024. For further details or support, refer to the codebase or contact the project maintainers.
