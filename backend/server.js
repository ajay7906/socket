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
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/click-game', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

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
    const decoded = jwt.verify(token, 'ABCD1234'); // Use a secure secret key in production
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
    res.status(400).json({ message: 'Error registering user' });
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

    const token = jwt.sign({ id: user._id, role: user.role }, 'ABCD1234', { expiresIn: '24h' });
    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// User Management Routes
app.get('/api/users', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });
  const users = await User.find();
  res.json(users);
});

app.put('/api/users/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });
  const { isBlocked } = req.body;
  await User.findByIdAndUpdate(req.params.id, { isBlocked });
  res.json({ message: 'User updated successfully' });
});

app.delete('/api/users/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted successfully' });
});

// Socket.io Logic
const activeUsers = new Map();

io.on('connection', (socket) => {
  socket.on('playerConnected', async ({ token }) => {
    try {
      const decoded = jwt.verify(token, 'secret_key');
      const user = await User.findById(decoded.id);
      if (!user || user.isBlocked) return;

      activeUsers.set(socket.id, user);
      io.emit('updateActiveUsers', Array.from(activeUsers.values()));

      socket.on('bananaClick', async () => {
        user.clickCount += 1;
        await user.save();
        socket.emit('updateClickCount', { clickCount: user.clickCount });
        io.emit('updateRankings', await User.find().sort({ clickCount: -1 }));
      });

      socket.on('disconnect', () => {
        activeUsers.delete(socket.id);
        io.emit('updateActiveUsers', Array.from(activeUsers.values()));
      });
    } catch (error) {
      console.error('Socket error:', error);
    }
  });
});

server.listen(5000, () => {
  console.log('Server running on port 5000');
});