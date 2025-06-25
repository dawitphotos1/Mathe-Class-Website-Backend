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

// middleware/roleMiddleware.js
module.exports = function roleMiddleware(allowedRoles = []) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({ error: "Forbidden: Insufficient role permissions" });
    }
    next();
  };
};

module.exports = roleMiddleware;
