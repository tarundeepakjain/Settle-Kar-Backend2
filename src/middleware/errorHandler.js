export const errorHandler = (err, req, res, next) => {
  console.error(err);

  const status = Number(err.statusCode || 500);
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    success: false,
    message,
  });
};
