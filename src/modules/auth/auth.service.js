const brcypt = require("bcryptjs");
const fileUploaderSvc = require("../../services/fileuploader.service");
const { randomStringGenerator } = require("../../utilities/helpers");
const UserModel = require("../user.model");
const emailSvc = require("../../services/mail.service");
class AuthService {
  transformUserRegister = async (req) => {
    try {
      let data = req.body;
      //password
      const salt = brcypt.genSaltSync(10);
      data.password = brcypt.hashSync(data.password, salt);
      delete data.confirmPassword;

      // brcypt.compareSync("Admin123#",data.password);

      let file = req.file; //single upload

      if (file) {
        data.image = await fileUploaderSvc.uploadFile(file.path, "/users");
      }

      data.otp = randomStringGenerator(6, false);
      data.otpExpiryTime = new Date(Date.now() + 300000);
      data.status = "inactive";

      return data;
    } catch (exception) {
      console.log(exception);
      throw exception;
    }
  };

  createUser = async (data) => {
    try {
      const userObj = new UserModel(data);
      return await userObj.save(); //insert or update
    } catch (exception) {
      console.log("Create user", exception);
      throw exception;
    }
  };
  sendActivationNotification = async (name, otp, email) => {
    try {
      let msg = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Activation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 10px 0;
            font-size: 24px;
            font-weight: bold;
            color: #333;
        }
        .content {
            font-size: 16px;
            color: #555;
            line-height: 1.6;
        }
        .otp {
            font-size: 20px;
            font-weight: bold;
            color: grey;
            text-align: center;
            padding: 10px;
            background: #f8f8f8;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            font-size: 12px;
            text-align: center;
            color: #888;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">Account Activation</div>
        <div class="content">
            <p>Dear ${name},</p>
            <p>Thank you for registering with us. Please activate your account by using the following OTP code:</p>
            <div class="otp">${otp}</div>
            <p>Warm regards,</p>
            <p>${process.env.SMTP_FROM}</p>
        </div>
        <div class="footer">
            <em>Please do not reply to this email directly.</em>
        </div>
    </div>
</body>
</html>
`;

      await emailSvc.sendEmail({
        to: email,
        subject: "Registration Success",
        message: msg,
      });
    } catch (exception) {
      console.log(exception);
      throw exception;
    }
  };

  getSingleUserByFilter = async (filter) => {
    try {
      const user = await UserModel.findOne(filter);
      if (!user) {
        throw {
          code: "422",
          status: "USER_NOT_FOUND",
          message: "User not found",
          detail: "",
        };
      }

      return user;
    } catch (exception) {
      console.log("GETSIGNLEUSERBYFILTER ERROR : ", exception);
      throw exception;
    }
  };

  userfind = async (filter) => {
    try {
      const user = await UserModel.findOne(filter, {
        password: 0,
        otp: 0,
        otpExpiryTime: 0,
        _v: 0,
        createdAt: 0,
        updatedAt: 0,
      });

      if (!user) {
        throw {
          code: "422",
          status: "USER_NOT_FOUND",
          message: "User not found",
          detail: "",
        };
      }
      return user;
    } catch (exception) {
      throw exception;
    }
  };

  resetOtp = async (user) => {
    try {
      //new otp
      let otp = randomStringGenerator(6, false);
      let expiryTime = new Date(Date.now() + 300000);

      user.otp = otp;
      user.otpExpiryTime = expiryTime;

      return await user.save();
    } catch (exception) {
      console.log("RESETOTP ERROR : ", exception);
      throw exception;
    }
  };
  activateUser = async (user) => {
    try {
      user.otp = null;
      user.otpExpiryTime = null;
      user.status = "active";

      return await user.save();
    } catch (exception) {
      console.log("ActivateUser", exception);
      throw exception;
    }
  };

  getAllUsers = async ({ skip = 0, limit = 20, filter = {} }) => {
    try {
      const userList = await UserModel.find(filter, {
        password: 0,
        otp: 0,
        otpExpiryTime: 0,
        _v: 0,
        createdAt: 0,
        updatedAt: 0,
      })
        .skip(skip)
        .limit(limit)
        .sort({
          createdAt: "desc",
        });
      return userList;
    } catch (exception) {
      throw exception;
    }
  };

  deleteByFilter = async (filter) => {
    try {
      const resp = await UserModel.findOneAndDelete(filter);
      return resp;
    } catch (exception) {
      throw exception;
    }
  };
  updateMyProfile = async (data) => {
    try {
      const response = await UserModel.findByIdAndUpdate(
        data._id,
        { $set: data },
        { new: true },
      );
      return response;
    } catch (exception) {
      throw exception;
    }
  };
}
const authSvc = new AuthService();
module.exports = authSvc;
