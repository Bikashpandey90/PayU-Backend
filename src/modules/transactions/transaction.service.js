const { default: mongoose } = require("mongoose");
const transactionModel = require("./transaction.model");
const ledgerSvc = require("../ledger/ledger.service");
const emailSvc = require("../../services/mail.service");
const accountSvc = require("../account/account.service");
const authSvc = require("../auth/auth.service");

class TransactionService {
  sendTransactionEmail = async (name, amount, email, to, id, toEmail) => {
    try {
      const transactionId = `TXN${Date.now()}`;
      const date = new Date().toLocaleString();

      let msg = `
<!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background:#faf8ff; font-family: Arial, sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:0;">
<tr>
<td align="center">

<!-- MAIN CONTAINER -->
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden;">

  <!-- HEADER -->
  <tr >
    <td style="padding:20px 30px; text-align:center; font-size:20px; font-weight:bold; color:#3F95EC;">
      PayU
    </td>
  </tr>

  <!-- HERO -->
  <tr style="border-radius:20px;">
    <td style="background:#DAE2FD; padding:30px;">
      
      <!-- STATUS -->
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="background:#e8edff; padding:6px 10px; border-radius:20px; font-size:12px; color:#3F95EC; font-weight:bold;">
             Payment Completed
          </td>
        </tr>
      </table>

      <h2 style="margin:15px 0 10px; font-size:22px; color:#131b2e;">
        Your transaction was successful
      </h2>

      <p style="margin:0 0 20px; color:#555;">
        The funds have been securely transferred to the recipient.
      </p>

      <p style="margin:0; font-size:12px; color:#666;">Amount Sent</p>
      <p style="margin:5px 0 0; font-size:36px; font-weight:bold; color:#3F95EC;">
        Rs. ${amount}
      </p>

    </td>
  </tr>

  <!-- RECIPIENT + ACTION -->
  <tr>
    <td style="padding:20px;">
      
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>

          <!-- RECIPIENT -->
          <td width="50%" style="padding:10px;">
            <table width="100%" style="background:#f2f3ff; border-radius:10px; padding:15px;">
              <tr>
                <td style="font-size:12px; color:#777;">Recipient</td>
              </tr>
              <tr>
                <td style="font-size:16px; font-weight:bold; color:#131b2e;">
                  ${to}
                </td>
              </tr>
              <tr>
                <td style="font-size:12px; color:#777;">
                  ${toEmail}
                </td>
              </tr>
            </table>
          </td>

          <!-- ACTION -->
          <td width="50%" style="padding:10px;">
            <table width="100%" style="background:#f2f3ff; border-radius:10px; padding:15px;">
              <tr>
                <td style="font-size:12px; color:#777;">Next Step</td>
              </tr>
              <tr>
                <td align="center" style="padding-top:10px;">
                  <a href="#" style="
                    display:inline-block;
                    padding:10px 15px;
                    background:#3F95EC;
                    color:#fff;
                    text-decoration:none;
                    border-radius:6px;
                    font-size:12px;
                    font-weight:bold;
                  ">
                    Repeat Transfer
                  </a>
                </td>
              </tr>
            </table>
          </td>

        </tr>
      </table>

    </td>
  </tr>

  <!-- LEDGER -->
  <tr>
    <td style="padding:20px;">
      <table width="100%" style="background:#ffffff; border:1px solid #eee; border-radius:10px; padding:15px;">
        
        <tr>
          <td style="font-size:16px; font-weight:bold; padding-bottom:10px;">
            Transaction Ledger
          </td>
          <td align="right" style="font-size:12px; color:#777;">
            TXN${Date.now()}
          </td>
        </tr>

        <tr>
          <td style="padding:8px 0; color:#555;">Date</td>
          <td align="right">${new Date().toLocaleString()}</td>
        </tr>

        <tr>
          <td style="padding:8px 0; color:#555;">Funding Method</td>
          <td align="right">Wallet</td>
        </tr>

        <tr>
          <td style="padding:8px 0; color:#555;">Fee</td>
          <td align="right">Free</td>
        </tr>

        <tr>
          <td colspan="2" style="border-top:1px solid #eee; padding-top:10px;"></td>
        </tr>

        <tr>
          <td style="font-weight:bold;">Total</td>
          <td align="right" style="font-weight:bold; font-size:18px;">
            Rs. ${amount}
          </td>
        </tr>

      </table>
    </td>
  </tr>

  <!-- CTA -->
  <tr>
    <td align="center" style="padding:20px;">
      <a href="${process.env.FRONETEND_BASE_URL}/transactions/${id}" style="
        display:inline-block;
        width:80%;
        padding:15px;
        background:#3F95EC;
        color:#fff;
        text-decoration:none;
        border-radius:10px;
        font-weight:bold;
        font-size:14px;
      ">
        View Full Details
      </a>

      <p style="font-size:12px; color:#777; margin-top:10px;">
        Need help? Contact support
      </p>
    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="background:#DAE2FD; padding:20px; text-align:center;">
      <p style="font-size:12px; color:#555;">
        This is an automated email. Please do not reply.
      </p>
      <p style="font-size:12px; color:#888;">
        © 2026 PayU
      </p>
    </td>
  </tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;

      await emailSvc.sendEmail({
        to: email,
        subject: "Transaction Successful",
        message: msg,
      });
    } catch (exception) {
      console.log(exception);
      throw exception;
    }
  };

  initialCheckLayer = async (req, res, utility = false) => {
    try {
      const from = req.authUser._id;
      const { to, amount, idempotencyKey } = req.body;
      if (!from || !to || !amount || !idempotencyKey) {
        return res.status(400).json({
          message: "Required Fields are missing!s",
        });
      }
      const fromAccount = await accountSvc.getSingleItemByFilter({
        user: from,
      });
      const toAccount = await accountSvc.getSingleItemByFilter({ user: to });
      if (!fromAccount || !toAccount) {
        return res.status(400).json({
          message: "Invalid Account!",
          status: "ACCOUNT_NOT_FOUND",
        });
      }
      const transactionAlreadyExists = await this.getSingleItemByFilter({
        idempotencyKey: idempotencyKey,
      });
      if (transactionAlreadyExists) {
        if (transactionAlreadyExists.status === "COMPLETED") {
          return res.status(200).json({
            message: "Transaction already processed",
            detail: transactionAlreadyExists,
          });
        }
        if (transactionAlreadyExists.status === "PENDING") {
          return res.status(200).json({
            message: "Transaction is still processing",
          });
        }
        if (transactionAlreadyExists.status === "FAILED") {
          return res.status(500).json({
            message: "Transaction processing failed",
          });
        }
        if (transactionAlreadyExists.status === "REVERSED") {
          return res.status(500).json({
            message: "Transaction was reversed,please retry",
          });
        }
      }
      if (fromAccount.status !== "ACTIVE" || toAccount.status !== "ACTIVE") {
        return res.status(400).json({
          message: "Either account is not active!",
        });
      }

      const balance = await fromAccount.getBalance();

      if (fromAccount?.user?.role === "user") {
        if (balance < amount) {
          return res.status(400).json({
            message: `Insufficient Balance`,
          });
        }
      }

      const data = {
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
      };

      return data;
    } catch (exception) {
      console.log(exception);
      throw exception;
    }
  };

  serviceCheckLayer = async (req, service, maxAmount = 50000) => {
    try {
      const userId = req.authUser._id;
      const { amount, idempotencyKey } = req.body;
      if (!userId || !amount || !idempotencyKey || !service) {
        throw {
          status: 400,
          message: "Required fields missing",
        };
      }

      // validate amount
      if (Number(amount) <= 0) {
        throw {
          status: 400,
          message: "Invalid amount",
        };
      }

      if (Number(amount) > maxAmount) {
        throw {
          status: 400,
          message: `Maximum limit exceeded. Max: ${maxAmount}`,
        };
      }

      // validate service
      // if (allowedServices.length && !allowedServices.includes(service)) {
      //   throw {
      //     status: 400,
      //     message: "Invalid service provider",
      //   };
      // }

      const userAccount = await accountSvc.getSingleItemByFilter({
        user: userId,
      });

      if (!userAccount) {
        throw {
          status: 404,
          message: "User account not found",
        };
      }

      if (userAccount.status !== "ACTIVE") {
        throw {
          status: 400,
          message: "Account is not active",
        };
      }

      // balance check
      const balance = await userAccount.getBalance();

      if (userAccount?.user?.role === "user" && balance < amount) {
        throw {
          status: 400,
          message: "Insufficient balance",
        };
      }

      // duplicate transaction check
      const existing = await this.getSingleItemByFilter({
        idempotencyKey,
      });

      if (existing) {
        if (existing.status === "COMPLETED") {
          throw {
            status: 409,
            message: "Transaction already completed",
            detail: existing,
          };
        }

        if (existing.status === "PENDING") {
          throw {
            status: 409,
            message: "Transaction already processing",
          };
        }

        if (existing.status === "PROCESSING") {
          throw {
            status: 409,
            message: "Transaction processing",
          };
        }
      }

      // admin account
      const admin = await authSvc.getSingleUserByFilter({
        role: "admin",
      });

      if (!admin) {
        throw {
          status: 500,
          message: "Internal Server Error.",
          error_code: "ANF_DB_S_ERR",
        };
      }

      const adminAccount = await accountSvc.getSingleItemByFilter({
        user: admin._id,
      });

      if (!adminAccount) {
        throw {
          status: 500,
          message: "Internal Server Error.",
          error_code: "AANF_B_ERR",
        };
      }

      return {
        userAccount,
        adminAccount,
        amount: Number(amount),
        idempotencyKey,
      };
    } catch (exception) {
      console.log(exception);
      throw exception;
    }
  };

  transaction = async ({
    from,
    to,
    amount,
    idempotencyKey,
    code = "IN_APP_TRANSACTION",
  }) => {
    const session = await mongoose.startSession();
    let transaction;
    try {
      session.startTransaction();

      const createdTx = await transactionModel.create(
        [
          {
            from,
            to,
            amount,
            idempotencyKey,
            status: "PENDING",
            code: code,
          },
        ],
        { session },
      );

      transaction = createdTx[0];

      await ledgerSvc.createDoubleEntry({
        from,
        to,
        amount,
        transactionId: transaction._id,
        session,
      });

      await transactionModel.findByIdAndUpdate(
        transaction._id,
        { status: "COMPLETED" },
        { session },
      );

      await session.commitTransaction();

      if (
        transaction?.code !== "IN_APP_TRANSACTION" &&
        transaction?.code !== "ESEWA_LOAD"
      ) {
        delete transaction.to;
      }
      if (transaction?.code === "ESEWA_LOAD") {
        delete transaction.from;
      }

      return transaction;
    } catch (err) {
      await session.abortTransaction();
      if (transaction?._id) {
        await transactionModel.findByIdAndUpdate(transaction._id, {
          status: "FAILED",
        });
      }
      session.endSession();

      console.log(err);
      throw new Error("Transaction failed");
    } finally {
      session.endSession();
    }
  };

  createWalletTransaction = async ({
    from,
    to,
    amount,
    idempotencyKey,
    code = "ESEWA_LOAD",
  }) => {
    const session = await mongoose.startSession();
    let transaction;
    try {
      session.startTransaction();

      const createdTx = await transactionModel.create(
        [
          {
            from,
            to,
            amount,
            idempotencyKey,
            status: "PENDING",
            code: code,
          },
        ],
        { session },
      );

      transaction = createdTx[0];
      await session.commitTransaction();

      return transaction;
    } catch (err) {
      await session.abortTransaction();
      if (transaction?._id) {
        await transactionModel.findByIdAndUpdate(transaction._id, {
          status: "FAILED",
        });
      }
      session.endSession();

      console.log(err);
      throw new Error("Transaction failed");
    } finally {
      session.endSession();
    }
  };

  confirmWalletTransaction = async ({ amount, idempotencyKey }) => {
    const session = await mongoose.startSession();
    let transaction;
    try {
      session.startTransaction();

      transaction = await transactionModel.findOneAndUpdate(
        {
          idempotencyKey,
          status: "PENDING",
        },
        {
          status: "PROCESSING",
        },
        {
          new: true,
          session,
        },
      );

      if (!transaction) {
        await session.abortTransaction();

        return await this.getSingleItemByFilter({ idempotencyKey });
      }

      await ledgerSvc.createDoubleEntry({
        from: transaction.from._id,
        to: transaction.to._id,
        amount: amount,
        transactionId: transaction._id,
        session,
      });

      await transactionModel.findByIdAndUpdate(
        transaction._id,
        { status: "COMPLETED" },
        { session },
      );

      await session.commitTransaction();

      return transaction;
    } catch (err) {
      await session.abortTransaction();
      if (transaction?._id) {
        await transactionModel.findByIdAndUpdate(transaction._id, {
          status: "FAILED",
        });
      }
      session.endSession();

      console.log(err);
      throw new Error("Transaction failed");
    } finally {
      session.endSession();
    }
  };
  getSingleItemByFilter = async (filter) => {
    try {
      const response = await transactionModel
        .findOne(filter)
        .populate({
          path: "from",
          select: ["_id", "user", "status"],
          populate: {
            path: "user",
            select: ["_id", "name", "email", "image"],
          },
        })
        .populate({
          path: "to",
          select: ["_id", "user", "status"],
          populate: {
            path: "user",
            select: ["_id", "name", "email", "image"],
          },
        })
        .lean();

      if (!response) {
        return null;
      }

      if (
        response?.code !== "IN_APP_TRANSACTION" &&
        response?.code !== "ESEWA_LOAD"
      ) {
        delete response.to;
      }
      if (response?.code === "ESEWA_LOAD") {
        delete response.from;
      }

      return response;
    } catch (exception) {
      console.log(exception);
      throw exception;
    }
  };
  listAllItems = async ({ skip = 0, limit = 20, filter = {} }) => {
    try {
      const response = await transactionModel
        .find(filter, {})
        .populate({
          path: "from",
          select: ["_id", "user", "status"],
          populate: {
            path: "user",
            select: ["_id", "name", "email", "image"],
          },
        })
        .populate({
          path: "to",
          select: ["_id", "user", "status"],
          populate: {
            path: "user",
            select: ["_id", "name", "email", "image"],
          },
        })
        .skip(skip)
        .limit(limit)
        .sort({
          createdAt: "desc",
        });
      return response;
    } catch (exception) {
      console.log(exception);
      throw exception;
    }
  };
}

const transactionSvc = new TransactionService();
module.exports = transactionSvc;
