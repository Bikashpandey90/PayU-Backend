const accountRouter = require("../modules/account/account.router");
const authRouter = require("../modules/auth/auth.router");
const transactionRouter = require("../modules/transactions/transaction.router");

const router = require("express").Router();

router.use("/auth", authRouter);
router.use("/transaction", transactionRouter);
router.use("/account", accountRouter);


module.exports = router;
