

module.exports = (req, res, next) => {
  if (!req.user || !["admin", "teacher"].includes(req.user.role)) {
    return res
      .status(403)
      .json({ error: "Access denied: Teacher or admin role required" });
  }
  next();
};