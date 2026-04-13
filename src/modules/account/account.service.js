const qrSvc = require("../../services/qr.services");
const accountModel = require("./account.model");

class AccountService {
  createAccount = async (user) => {
    try {
      const qrCode = await qrSvc.createSelfQr(user);
      console.log(qrCode);
      const account = await accountModel.create({
        user: user,
        qr: qrCode,
      });
      return account;
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };
  getSingleItemByFilter = async (filter) => {
    try {
      const response = await accountModel
        .findOne(filter)
        .populate("user", ["_id", "name", "email", "status", "role"]);

      return response;
    } catch (exception) {
      console.log(response);
      next(exception);
    }
  };
  getAccountBalance = async (userId) => {
    try {
      const account = await accountModel.findOne({
        user: userId,
      });

      if (!account) {
        return res.status(404).json({
          message: "Account not found",
        });
      }

      const balance = await account.getBalance();

      res.status(200).json({
        accountId: account._id,
        balance: balance,
      });
    } catch (exception) {
      console.log(response);
      next(exception);
    }
  };
}
const accountSvc = new AccountService();
module.exports = accountSvc;
