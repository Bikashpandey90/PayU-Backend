const UserModel = require("../user.model");

class WalletService {
  debit = async ({ userId, amount, session }) => {
    try {
      const updated = await UserModel.findOneAndUpdate(
        { _id: userId, balance: { $gte: amount } },
        { $inc: { balance: -amount } },
        { session, new: true },
      );

      if (!updated) {
        throw new Error("Insufficient balance");
      }

      return updated;
    } catch (exception) {
      consol.log(exception);
      throw exception;
    }
  };

  credit = async ({ userId, amount, session }) => {
    try {
      return await User.findByIdAndUpdate(
        userId,
        { $inc: { balance: amount } },
        { session, new: true },
      );
    } catch (exception) {
      console.log(exception);
      throw exception;
    }
  };
}

const walletSvc = new WalletService();
module.exports = walletSvc;
