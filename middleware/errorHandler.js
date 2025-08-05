
// const errorHandler = (err, req, res, next) => {
//   console.error(`[${new Date().toISOString()}] Error:`, {
//     message: err.message,
//     stack: err.stack,
//     path: req.path,
//     method: req.method,
//     body: req.body,
//     headers: req.headers,
//     userId: req.user?.id,
//   });

//   const statusCode = err.statusCode || 500;
//   const message = statusCode === 500 ? "Internal server error" : err.message;

//   res.status(statusCode).json({
//     success: false,
//     message,
//     ...(process.env.NODE_ENV === "development" && {
//       stack: err.stack,
//       error: err.message,
//       requestBody: req.body,
//       requestHeaders: req.headers,
//     }),
//   });
// };

// module.exports = errorHandler;




module.exports = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
  });

  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    message: statusCode === 500 ? "Internal Server Error" : err.message,
  };

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
    response.details = err.message;
  }

  res.status(statusCode).json(response);
};
