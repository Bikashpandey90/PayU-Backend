const mongoose = require("mongoose");
const { commonStr } = require("../common/schema");
const ledgerModel = require("./ledger/ledger.model");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      min: 2,
      max: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "others"],
        message: "{VALUE} is not supported",
      },
    },
    image: String,
    phone: String,
    address: String,
    otp: String,
    otpExpiryTime: Date,
    ...commonStr,
  },
  {
    timestamps: true,
    autoCreate: true,
    autoIndex: true,
  },
);

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
