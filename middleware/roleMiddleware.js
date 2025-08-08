// module.exports = (roles) => (req, res, next) => {
//   if (!req.user || !roles.includes(req.user.role)) {
//     return res.status(403).json({ error: "Forbidden: Access Denied" });
//   }
//   next();
// };



module.exports = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    console.warn(`Unauthorized access attempt by role: ${req.user?.role}`);
    return res.status(403).json({ error: "Forbidden: Access Denied" });
  }
  next();
};
