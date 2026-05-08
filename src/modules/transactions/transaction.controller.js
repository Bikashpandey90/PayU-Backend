const generateReceipt = require("../../utilities/receipt");
const generateStatement = require("../../utilities/statement");
const accountSvc = require("../account/account.service");
const authSvc = require("../auth/auth.service");
const khaltiSvc = require("../integration/khalti.service");
const transactionSvc = require("./transaction.service");
const crypto = require("crypto");

class TransactionController {
  createTransaction = async (req, res, next) => {
    try {
      const data = await transactionSvc.initialCheckLayer(req, res);

      const transaction = await transactionSvc.transaction({
        from: data.fromAccount,
        to: data.toAccount,
        amount: data.amount,
        idempotencyKey: data.idempotencyKey,
      });

      await transactionSvc.sendTransactionEmail(
        data.fromAccount.user.name,
        data.amount,
        data.fromAccount.user.email,
        data.toAccount.user.name,
        transaction._id,
        data.toAccount.user.email,
      );

      return res.status(200).json({
        detail: transaction,
        message: "Transaction Completed Successfully!",
        status: "TRANSACTION_SUCCESS",
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };

 

  balanceTopUp = async (req, res, next) => {
    try {
      const { number, amount, service } = req.body;
      const userId = req.authUser._id;
      const userAccount = await accountSvc.getSingleItemByFilter({
        user: userId,
      });

      const admin = await authSvc.getSingleUserByFilter({ role: "admin" });
      const adminAccount = await accountSvc.getSingleItemByFilter({
        user: admin._id,
      });
      const idempotencyKey = crypto.randomUUID();
      const response = await khaltiSvc.rechargeMobile({
        number,
        amount,
        serviceName: service,
      });
      console.log(response);
      if (!response.status) {
        return res.status(400).json({ message: "Recharge failed" });
      }
      const transaction = await transactionSvc.transaction({
        from: userAccount,
        to: adminAccount,
        amount,
        idempotencyKey,
        code: "BALANCE_TOPUP",
      });
      return res.json({
        success: true,
        response,
        transaction: transaction,
        message: "Top up success!",
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };

  getSpendingAnalytics = async (req, res, next) => {
    try {
      const user = req.authUser;
      const type = req.query.type === "month" ? "month" : "week";

      const account = await accountSvc.getSingleItemByFilter({
        user: user._id,
      });

      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }

      const now = new Date();
      let startDate;

      if (type === "week") {
        startDate = new Date();
        startDate.setDate(now.getDate() - 6); // last 7 days
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const transactions = await transactionSvc.listAllItems({
        skip: 0,
        limit: 0,
        filter: {
          from: account._id,
          createdAt: { $gte: startDate, $lte: now },
          status: "COMPLETED",
        },
      });

      let result = [];

      // ✅ WEEK (last 7 days EXACT, not weekday names)
      if (type === "week") {
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(now.getDate() - i);

          const label = date.toLocaleDateString("en-US", {
            weekday: "short",
          });

          const total = transactions
            .filter(
              (txn) =>
                new Date(txn.createdAt).toDateString() === date.toDateString(),
            )
            .reduce((sum, txn) => sum + txn.amount, 0);

          result.push({ label, amount: total });
        }
      }

      // ✅ MONTH (correct number of days)
      else {
        const daysInMonth = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
        ).getDate();

        for (let i = 1; i <= daysInMonth; i++) {
          const total = transactions
            .filter((txn) => new Date(txn.createdAt).getDate() === i)
            .reduce((sum, txn) => sum + txn.amount, 0);

          result.push({ label: i.toString(), amount: total });
        }
      }

      return res.json({
        status: "SUCCESS",
        detail: result,
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };

  loadWallet = async (req, res, next) => {
    try {
      const { amount, provider, transaction_uuid } = req.body;
      const user = req.authUser;

      const product_code = "EPAYTEST";

      const total_amount = amount;
      const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
      const secret = process.env.ESEWA_SECRET;
      const signature = crypto
        .createHmac("sha256", secret)
        .update(message)
        .digest("base64");

      const admin = await authSvc.getSingleUserByFilter({
        role: "admin",
      });
      const userAccount = await accountSvc.getSingleItemByFilter({
        user: user._id,
      });
      const adminAccount = await accountSvc.getSingleItemByFilter({
        user: admin._id,
      });

      if (provider === "esewa") {
        const transaction = await transactionSvc.createWalletTransaction({
          from: adminAccount,
          to: userAccount,
          amount: total_amount,
          idempotencyKey: transaction_uuid,
          code: "ESEWA_LOAD",
        });
        return res.json({
          detail: {
            url: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
            formData: {
              amount: amount,
              tax_amount: 0,
              total_amount: total_amount,
              transaction_uuid,
              product_code,
              product_service_charge: 0,
              product_delivery_charge: 0,
              success_url: `${process.env.FRONETEND_BASE_URL}/payment/success`,
              failure_url: `${process.env.FRONETEND_BASE_URL}/payment/failure`,
              signed_field_names: "total_amount,transaction_uuid,product_code",
              signature,
            },
          },
          message: "Initiate success!",
          status: "INITIATING",
        });
      }

      if (provider === "khalti") {
        const khaltiResponse = await khaltiSvc.initiatePayment({
          amount,
          purchase_order_id: transaction_uuid,
          purchase_order_name: "Wallet Load",
        });
        await transactionSvc.createWalletTransaction({
          from: adminAccount,
          to: userAccount,
          amount,
          idempotencyKey: transaction_uuid,
          code: "KHALTI_LOAD",
        });

        return res.json({
          detail: {
            payment_url: khaltiResponse.payment_url,
            pidx: khaltiResponse.pidx,
          },
          message: "Khalti initiated",
          status: "INITIATED",
        });
      }
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };
  listTransactions = async (req, res, next) => {
    try {
      const user = req.authUser;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const type = req.query.type;

      const skip = (page - 1) * limit;

      const account = await accountSvc.getSingleItemByFilter({
        user: user._id,
      });
      if (!account) {
        return res.status(400).json({
          message: "Account not found",
        });
      }
      let filter = {};
      if (type === "sent") {
        filter.from = account._id;
      } else if (type === "received") {
        filter.to = account._id;
      } else {
        filter.$or = [{ from: account._id }, { to: account._id }];
      }
      const transactions = await transactionSvc.listAllItems({
        skip,
        limit,
        filter,
      });

      return res.status(200).json({
        message: "Transactions fetched successfully",
        detail: transactions,
        options: {
          page,
          limit,
        },
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };
  detail = async (req, res, next) => {
    try {
      const id = req.params.id;
      const user = req.authUser;
      const filter = { _id: id };

      if (user.role !== "admin") {
        const account = await accountSvc.getSingleItemByFilter({
          user: user._id,
        });
        if (!account) {
          return res.status(400).json({
            message: "Account not found",
          });
        }
        filter.$or = [{ from: account._id }, { to: account._id }];
      }

      const response = await transactionSvc.getSingleItemByFilter(filter);
      if (!response) {
        return res.status(404).json({
          message: "Transaction not found",
        });
      }

      return res.json({
        message: "Transaction detail fetched successfully",
        detail: response,
        options: null,
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };
  verify = async (req, res, next) => {
    try {
      const { data } = req.body;
      if (!data) {
        return res.status(400).json({
          message: "Missing fields",
        });
      }
      const decoded = JSON.parse(Buffer.from(data, "base64").toString());

      console.log("Decoded eSewa:", decoded);

      const {
        transaction_uuid,
        total_amount,
        status,
        signature,
        product_code,
        signed_field_names,
        transaction_code,
      } = decoded;

      const message = `transaction_code=${transaction_code},status=${status},total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code},signed_field_names=${signed_field_names}`;

      const expectedSignature = crypto
        .createHmac("sha256", "8gBm/:&EnhH.1/q")
        .update(message)
        .digest("base64");

      if (expectedSignature !== signature) {
        return res.status(400).json({
          message: "Invalid signature",
        });
      }
      const txn = await transactionSvc.getSingleItemByFilter({
        idempotencyKey: transaction_uuid,
      });

      if (!txn) {
        return res.status(404).json({
          message: "Transaction not found",
        });
      }
      if (txn.status === "COMPLETED") {
        return res.json({
          message: "Already verified",
          detail: txn,
        });
      }
      const url = `https://rc.esewa.com.np/api/epay/transaction/status/?product_code=EPAYTEST&total_amount=${total_amount}&transaction_uuid=${transaction_uuid}`;
      const response = await fetch(url);
      const JsonResponse = await response.json();

      console.log("eSewa verify response:", JsonResponse);

      if (JsonResponse.status !== "COMPLETE") {
        await transactionSvc.update(txn._id, {
          status: JsonResponse.status,
        });

        return res.status(400).json({
          detail: JsonResponse,
          message: "Payment not completed",
        });
      }

      const transaction = await transactionSvc.confirmWalletTransaction({
        amount: total_amount,
        idempotencyKey: transaction_uuid,
      });

      return res.json({
        message: "Wallet loaded successfully",
        detail: transaction,
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };

  getReceipt = async (req, res, next) => {
    try {
      const user = req.authUser;
      const account = await accountSvc.getSingleItemByFilter({
        user: user._id,
      });
      const transactionId = req.params.id;
      if (!transactionId) {
        return res.status(404).json({
          message: "Transaction id is required",
        });
      }

      const transaction = await transactionSvc.getSingleItemByFilter({
        _id: transactionId,
      });

      if (!transaction) {
        return res.status(404).json({
          message: "Transaction not found",
        });
      }
      if (
        account._id.toString() !== transaction.to?._id?.toString() &&
        account._id.toString() !== transaction.from?._id?.toString()
      ) {
        return res.status(403).json({
          message: "Unauthorized",
        });
      }
      if (transaction.status !== "COMPLETED") {
        return res.status(401).json({
          message: "Transaction not completed ",
        });
      }
      const receipt = await generateReceipt(transaction);
      if (!receipt || !receipt.url) {
        return res.status(500).json({
          message: "Receipt generation failed",
        });
      }

      return res.json({
        status: "GENERATION_SUCCESS",
        data: {
          transaction,
          receiptUrl: receipt.url,
        },
      });
    } catch (exception) {
      console.log(exception);
    }
  };

  getStatement = async (req, res, next) => {
    try {
      const user = req.authUser;
      const account = await accountSvc.getSingleItemByFilter({
        user: user._id,
      });
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      const { start, end } = req?.body;

      const filter = { $or: [{ from: account._id }, { to: account._id }] };
      if (start || end) {
        filter.createdAt = {};
        if (start) filter.createdAt.$gte = new Date(start);
        if (end) filter.createdAt.$lte = new Date(end);
      }
      let skip = 0;
      let limit = 0;

      const transactions = await transactionSvc.listAllItems({
        skip,
        limit,
        filter,
      });
      if (!transactions.length) {
        return res
          .status(404)
          .json({ message: "No transactions found in this period" });
      }

      const statement = await generateStatement(user, transactions, {
        start,
        end,
      });

      return res.json({
        status: "SUCCESS",
        data: { statementUrl: statement.url },
      });
    } catch (exception) {
      console.log(exception);
    }
  };

  getBusRoutes = async (req, res, next) => {
    try {
      const response = await khaltiSvc.getRoutes();
      return res.json({
        status: "SUCCESS",
        data: response,
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };

  getBuses = async (req, res, next) => {
    try {
      const response = await khaltiSvc.fetchBuses(req.body);
      return res.json({
        status: "SUCCESS",
        data: response,
      });
    } catch (exception) {
      console.log(exception);
    }
  };
  getSeats = async (req, res, next) => {
    try {
      const response = await khaltiSvc.getSeatInfo(req.body);
      return res.json({
        status: "SEATS",
        data: response,
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };

  zoodetails = async (req, res, next) => {
    try {
      const response = await khaltiSvc.zoodetails();
      return res.json({
        status: "ZOO",
        data: response,
      });
    } catch (exception) {
      next(exception);
    }
  };

  antivirusDetails = async (req, res, next) => {
    try {
      const response = await khaltiSvc.fetchAntiDetails(req.body);
      return res.json({
        status: "ANTI_VIRUS",
        data: response,
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };
}
const transactionCtrl = new TransactionController();
module.exports = transactionCtrl;
