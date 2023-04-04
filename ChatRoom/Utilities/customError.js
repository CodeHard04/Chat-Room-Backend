class CustomError extends Error {
    constructor(errorMessage, statusCode) {
      super();
      this.message = errorMessage || "Something went wrong";
      this.status = statusCode || 500;
      this.name = "CustomError";
    }
  }
  
  module.exports = CustomError;
  
