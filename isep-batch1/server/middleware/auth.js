const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'isep_batch1_secret_jwt_key_2024';

module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authorization token required.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    // Keep compatibility with existing admin routes
    if (decoded.role === 'admin') {
      req.admin = decoded;
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};