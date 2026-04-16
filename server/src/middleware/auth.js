const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'timer_super_secret_key_123!';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
}

function generateToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
}

module.exports = {
  authenticateToken,
  generateToken,
  JWT_SECRET
};
