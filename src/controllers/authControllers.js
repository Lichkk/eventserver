const authServices = require("../services/authServices");
const asyncHandler = require("express-async-handler");
const JwtService = require("../services/jwtServices");
const nodemailer = require("nodemailer");
const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");

const createUser = async (req, res) => {
  try {
    const { password, email } = req.body;
    const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    const isCheckEmail = reg.test(email);
    if (!email || !password) {
      return res.status(200).json({
        message: "The input is required",
        status: "ERR",
      });
    } else if (!isCheckEmail) {
      return res.status(200).json({
        message: "The input is email",
        status: "ERR",
      });
      // } else if (password != confirmPassword) {
      //   return res.status(200).json({
      //     message: "The password is equal confirmpassword",
      //   });
    }
    const response = await authServices.createUser(req.body);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({ message: e });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    const isCheckEmail = reg.test(email);
    if (!email || !password) {
      return res.status(200).json({
        status: "ERR",
        message: "The input is required",
      });
    } else if (!isCheckEmail) {
      return res.status(200).json({
        status: "ERR",
        message: "The input is email",
      });
    }
    const response = await authServices.loginUser(req.body);
    const { refresh_token, ...newReponse } = response;
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      path: "/",
    });
    return res.status(200).json({ ...newReponse, refresh_token });
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    // let token = req.headers.token.split(" ")[1];
    const token = req.cookies.refresh_token;
    // console.log(token);
    if (!token) {
      return res.status(200).json({
        status: "ERR",
        message: "The token is required",
      });
    }
    const response = await JwtService.refreshTokenJwtService(token);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: "11012k1hihi@gmail.com",
    pass: "daye xcqt egpa pvtz",
  },
});

const handleSendEmail = async (value) => {
  try {
    await transporter.sendMail(value);
  } catch (error) {
    console.log("cant not send email");
  }
};

const verification = asyncHandler(async (req, res) => {
  const verificationCode = Math.round(1000 + Math.random() * 9000);
  const { email } = req.body;
  const data = {
    from: `Support event application <11012k1hihi@gmail.com>`,
    to: email, // list of receivers
    subject: "Verification email code", // Subject line
    text: "Your code to verification email", // plain text body
    html: `<h1>${verificationCode}</h1>`, // html body
  };
  try {
    await handleSendEmail(data);
    res.status(200).json({
      message: "Send verify email successfully",
      data: {
        code: verificationCode,
      },
    });
  } catch (error) {
    console.log(error);
  }
});

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const ramdomPassword = Math.round(1000 + Math.random() * 999000);

  const user = await userModel.findOne({ email: email });

  const data = {
    from: `Support event application <11012k1hihi@gmail.com>`,
    to: email,
    subject: "Verification email code",
    text: "New Password",
    html: `<h1>${ramdomPassword}</h1>`,
  };

  if (user) {
    const hashPassword = await bcrypt.hash(ramdomPassword.toString(), 10);

    await userModel.findByIdAndUpdate(user.id, {
      password: hashPassword,
      isChangPassword: true,
    });

    try {
      await handleSendEmail(data);
      res.status(200).json({
        message: "Successfully",
        data: [],
      });
    } catch (error) {
      console.log(error);
    }
  }
};

const handleLoginWithGoogle = asyncHandler(async (req, res) => {
  const userInfo = req.body;

  const existingUser = await UserModel.findOne({ email: userInfo.email });
  let user;
  if (existingUser) {
    await UserModel.findByIdAndUpdate(existingUser.id, {
      updatedAt: Date.now(),
    });
    user = { ...existingUser };
    user.accesstoken = await getJsonWebToken(userInfo.email, userInfo.id);

    if (user) {
      const data = {
        accesstoken: user.accesstoken,
        id: existingUser._id,
        email: existingUser.email,
        fcmTokens: existingUser.fcmTokens,
        photo: existingUser.photoUrl,
        name: existingUser.name,
      };

      res.status(200).json({
        message: "Login with google successfully!!!",
        data: data,
      });
    } else {
      res.sendStatus(401);
      throw new Error("fafsf");
    }
  } else {
    const newUser = new UserModel({
      email: userInfo.email,
      fullname: userInfo.name,
      ...userInfo,
    });
    await newUser.save();
    user = { ...newUser };
    user.accesstoken = await getJsonWebToken(userInfo.email, newUser.id);

    if (user) {
      res.status(200).json({
        message: "Login with google successfully!!!",
        data: {
          accesstoken: user.accesstoken,
          id: user._id,
          email: user.email,
          fcmTokens: user.fcmTokens,
          photo: user.photoUrl,
          name: user.name,
        },
      });
    } else {
      res.sendStatus(401);
      throw new Error("fafsf");
    }
  }
});

module.exports = {
  createUser,
  loginUser,
  refreshToken,
  verification,
  forgotPassword,
  handleLoginWithGoogle,
};
