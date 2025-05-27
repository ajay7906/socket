















// const express = require('express');
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const cors = require('cors');
// const http = require('http');
// const { Server } = require('socket.io');

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: 'http://localhost:5173',
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   },
// });

// app.use(cors());
// app.use(express.json());

// // MongoDB Connection


// // mongoose.connect('mongodb://localhost:27017/fruit-click-game', {
// //   useNewUrlParser: true,
// //   useUnifiedTopology: true,
// // });  



// // // MongoDB Connection
// // // mongoose.connect('mongodb://localhost:27017/click-game', {
// // //   useNewUrlParser: true,
// // //   useUnifiedTopology: true,
// // // });


// (async () => {
//     try {
//       await mongoose.connect('mongodb+srv://anujsaini75072:7906444281@cluster0.g5exdn6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//       });
//       console.log('MongoDB connected');
//     } catch (err) {
//       console.error('MongoDB connection error:', err.message);
//       process.exit(1);
//     }
//   })();

// // User Schema
// const userSchema = new mongoose.Schema({
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   role: { type: String, enum: ['player', 'admin'], default: 'player' },
//   clickCount: { type: Number, default: 0 },
//   isBlocked: { type: Boolean, default: false },
// });

// const User = mongoose.model('User', userSchema);

// // Middleware to verify JWT
// const authenticate = async (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) return res.status(401).json({ message: 'No token provided' });

//   try {
//     const decoded = jwt.verify(token, 'ABCD1234'); // Use a secure secret key in production
//     req.user = decoded;
//     next();
//   } catch (error) {
//     res.status(401).json({ message: 'Invalid token' });
//   }
// };

// // Authentication Routes
// app.post('/api/auth/register', async (req, res) => {
//   const { email, password, role } = req.body;
//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = new User({ email, password: hashedPassword, role });
//     await user.save();
//     res.status(201).json({ message: 'User registered successfully' });
//   } catch (error) {
//     res.status(400).json({ message: 'Error registering user: ' + error.message });
//   }
// });

// app.post('/api/auth/login', async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: 'User not found' });
//     if (user.isBlocked) return res.status(403).json({ message: 'User is blocked' });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

//     const token = jwt.sign({ id: user._id, role: user.role }, 'ABCD1234', { expiresIn: '1h' });
//     res.json({ token, role: user.role });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // User Management Routes
// app.post('/api/users', authenticate, async (req, res) => {
//   if (req.user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });
//   const { email, password, role = 'player' } = req.body;
//   try {
//     if (role !== 'player') return res.status(400).json({ message: 'Admins can only create player accounts' });
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = new User({ email, password: hashedPassword, role });
//     await user.save();
//     // Emit updated user list to all admin clients
//     const updatedUsers = await User.find().select('email role clickCount isBlocking');
//     io.emit('updateActiveUsers', updatedUsers);
//     res.status(201).json({ message: 'Player created successfully' });
//   } catch (error) {
//     res.status(400).json({ message: 'Error creating player: ' + error.message });
//   }
// });

// app.get('/api/users', authenticate, async (req, res) => {
//   if (req.user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });
//   const users = await User.find();
//   res.json(users);
// });

// app.put('/api/users/:id', authenticate, async (req, res) => {
//   if (req.user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });
//   const { isBlocked } = req.body;
//   await User.findByIdAndUpdate(req.params.id, { isBlocked });
//   // Emit updated user list to all admin clients
//   const updatedUsers = await User.find().select('email role clickCount isBlocked');
//   io.emit('updateActiveUsers', updatedUsers);
//   res.json({ message: 'User updated successfully' });
// });

// app.delete('/api/users/:id', authenticate, async (req, res) => {
//   if (req.user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });
//   await User.findByIdAndDelete(req.params.id);
//   // Emit updated user list to all admin clients
//   const updatedUsers = await User.find().select('email role clickCount isBlocked');
//   io.emit('updateActiveUsers', updatedUsers);
//   res.json({ message: 'User deleted successfully' });
// });

// // Socket.io Logic
// const activeUsers = new Map();

// io.on('connection', (socket) => {
//   socket.on('playerConnected', async ({ token }) => {
//     try {
//       const decoded = jwt.verify(token, 'ABCD1234');
//       const user = await User.findById(decoded.id);
//       if (!user || user.isBlocked) return;

//       // Store user with role in activeUsers
//       activeUsers.set(socket.id, { ...user.toObject(), socketId: socket.id });
      
//       // Emit updated user list to all admin clients
//       const allUsers = await User.find().select('email role clickCount isBlocked');
//       io.emit('updateActiveUsers', allUsers);

//       socket.on('bananaClick', async () => {
//         try {
//           user.clickCount += 1;
//           await user.save();
//           socket.emit('updateClickCount', { clickCount: user.clickCount });
//           // Emit updated rankings to all clients (for player dashboard)
//           io.emit('updateRankings', await User.find().sort({ clickCount: -1 }));
//           // Emit updated user list to all admin clients
//           const updatedUsers = await User.find().select('email role clickCount isBlocked');
//           io.emit('updateActiveUsers', updatedUsers);
//         } catch (error) {
//           console.error('Banana click error:', error);
//         }
//       });

//       socket.on('disconnect', async () => {
//         activeUsers.delete(socket.id);
//         // Emit updated user list to all admin clients
//         const updatedUsers = await User.find().select('email role clickCount isBlocked');
//         io.emit('updateActiveUsers', updatedUsers);
//       });
//     } catch (error) {
//       console.error('Socket error:', error);
//     }
//   });
// });

// server.listen(5000, () => {
//   console.log('Server running on port 5000');
// });

























// const express = require('express');
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const cors = require('cors');
// const http = require('http');
// const { Server } = require('socket.io');

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: 'http://localhost:5173',
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   },
// });

// app.use(cors());
// app.use(express.json());

// // MongoDB Connection
// (async () => {
//     try {
//       await mongoose.connect('mongodb+srv://anujsaini75072:7906444281@cluster0.g5exdn6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//       });
//       console.log('MongoDB connected');
//     } catch (err) {
//       console.error('MongoDB connection error:', err.message);
//       process.exit(1);
//     }
// })();

// // User Schema
// const userSchema = new mongoose.Schema({
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   role: { type: String, enum: ['player', 'admin'], default: 'player' },
//   clickCount: { type: Number, default: 0 },
//   isBlocked: { type: Boolean, default: false },
// });

// const User = mongoose.model('User', userSchema);

// // Middleware to verify JWT
// const authenticate = async (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) return res.status(401).json({ message: 'No token provided' });

//   try {
//     const decoded = jwt.verify(token, 'ABCD1234');
//     req.user = decoded;
//     next();
//   } catch (error) {
//     res.status(401).json({ message: 'Invalid token' });
//   }
// };

// // Authentication Routes
// app.post('/api/auth/register', async (req, res) => {
//   const { email, password, role } = req.body;
//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = new User({ email, password: hashedPassword, role });
//     await user.save();
//     res.status(201).json({ message: 'User registered successfully' });
//   } catch (error) {
//     res.status(400).json({ message: 'Error registering user: ' + error.message });
//   }
// });

// app.post('/api/auth/login', async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: 'User not found' });
//     if (user.isBlocked) return res.status(403).json({ message: 'User is blocked' });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

//     const token = jwt.sign({ id: user._id, role: user.role }, 'ABCD1234', { expiresIn: '1h' });
//     res.json({ token, role: user.role });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // User Management Routes
// app.post('/api/users', authenticate, async (req, res) => {
//   if (req.user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });
//   const { email, password, role = 'player' } = req.body;
//   try {
//     if (role !== 'player') return res.status(400).json({ message: 'Admins can only create player accounts' });
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = new User({ email, password: hashedPassword, role });
//     await user.save();
//     // Emit updated user list to all admin clients
//     const updatedUsers = await User.find().select('email role clickCount isBlocked');
//     io.emit('updateActiveUsers', updatedUsers);
//     res.status(201).json({ message: 'Player created successfully' });
//   } catch (error) {
//     res.status(400).json({ message: 'Error creating player: ' + error.message });
//   }
// });

// app.get('/api/users', authenticate, async (req, res) => {
//   if (req.user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });
//   const users = await User.find();
//   res.json(users);
// });

// app.put('/api/users/:id', authenticate, async (req, res) => {
//   if (req.user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });
//   const { isBlocked } = req.body;
//   try {
//     const user = await User.findByIdAndUpdate(req.params.id, { isBlocked }, { new: true });
//     if (!user) return res.status(404).json({ message: 'User not found' });
//     // Emit updated user list to all admin clients
//     const updatedUsers = await User.find().select('email role clickCount isBlocked');
//     io.emit('updateActiveUsers', updatedUsers);
//     // If user is blocked, notify them via their socket
//     if (isBlocked) {
//       const activeUser = Array.from(activeUsers.values()).find(u => u._id.toString() === req.params.id);
//       if (activeUser && activeUser.socketId) {
//         io.to(activeUser.socketId).emit('userBlocked', {
//           message: 'You have been blocked by the admin. You cannot increase your count.'
//         });
//       }
//     }
//     res.json({ message: 'User updated successfully' });
//   } catch (error) {
//     res.status(400).json({ message: 'Error updating user: ' + error.message });
//   }
// });

// app.delete('/api/users/:id', authenticate, async (req, res) => {
//   if (req.user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });
//   await User.findByIdAndDelete(req.params.id);
//   // Emit updated user list to all admin clients
//   const updatedUsers = await User.find().select('email role clickCount isBlocked');
//   io.emit('updateActiveUsers', updatedUsers);
//   res.json({ message: 'User deleted successfully' });
// });

// // Socket.io Logic
// const activeUsers = new Map();

// io.on('connection', (socket) => {
//   socket.on('playerConnected', async ({ token }) => {
//     try {
//       const decoded = jwt.verify(token, 'ABCD1234');
//       const user = await User.findById(decoded.id);
//       if (!user || user.isBlocked) return;

//       // Store user with role in activeUsers
//       activeUsers.set(socket.id, { ...user.toObject(), socketId: socket.id });
      
//       // Emit updated user list to all admin clients
//       const allUsers = await User.find().select('email role clickCount isBlocked');
//       io.emit('updateActiveUsers', allUsers);

//       socket.on('bananaClick', async () => {
//         try {
//           if (user.isBlocked) {
//             socket.emit('userBlocked', {
//               message: 'You have been blocked by the admin. You cannot increase your count.'
//             });
//             return;
//           }
//           user.clickCount += 1;
//           await user.save();
//           socket.emit('updateClickCount', { clickCount: user.clickCount });
//           // Emit updated rankings to all clients (for player dashboard)
//           io.emit('updateRankings', await User.find().sort({ clickCount: -1 }));
//           // Emit updated user list to all admin clients
//           const updatedUsers = await User.find().select('email role clickCount isBlocked');
//           io.emit('updateActiveUsers', updatedUsers);
//         } catch (error) {
//           console.error('Banana click error:', error);
//         }
//       });

//       socket.on('disconnect', async () => {
//         activeUsers.delete(socket.id);
//         // Emit updated user list to all admin clients
//         const updatedUsers = await User.find().select('email role clickCount isBlocked');
//         io.emit('updateActiveUsers', updatedUsers);
//       });
//     } catch (error) {
//       console.error('Socket error:', error);
//     }
//   });
// });

// server.listen(5000, () => {
//   console.log('Server running on port 5000');
// });





















const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.use(cors());
app.use(express.json());

// MongoDB Connection
(async () => {
    try {
      await mongoose.connect('mongodb+srv://anujsaini75072:7906444281@cluster0.g5exdn6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('MongoDB connected');
    } catch (err) {
      console.error('MongoDB connection error:', err.message);
      process.exit(1);
    }
})();

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['player', 'admin'], default: 'player' },
  clickCount: { type: Number, default: 0 },
  isBlocked: { type: Boolean, default: false },
});

const User = mongoose.model('User', userSchema);

// Middleware to verify JWT
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, 'ABCD1234');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, role });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error registering user: ' + error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });
    if (user.isBlocked) return res.status(403).json({ message: 'User is blocked' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, 'ABCD1234', { expiresIn: '1h' });
    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// User Management Routes
app.post('/api/users', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });
  const { email, password, role = 'player' } = req.body;
  try {
    if (role !== 'player') return res.status(400).json({ message: 'Admins can only create player accounts' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, role });
    await user.save();
    // Emit updated user list to all admin clients
    const updatedUsers = await User.find().select('email role clickCount isBlocked');
    io.emit('updateActiveUsers', updatedUsers);
    res.status(201).json({ message: 'Player created successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error creating player: ' + error.message });
  }
});

app.get('/api/users', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });
  const users = await User.find();
  res.json(users);
});

app.put('/api/users/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });
  const { isBlocked } = req.body;
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBlocked }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Emit updated user list to all admin clients
    const updatedUsers = await User.find().select('email role clickCount isBlocked');
    io.emit('updateActiveUsers', updatedUsers);
    // Notify the specific user via their socket
    const activeUser = Array.from(activeUsers.values()).find(u => u._id.toString() === req.params.id);
    if (activeUser && activeUser.socketId) {
      if (isBlocked) {
        io.to(activeUser.socketId).emit('userBlocked', {
          message: 'You have been blocked by the admin. You cannot increase your count.'
        });
      } else {
        io.to(activeUser.socketId).emit('userUnblocked', {
          message: 'You have been unblocked by the admin. You can now increase your count.'
        });
      }
    }
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error updating user: ' + error.message });
  }
});

app.delete('/api/users/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });
  await User.findByIdAndDelete(req.params.id);
  // Emit updated user list to all admin clients
  const updatedUsers = await User.find().select('email role clickCount isBlocked');
  io.emit('updateActiveUsers', updatedUsers);
  res.json({ message: 'User deleted successfully' });
});

// Socket.io Logic
const activeUsers = new Map();

io.on('connection', (socket) => {
  socket.on('playerConnected', async ({ token }) => {
    try {
      const decoded = jwt.verify(token, 'ABCD1234');
      const user = await User.findById(decoded.id);
      if (!user || user.isBlocked) {
        socket.emit('userBlocked', {
          message: 'You have been blocked by the admin. You cannot increase your count.'
        });
        return;
      }

      // Store user with role in activeUsers
      activeUsers.set(socket.id, { ...user.toObject(), socketId: socket.id });
      
      // Emit updated user list to all admin clients
      const allUsers = await User.find().select('email role clickCount isBlocked');
      io.emit('updateActiveUsers', allUsers);

      socket.on('bananaClick', async () => {
        try {
          if (user.isBlocked) {
            socket.emit('userBlocked', {
              message: 'You have been blocked by the admin. You cannot increase your count.'
            });
            return;
          }
          user.clickCount += 1;
          await user.save();
          socket.emit('updateClickCount', { clickCount: user.clickCount });
          // Emit updated rankings to all clients (for player dashboard)
          io.emit('updateRankings', await User.find().sort({ clickCount: -1 }));
          // Emit updated user list to all admin clients
          const updatedUsers = await User.find().select('email role clickCount isBlocked');
          io.emit('updateActiveUsers', updatedUsers);
        } catch (error) {
          console.error('Banana click error:', error);
        }
      });

      socket.on('disconnect', async () => {
        activeUsers.delete(socket.id);
        // Emit updated user list to all admin clients
        const updatedUsers = await User.find().select('email role clickCount isBlocked');
        io.emit('updateActiveUsers', updatedUsers);
      });
    } catch (error) {
      console.error('Socket error:', error);
    }
  });
});

server.listen(5000, () => {
  console.log('Server running on port 5000');
});