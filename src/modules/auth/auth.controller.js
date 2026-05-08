require("dotenv").config();
const fileUploaderSvc = require("../../services/fileuploader.service");
const brcypt = require("bcryptjs");
const emailSvc = require("../../services/mail.service");
const { randomStringGenerator } = require("../../utilities/helpers");
const authSvc = require("./auth.service");
const jwt = require("jsonwebtoken");
const accountSvc = require("../account/account.service");
const qrSvc = require("../../services/qr.services");
class AuthController {
  register = async (req, res, next) => {
    try {
      //body parser
      let data = await authSvc.transformUserRegister(req);
      //name valid
      const user = await authSvc.createUser(data);
      await authSvc.sendActivationNotification(data.name, data.otp, data.email);

      res.json({
        data: user,
        message: "Register data",
        status: "REGISTERED_DATA",
        options: null,
      });
    } catch (exception) {
      console.log("Register", exception);
      next(exception);
    }
  };
  //activate
  activateUser = async (req, res, next) => {
    try {
      const data = req.body; //email,otp
      const user = await authSvc.getSingleUserByFilter({
        email: data.email,
      });
      //pre activated user
      if (user.status === "active") {
        throw {
          code: 400,
          message: "User already activated",
          status: "ALREADY_ACTIVATED_USER",
        };
      }
      //otp verify
      //expiry time
      let today = Date.now();
      let otpExpiry = user.otpExpiryTime.getTime(); //expiry time

      if (today > otpExpiry) {
        throw { code: 422, message: "OTP expired", status: "OTP_EXPIRED" };
      }

      if (data.otp !== user.otp) {
        throw { code: 403, message: "Invalid OTP code", status: "OTP_INVALID" };
      }
      await authSvc.activateUser(user);
      await accountSvc.createAccount(user);

      res.json({
        detail: null,
        message: "User Activated Successfully",
        status: "USER_ACTIVATED",
        options: null,
      });
    } catch (exception) {
      console.log("ActivateUser", exception);
      next(exception);
    }
  };
  resendOtp = async (req, res, next) => {
    try {
      const data = req.body; //email,otp
      let user = await authSvc.getSingleUserByFilter({
        email: data.email,
      });

      //pre activated user

      if (user.status === "active") {
        throw {
          code: 400,
          message: "User already activated",
          status: "ALREADY_ACTIVATED_USER",
        };
      }
      //otp verify
      //expiry time
      let today = Date.now();
      let otpExpiry = user.otpExpiryTime.getTime(); //expiry time

      if (today <= otpExpiry) {
        throw { code: 422, message: "OTP expired", status: "OTP_EXPIRED" };
      }
      user = await authSvc.resetOtp(user);
      await authSvc.sendActivationNotification(user.name, user.otp, user.email);
      res.json({
        detail: null,
        status: "OTP_RESEND",
        message: "OTP resend successfully",
        options: null,
      });
    } catch (exception) {
      console.log("ActivateUser", exception);
      next(exception);
    }
  };

  login = async (req, res, next) => {
    try {
      const data = req.body;
      const user = await authSvc.getSingleUserByFilter({
        email: data.email,
      });

      //active
      if (user.status !== "active") {
        throw {
          code: 401,
          message: "User is not active",
          status: "USER_NOT_ACTIVE",
        };
      }
      //verify password
      if (brcypt.compareSync(data.password, user.password)) {
        ///TODO : OTP generate=> db user update
        //responst

        //jwt

        let accessToken = jwt.sign(
          {
            sub: user._id,
            typ: "bearer",
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "1h",
          },
        );

        let refreshToken = jwt.sign(
          {
            sub: user._id,
            typ: "refresh",
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "10d",
          },
        );
        res.json({
          detail: {
            accessToken: accessToken,
            refreshToken: refreshToken,
            user: {
              _id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              image: user.image,
            },
          },
          message: "user login success",
          status: "LOGIN_SUCCESS",
          options: null,
        });
      } else {
        throw {
          code: 401,
          message: "Invalid password",
          status: "INVALID_PASSWORD",
        };
      }
    } catch (exception) {
      console.log("Login:", exception);
      next(exception);
    }
  };
  //verify login otp=>email,otp
  //token

  getLoggedInUser = async (req, res, next) => {
    try {
      res.json({
        detail: req.authUser,
        message: "Your Profile",
        status: "YOUR_PROFILE",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  };
  getRefreshToken = async (req, res, next) => {
    try {
      let user = req.authUser;
      let accessToken = jwt.sign(
        {
          sub: user._id,
          typ: "bearer",
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        },
      );
      let refreshToken = jwt.sign(
        {
          sub: user._id,
          typ: "refresh",
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "10d",
        },
      );
      res.json({
        detail: {
          accessToken: accessToken,
          refreshToken: refreshToken,
        },
        message: "Token Refreshed",
        status: "TOKEN_REFRESHED",
        options: null,
      });
    } catch (exception) {
      next("getRefreshToken :", exception);
    }
  };

  delete = async (req, res, next) => {
    try {
      const data = await authSvc.getSingleUserByFilter({
        _id: req.params.id,
      });
      const response = await authSvc.deleteByFilter({
        _id: req.params.id,
      });
      res.json({
        detail: response,
        message: "User Deleted",
        status: "USER_DELETED",
        options: null,
      });
    } catch (exception) {
      console.log(exception);
    }
  };
  updateProfile = async (req, res, next) => {
    try {
      if (!req.authUser || !req.authUser._id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      console.log("Received file:", file);
      if (file) {
        try {
          req.body.image = await fileUploaderSvc.uploadFile(
            file.path,
            "/users",
          );
          console.log("Uploaded image URL:", req.body.image);
        } catch (err) {
          console.error("Image upload failed:", err);
        }
      }

      console.log("Update request received for user:", req.authUser._id);
      console.log("Update data:", req.body);
      const data = await authSvc.updateMyProfile({
        _id: req.authUser._id,
        name: req?.body?.name,
        email: req?.body?.email,
        phone: req?.body?.phone,
        address: req?.body?.address,
        image: req?.body?.image,
        // password: hashedPassword
      });
      if (!data) {
        return res.status(401).json({ message: "User not found" });
      }

      res.json({
        detail: data,
        message: "User Updated",
        status: "USER_UPDATED",
        options: null,
      });
    } catch (exception) {
      next(exception);
    }
  };

  listUsers = async (req, res, next) => {
    try {
      let page = +req.query.page || 1;
      let limit = +req.query.limit || 20;
      let skip = (page - 1) * limit;
      let filter = {};
      if (req.authUser && req.authUser._id) {
        filter._id = { $ne: req.authUser._id };
      }
      if (req.query.search) {
        filter.$or = [
          { name: new RegExp(req.query.search, "i") },
          { email: new RegExp(req.query.search, "i") },
          { phone: new RegExp(req.query.search, "i") },
        ];
      }
      let data = await authSvc.getAllUsers({ skip, limit, filter });
      res.json({
        detail: data,
        message: "User list",
        status: "USERS_LIST",
        options: {
          currentPage: page,
          limit: limit,
        },
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };
  findUser = async (req, res, next) => {
    try {
      const id = req.params.id;
      const user = await authSvc.userfind({
        _id: id,
      });
      if (!user) {
        return res
          .status(401)
          .json({ message: "User not found", status: "INVALID_USER" });
      }
      res.json({
        detail: user,
        status: "USER_FETCH_SUCCESS",
        message: "User details",
      });
    } catch (exception) {
      console.log(exception);
      next(exception);
    }
  };
}
const authCtrl = new AuthController();
module.exports = authCtrl;
