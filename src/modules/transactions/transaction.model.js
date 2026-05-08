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
    receipt: {
      url: String,
      public_id: String,
      generatedAt: Date,
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
          "CABLECAR_TICKETING_SERVICE",
          "BUS_TICKETING_SERVICE",
          "ZOO_TICKETING_SERVICE",
          "ANTIVIRUS_PRODUCTS",
          "DATA_PACKS",
          "LANDLINE_RECHARGE",
          "WASTE_MANAGEMENT_SERVICE",
          "SOCIAL_SECURITY_SERVICE",
          "GOVERNMENT_PAYMENT",
          "EMI_SERVICE",
          "MEROSHARE_SERVICE",
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
