/**
 * Middleware to check if user is an admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
module.exports = (req, res, next) => {
  // Check if user exists in request (set by auth middleware)
  if (!req.user) {
    return res.status(401).json({ message: 'Acesso negado. Autenticação necessária.' });
  }

  // Check if user is admin
  if (!req.user.admin) {
    return res.status(403).json({ message: 'Acesso negado. Permissão de administrador necessária.' });
  }

  next();
};