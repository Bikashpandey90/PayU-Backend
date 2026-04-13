const ledgerModel = require("./ledger.model");

class LedgerService {
  createEntry = async ({ account, amount, transactionId, type, session }) => {
    try {
      const response = await ledgerModel.create(
        [
          {
            account,
            amount,
            transaction: transactionId,
            type,
          },
        ],
        {
          session,
        },
      );

      return response;
    } catch (exception) {
      console.log(exception);
      throw exception;
    }
  };

  createDoubleEntry = async ({ from, to, amount, transactionId, session }) => {
    try {
      await this.createEntry({
        account: from,
        amount,
        transactionId,
        type: "DEBIT",
        session,
      });

      await this.createEntry({
        account: to,
        amount,
        transactionId,
        type: "CREDIT",
        session,
      });
    } catch (exception) {
      console.log(exception);
      throw exception;
    }
  };

  getAccountLedger = async (accountId) => {
    try {
      const response = await ledgerModel
        .find({ account: accountId })
        .sort({ createdAt: -1 });
    } catch (exception) {
      console.log(exception);
      throw exception;
    }
  };
}

const ledgerSvc = new LedgerService();
module.exports = ledgerSvc;
