const authRouter = require("express").Router();
const {
  checkRefreshToken,
  checkLogin,
} = require("../../middlewares/auth.middleware");
const { bodyValidator } = require("../../middlewares/bodyvalidator.middleware");
const uploader = require("../../middlewares/multipart-parser.middleware");
const { allowRole } = require("../../middlewares/rbac.middleware");
const authCtrl = require("./auth.controller");
const {
  registerDataDTO,
  loginDTO,
  activationDTO,
  updateProfileDTO,
  resendDTO,
} = require("./auth.validator");

authRouter.post(
  "/register",
  uploader().single("image"),
  bodyValidator(registerDataDTO),
  authCtrl.register,
);

authRouter.post(
  "/activate",
  bodyValidator(activationDTO),
  authCtrl.activateUser,
);
authRouter.post("/resend-otp", bodyValidator(resendDTO), authCtrl.resendOtp);

authRouter.post("/login", bodyValidator(loginDTO), authCtrl.login);

authRouter.get("/me", checkLogin, authCtrl.getLoggedInUser);
authRouter.get("/refresh", checkRefreshToken, authCtrl.getRefreshToken);

authRouter.get(
  "/user/:id",
  checkLogin,
  allowRole(["admin", "user"]),
  authCtrl.findUser,
);

authRouter
  .route("/:id")
  .delete(checkLogin, allowRole("admin"), authCtrl.delete);

authRouter.patch(
  "/update-profile",
  checkLogin,
  uploader().single("image"),
  bodyValidator(updateProfileDTO),
  authCtrl.updateProfile,
);
authRouter.get(
  "/list",
  checkLogin,
  allowRole(["user", "admin"]),
  authCtrl.listUsers,
);

module.exports = authRouter;
