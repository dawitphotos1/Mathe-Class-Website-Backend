

// const roleMiddleware = (allowedRoles = []) => {
//   return (req, res, next) => {
//     const userRole = req.user?.role;

//     if (!userRole) {
//       return res.status(401).json({ error: "Unauthorized: No role found" });
//     }

//     if (!allowedRoles.includes(userRole)) {
//       return res.status(403).json({ error: "Forbidden: Access denied" });
//     }

//     next();
//   };
// };



// module.exports = roleMiddleware;



module.exports = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: "Forbidden: Access Denied" });
  }
  next();
};
