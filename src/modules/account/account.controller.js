const accountSvc = require("./account.service");

class AccountController {
  fetchMyAccount = async (req, res, next) => {
    try {
      const user = req.authUser;
      const account = await accountSvc.getSingleItemByFilter({
        user: user._id,
      });
      if (!account) {
        return res.status(404).json({
          message: "Account not found!",
        });
      }
      const balance = await account.getBalance();
      console.log(balance);
      const accountObj = account.toObject();
      accountObj.balance = balance;
      res.json({
        detail: accountObj,
        message: "Your account!",
        status: "ACCOUNT_FETCHED",
        options: null,
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };
}

const accountCtrl = new AccountController();
module.exports = accountCtrl;
