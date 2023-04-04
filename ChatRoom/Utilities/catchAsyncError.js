// To avoid try and catch blocks repeatation

const catchAsyncError = (fn) => {
    return (req, res, next) => {
      fn(req, res, next).catch(next);
    };
  };
  
  module.exports = catchAsyncError;