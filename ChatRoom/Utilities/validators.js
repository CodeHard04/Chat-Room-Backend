exports.validatePassword = (password) => {
    if (password.length < 6) return "Password must be at least 6 characters long";
    if (password.length > 20)
      return "Password can not be more than 20 characters long";
    if (!password.match(/[a-z]/))
      return "Password must contain at least one lowercase letter";
    if (!password.match(/[A-Z]/))
      return "Password must contain at least one uppercase letter";
    if (!password.match(/[0-9]/))
      return "Password must contain at least one number";
    if (!password.match(/[^a-zA-Z0-9]/))
      return "Password must contain at least one special character";
    return null;
};