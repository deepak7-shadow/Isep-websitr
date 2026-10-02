/**
 * Role-based access control middleware for ISEP Portal (Member 3)
 */
function requireRole(...roles) {
  return (req, res, next) => {
    const currentUser = req.user || req.admin;

    if (!currentUser) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (!roles.includes(currentUser.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of the following roles: ${roles.join(', ')}`
      });
    }

    next();
  };
}

module.exports = {
  requireRole,
  requireAdmin: requireRole('admin'),
  requireHeadOrAdmin: requireRole('head', 'admin')
};
