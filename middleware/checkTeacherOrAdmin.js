// module.exports = function (req, res, next) {
//   const user = req.user;
//   if (!user || (user.role !== "teacher" && user.role !== "admin")) {
//     return res.status(403).json({ success: false, error: "Access denied" });
//   }
//   next();
// };



module.exports = (req, res, next) => {
  if (!req.user || !["admin", "teacher"].includes(req.user.role)) {
    return res
      .status(403)
      .json({ error: "Access denied: Teacher or admin role required" });
  }
  next();
};