const accountRouter = require("../modules/account/account.router");
const authRouter = require("../modules/auth/auth.router");
const transactionRouter = require("../modules/transactions/transaction.router");
const utilityRouter = require("../modules/utilities/utility.router");

const router = require("express").Router();

router.use("/auth", authRouter);
router.use("/transaction", transactionRouter);
router.use("/account", accountRouter);
router.use("/utility", utilityRouter);



module.exports = router;
