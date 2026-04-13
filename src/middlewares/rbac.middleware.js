const allowRole = (role) => {
  return (req, res, next) => {
    try {
      let loggedinUserRole = req.authUser.role;
      if (!loggedinUserRole) {
        throw {
          code: 403,
          message: "Role is not assigned to user",
          status: "ROLE_NOT_ASSIGNED",
        };
      }

      if (
        (typeof role === "string" && loggedinUserRole === role) ||
        (Array.isArray(role) && role.includes(loggedinUserRole))
      ) {
        next();
      } else {
        throw {
          code: 403,
          message: "Access denied",
          status: "PERMISSION_DENIED",
        };
      }
    } catch (exception) {
      next(exception);
    }
  };
};

module.exports = {
  allowRole,
};
