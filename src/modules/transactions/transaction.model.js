const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
      required: true,
      index: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["PENDING", "COMPLETED", "FAILED", "REVERSED", "PROCESSING"],
      },
      default: "PENDING",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    idempotencyKey: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    code: {
      type: String,
      enum: {
        values: [
          "IN_APP_TRANSACTION",
          "KHALTI_LOAD",
          "ESEWA_LOAD",
          "IMEPAY_LOAD",
          "BALANCE_TOPUP",
        ],
      },
      required: true,
      default: "IN_APP_TRANSACTION",
    },
  },
  {
    timestamps: true,
  },
);

const transactionModel = mongoose.model("transaction", transactionSchema);
module.exports = transactionModel;
