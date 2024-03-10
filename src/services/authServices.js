const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const { genneralAccessToken, genneralRefreshToken } = require("./jwtServices");

const createUser = (newUser) => {
  return new Promise(async (resolve, reject) => {
    const { name, email, password } = newUser;
    try {
      const checkUser = await userModel.findOne({ email: email });
      if (checkUser !== null) {
        resolve({
          status: "ERR",
          message: "User has already exist",
        });
      }
      const hashPassword = bcrypt.hashSync(password, 10);
      const createUser = await userModel.create({
        name,
        email,
        password: hashPassword,
      });
      if (createUser) {
        resolve({
          message: "SUCCESS CREATED",
          status: "OK",
          data: {
            email: createUser.email,
            name: createUser.name,
            id: createUser.id,
            access_token: await genneralAccessToken(),
          },
        });
      }
    } catch (err) {
      reject(err);
    }
  });
};

const loginUser = (userLogin) => {
  return new Promise(async (resolve, reject) => {
    const { email, password } = userLogin;
    try {
      const checkUser = await userModel.findOne({
        email: email,
      });
      if (checkUser === null) {
        resolve({
          status: "ERR",
          message: "The user is not defined",
        });
      }
      const comparePassword = bcrypt.compareSync(password, checkUser.password);

      if (!comparePassword) {
        resolve({
          status: "ERR",
          message: "The password or user is incorrect",
        });
      }
      const access_token = await genneralAccessToken({
        id: checkUser.id,
        isAdmin: checkUser.isAdmin,
      });

      const refresh_token = await genneralRefreshToken({
        id: checkUser.id,
        isAdmin: checkUser.isAdmin,
      });

      resolve({
        status: "OK",
        message: "SUCCESS",
        data: {
          id: checkUser.id,
          email: checkUser.email,
          access_token,
          refresh_token,
        },
      });
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  createUser,
  loginUser,
};
