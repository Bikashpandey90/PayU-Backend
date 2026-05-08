const { checkLogin } = require("../../middlewares/auth.middleware");
const { bodyValidator } = require("../../middlewares/bodyvalidator.middleware");
const { allowRole } = require("../../middlewares/rbac.middleware");
const khaltiSvc = require("../integration/khalti.service");
const transactionCtrl = require("./transaction.controller");
const { transactionDataDTO } = require("./transaction.validator");

const transactionRouter = require("express").Router();

transactionRouter.post(
  "/create",
  checkLogin,
  allowRole(["user", "admin"]),
  bodyValidator(transactionDataDTO),
  transactionCtrl.createTransaction,
);

transactionRouter.post(
  "/load",
  checkLogin,
  allowRole(["admin", "user"]),
  transactionCtrl.loadWallet,
);

transactionRouter.get(
  "/list",
  checkLogin,
  allowRole(["admin", "user"]),
  transactionCtrl.listTransactions,
);
transactionRouter.get(
  "/detail/:id",
  checkLogin,
  allowRole(["admin", "user"]),
  transactionCtrl.detail,
);

transactionRouter.post(
  "/verify",
  checkLogin,
  allowRole(["admin", "user"]),
  transactionCtrl.verify,
);

transactionRouter.get(
  "/request-receipt/:id",
  checkLogin,
  allowRole(["admin", "user"]),
  transactionCtrl.getReceipt,
);
transactionRouter.post(
  "/request-statement",
  checkLogin,
  allowRole(["admin", "user"]),
  transactionCtrl.getStatement,
);

transactionRouter.get(
  "/get-anal",
  checkLogin,
  allowRole(["user", "admin"]),
  transactionCtrl.getSpendingAnalytics,
);

transactionRouter.get("/bus-routes", transactionCtrl.getBusRoutes);
transactionRouter.post("/buses", transactionCtrl.getBuses);
transactionRouter.post("/seats", transactionCtrl.getSeats);

transactionRouter.post(
  "/topup",
  checkLogin,
  allowRole(["admin", "user"]),
  transactionCtrl.balanceTopUp,
);
transactionRouter.get("/zoo", transactionCtrl.zoodetails);

transactionRouter.post("/antivirus-details", transactionCtrl.antivirusDetails);

module.exports = transactionRouter;
