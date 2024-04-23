const errorMiddleware = (err, req, res, next) => {
  const defaultError = {
    statusCode: 404,
    success: "falied",
    message: err,
  };

  if (err?.name === "ValidationError") {
    defaultError.statusCode = 404;

    defaultError.message = Object.values(err.errors) // Correction: Change 'err, errors' to 'err.errors'
      .map((el) => el.message)
      .join(",");
  }

  //duplicate error

  if (err.code && err.code === 11000) {
    defaultError.statusCode = 404;
    defaultError.message = `${Object.values(
      err.keyValue
    )} field has to be unique!`;
  }

  res.status(defaultError.statusCode).json({
    success: defaultError.success,
    message: defaultError.message,
  });
};

module.exports = errorMiddleware; // Utilisation de module.exports pour exporter le middleware