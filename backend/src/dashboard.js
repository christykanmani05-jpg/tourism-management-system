// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // to serve your index.html

// Handle contact form submission
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  console.log(`Received contact: ${name}, ${email}, ${message}`);
  res.json({ success: true, message: `Thanks, ${name}! We'll be in touch.` });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
