// const roleMiddleware = (roles) => {
//   return (req, res, next) => {
//     if (!req.user || !req.user.role) {
//       return res
//         .status(401)
//         .json({ success: false, error: "Unauthorized: No user role found" });
//     }
//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({
//         success: false,
//         error: "Forbidden: Insufficient role permissions",
//       });
//     }
//     next();
//   };
// };

// module.exports = roleMiddleware;



// roleMiddleware.js

const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(401).json({ error: "Unauthorized: No role found" });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: "Forbidden: Access denied" });
    }

    next();
  };
};

module.exports = roleMiddleware;
