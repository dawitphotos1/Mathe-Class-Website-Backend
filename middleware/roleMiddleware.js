const roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res
        .status(401)
        .json({ success: false, error: "Unauthorized: No user role found" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "Forbidden: Insufficient role permissions",
      });
    }
    next();
  };
};

module.exports = roleMiddleware;
