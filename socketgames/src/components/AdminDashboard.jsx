// // import { useState, useEffect } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import axios from 'axios';
// // import io from 'socket.io-client';

// // const socket = io('http://localhost:5000');

// // function AdminDashboard() {
// //   const [users, setUsers] = useState([]);
// //   const navigate = useNavigate();

// //   useEffect(() => {
// //     socket.on('updateActiveUsers', (data) => {
// //         console.log(data);
        
// //       setUsers(data);
// //     });

// //     return () => {
// //       socket.off('updateActiveUsers');
// //     };
// //   }, []);

// //   const fetchUsers = async () => {
// //     try {
// //       const response = await axios.get('http://localhost:5000/api/users', {
// //         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
// //       });
// //       setUsers(response.data);
// //     } catch (error) {
// //       alert('Failed to fetch users');
// //     }
// //   };

// //   const handleBlockUser = async (userId, isBlocked) => {
// //     try {
// //       await axios.put(
// //         `http://localhost:5000/api/users/${userId}`,
// //         { isBlocked: !isBlocked },
// //         { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
// //       );
// //       fetchUsers();
// //     } catch (error) {
// //       alert('Failed to update user status');
// //     }
// //   };

// //   const handleDeleteUser = async (userId) => {
// //     try {
// //       await axios.delete(`http://localhost:5000/api/users/${userId}`, {
// //         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
// //       });
// //       fetchUsers();
// //     } catch (error) {
// //       alert('Failed to delete user');
// //     }
// //   };

// //   useEffect(() => {
// //     fetchUsers();
// //   }, []);

// //   return (
// //     <div className="min-h-screen bg-gray-100 p-6">
// //       <div className="flex justify-between mb-6">
// //         <h2 className="text-2xl font-bold">Admin Dashboard</h2>
// //         <button
// //           onClick={() => {
// //             localStorage.removeItem('token');
// //             navigate('/login');
// //           }}
// //           className="bg-red-500 text-white px-4 py-2 rounded-lg"
// //         >
// //           Logout
// //         </button>
// //       </div>
// //       <div className="bg-white p-4 rounded-lg shadow">
// //         <h3 className="text-xl font-bold mb-4">User Management</h3>
// //         <table className="w-full">
// //           <thead>
// //             <tr>
// //               <th className="text-left p-2">Email</th>
// //               <th className="text-left p-2">Role</th>
// //               <th className="text-left p-2">Clicks</th>
// //               <th className="text-left p-2">Status</th>
// //               <th className="text-left p-2">Actions</th>
// //             </tr>
// //           </thead>
// //           <tbody>
// //             {users.map((user) => (
// //               <tr key={user._id}>
// //                 <td className="p-2">{user.email}</td>
// //                 <td className="p-2">{user.role}</td>
// //                 <td className="p-2">{user.clickCount}</td>
// //                 <td className="p-2">{user.isBlocked ? 'Blocked' : 'Active'}</td>
// //                 <td className="p-2">
// //                   <button
// //                     onClick={() => handleBlockUser(user._id, user.isBlocked)}
// //                     className={`px-3 py-1 rounded-lg ${
// //                       user.isBlocked ? 'bg-green-500' : 'bg-red-500'
// //                     } text-white mr-2`}
// //                   >
// //                     {user.isBlocked ? 'Unblock' : 'Block'}
// //                   </button>
// //                   <button
// //                     onClick={() => handleDeleteUser(user._id)}
// //                     className="px-3 py-1 bg-red-500 text-white rounded-lg"
// //                   >
// //                     Delete
// //                   </button>
// //                 </td>
// //               </tr>
// //             ))}
// //           </tbody>
// //         </table>
// //       </div>
// //     </div>
// //   );
// // }

// // export default AdminDashboard;




























// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import io from 'socket.io-client';

// const socket = io('http://localhost:5000');

// function AdminDashboard() {
//   const [users, setUsers] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     // Initialize with user data from socket
//     socket.emit('playerConnected', { token: localStorage.getItem('token') });

//     // Listen for real-time user updates
//     socket.on('updateActiveUsers', (data) => {
//       setUsers(data);
//     });

//     return () => {
//       socket.off('updateActiveUsers');
//     };
//   }, []);

//   const handleBlockUser = async (userId, isBlocked) => {
//     try {
//       await axios.put(
//         `http://localhost:5000/api/users/${userId}`,
//         { isBlocked: !isBlocked },
//         { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
//       );
//       // Trigger a refresh of user data via socket
//       socket.emit('playerConnected', { token: localStorage.getItem('token') });
//     } catch (error) {
//       alert('Failed to update user status');
//     }
//   };

//   const handleDeleteUser = async (userId) => {
//     try {
//       await axios.delete(`http://localhost:5000/api/users/${userId}`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//       });
//       // Trigger a refresh of user data via socket
//       socket.emit('playerConnected', { token: localStorage.getItem('token') });
//     } catch (error) {
//       alert('Failed to delete user');
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//       <div className="flex justify-between mb-6">
//         <h2 className="text-2xl font-bold">Admin Dashboard</h2>
//         <button
//           onClick={() => {
//             localStorage.removeItem('token');
//             navigate('/login');
//           }}
//           className="bg-red-500 text-white px-4 py-2 rounded-lg"
//         >
//           Logout
//         </button>
//       </div>
//       <div className="bg-white p-4 rounded-lg shadow">
//         <h3 className="text-xl font-bold mb-4">User Management</h3>
//         <table className="w-full">
//           <thead>
//             <tr>
//               <th className="text-left p-2">Email</th>
//               <th className="text-left p-2">Role</th>
//               <th className="text-left p-2">Clicks</th>
//               <th className="text-left p-2">Status</th>
//               <th className="text-left p-2">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {users.map((user) => (
//               <tr key={user._id}>
//                 <td className="p-2">{user.email}</td>
//                 <td className="p-2">{user.role}</td>
//                 <td className="p-2">{user.clickCount}</td>
//                 <td className="p-2">{user.isBlocked ? 'Blocked' : 'Active'}</td>
//                 <td className="p-2">
//                   <button
//                     onClick={() => handleBlockUser(user._id, user.isBlocked)}
//                     className={`px-3 py-1rando-lg ${
//                       user.isBlocked ? 'bg-green-500' : 'bg-red-500'
//                     } text-white mr-2`}
//                   >
//                     {user.isBlocked ? 'Unblock' : 'Block'}
//                   </button>
//                   <button
//                     onClick={() => handleDeleteUser(user._id)}
//                     className="px-3 py-1 bg-red-500 text-white rounded-lg"
//                   >
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// export default AdminDashboard;





















import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [newPlayerEmail, setNewPlayerEmail] = useState('');
  const [newPlayerPassword, setNewPlayerPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize with user data from socket
    socket.emit('playerConnected', { token: localStorage.getItem('token') });

    // Listen for real-time user updates
    socket.on('updateActiveUsers', (data) => {
      setUsers(data);
    });

    return () => {
      socket.off('updateActiveUsers');
    };
  }, []);

  const handleCreatePlayer = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:5000/api/users',
        { email: newPlayerEmail, password: newPlayerPassword, role: 'player' },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      alert('Player created successfully');
      setNewPlayerEmail('');
      setNewPlayerPassword('');
      // The backend will emit updateActiveUsers, so no need to fetch users here
    } catch (error) {
      alert('Failed to create player: ' + error.response.data.message);
    }
  };

  const handleBlockUser = async (userId, isBlocked) => {
    try {
      await axios.put(
        `http://localhost:5000/api/users/${userId}`,
        { isBlocked: !isBlocked },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      // Trigger a refresh of user data via socket
      socket.emit('playerConnected', { token: localStorage.getItem('token') });
    } catch (error) {
      alert('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:5000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      // Trigger a refresh of user data via socket
      socket.emit('playerConnected', { token: localStorage.getItem('token') });
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <button
          onClick={() => {
            localStorage.removeItem('token');
            navigate('/login');
          }}
          className="bg-red-500 text-white px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-xl font-bold mb-4">Create New Player</h3>
        <form onSubmit={handleCreatePlayer}>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              value={newPlayerEmail}
              onChange={(e) => setNewPlayerEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              value={newPlayerPassword}
              onChange={(e) => setNewPlayerPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            Create Player
          </button>
        </form>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">User Management</h3>
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">Role</th>
              <th className="text-left p-2">Clicks</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td className="p-2">{user.email}</td>
                <td className="p-2">{user.role}</td>
                <td className="p-2">{user.clickCount}</td>
                <td className="p-2">{user.isBlocked ? 'Blocked' : 'Active'}</td>
                <td className="p-2">
                  <button
                    onClick={() => handleBlockUser(user._id, user.isBlocked)}
                    className={`px-3 py-1 rounded-lg ${
                      user.isBlocked ? 'bg-green-500' : 'bg-red-500'
                    } text-white mr-2`}
                  >
                    {user.isBlocked ? 'Unblock' : 'Block'}
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;