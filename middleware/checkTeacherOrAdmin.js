module.exports = function (req, res, next) {
  const user = req.user;
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    return res.status(403).json({ success: false, error: "Access denied" });
  }
  next();
};
