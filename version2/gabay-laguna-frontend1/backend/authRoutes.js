const express = require('express');
const router = express.Router();

const users = [
  { id: 1, email: 'admin@gmail.com', password: 'admin123', role: 'admin' },
  { id: 2, email: 'guide@gmail.com', password: 'guide123', role: 'guide' },
  { id: 3, email: 'tourist@gmail.com', password: 'tourist123', role: 'tourist' },
];

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    res.status(200).json({ message: 'Login successful', user });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

module.exports = router;
