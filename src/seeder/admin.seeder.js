const bcrypt = require("bcryptjs");
const UserModel = require("../modules/user.model");
const accountSvc = require("../modules/account/account.service");

const adminUsers = [
  {
    name: "Bikash Pandey",
    email: "bikashpandey835@gmail.com",
    role: "admin",
    password: bcrypt.hashSync("Admin123#"),
    gender: "male",
    status: "active",
  },
];

const populateAdmin = async () => {
  try {
    for (let user of adminUsers) {
      let existingUser = await UserModel.findOne({ email: user.email });
      if (!existingUser) {
        let newObj = new UserModel(user);
        await newObj.save();
        await accountSvc.createAccount(newObj);
      }
    }
  } catch (exception) {
    console.log("Error populating admin users", exception);
    throw exception;
  }
};

module.exports = populateAdmin;
