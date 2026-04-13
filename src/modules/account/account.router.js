const { checkLogin } = require("../../middlewares/auth.middleware");
const { allowRole } = require("../../middlewares/rbac.middleware");
const accountCtrl = require("./account.controller");

const accountRouter = require("express").Router();

accountRouter.get("/my-account", checkLogin, accountCtrl.fetchMyAccount);
// accountRouter.get(
//   "/load-inamount",
//   checkLogin,
//   allowRole("admin"),
//   accountCtrl.loadAmount
// );

module.exports = accountRouter;
