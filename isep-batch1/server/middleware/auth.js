const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'isep_batch1_secret_jwt_key_2024';

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorization token required.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
}

module.exports = verifyToken;
module.exports.verifyToken = verifyToken;
module.exports.JWT_SECRET = JWT_SECRET;
