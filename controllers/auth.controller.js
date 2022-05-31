const { validationResult } = require("express-validator");
const {
  getUser,
  saveUser,
  saveToken,
  getToken,
  updateToken,
  updateUser,
} = require("../services/user.service");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const { getDate, durationTime, checkTime } = require("../utils/date.utils");
const { sendEmail } = require("../utils/email.utils");
verifyEmailTemplate = require("../utils/verifyEmailTemplate.utils");
const jwt = require("jsonwebtoken");
const { tokenValidTime, resendOtp } = require("../constants/server.constant");

exports.newUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const checkUser = await getUser({ email: req.body.email });
    if (checkUser) {
      return res.status(409).json({ errors: [{ msg: "User already Exists" }] });
    }
    const salt = await bcrypt.genSalt(10);
    const hasedPass = await bcrypt.hash(req.body.password, salt);
    req.body.password = hasedPass;
    const newUser = await saveUser(req.body);
    const otp = otpGenerator.generate(5, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });
    const dateTime = getDate();
    const tokenData = {
      userId: newUser._id.toString(),
      token: otp,
      sentTime: dateTime,
    };
    const token = await saveToken(tokenData);
    const link = `${
      process.env.URL
    }api/v1/auth/verifyemail/${newUser._id.toString()}/${otp}`;
    sendEmail(req.body.email, "verify email", verifyEmailTemplate(link, otp));
    const { password, ...others } = newUser._doc;
    return res.status(200).json({
      msg: "user registered succesfully now verify you email",
      userData: { email: others.email, _id: others._id },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ errors: [{ msg: "server error" }] });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const checkUser = await getUser({ email: req.body.email });
    const validate = await bcrypt.compare(
      req.body.password,
      checkUser.password
    );

    if (validate) {
      const token = await getToken({ userId: checkUser._id.toString() });

      const { password, ...others } = checkUser._doc;
      if (token.verified) {
        const jwtToken = jwt.sign(
          { uid: checkUser._id.toHexString(), email: checkUser.email },
          process.env.JWT_SECRET,
          { expiresIn: "30d" }
        );
        return res.status(200).json({
          msg: "You are sucessfully logged in",
          userData: others,
          toekn: jwtToken,
        });
      }
      return res.status(200).json({
        msg: "verify you email",
        userData: { email: others.email, _id: others._id },
      });
    }
    return res.status(401).json({ errors: [{ msg: "Incorrect Credentials" }] });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ errors: [{ msg: "server error" }] });
  }
};

exports.verifyEmail = async (req, res) => {
  const { id, token } = req.params;

  try {
    const tokenData = await getToken({ userId: id });
    if (tokenData) {
      if (tokenData.verified) {
        return res
          .status(409)
          .json({ errors: [{ msg: "User already verified" }] });
      }
      if (token == tokenData.token) {
        const dateTime = getDate();
        const duration = durationTime(tokenData.sentTime, dateTime);
        const checkT = checkTime(duration, tokenValidTime);
        if (checkT) {
          await updateToken({ userId: id }, { verified: true ,token:""});
          return res
            .status(200)
            .json({ msg: "You are sucessfully verified now you can login" });
        }
        return res.status(401).json({ errors: [{ msg: "Token expired" }] });
      }
      return res.status(401).json({ errors: [{ msg: "Incorrect Token" }] });
    }
    return res.status(401).json({ errors: [{ msg: "Invalid Request" }] });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ errors: [{ msg: "server error" }] });
  }
};

exports.resendOtp = async (req, res) => {
  const { id } = req.params;
  try {
    const tokenData = await getToken({ userId: id });
    if (tokenData) {
      if (tokenData.verified) {
        return res.status(401).json({ errors: [{ msg: "Invalid Request" }] });
      }
      const dateTime = getDate();
      const duration = durationTime(tokenData.sentTime, dateTime);
      const checkT = checkTime(duration, resendOtp);
      if (checkT) {
        return res
          .status(401)
          .json({
            errors: [
              {
                msg: `otp service blocked for ${
                  (resendOtp - duration) / 60
                } minutes try again after ${
                  (resendOtp - duration) / 60
                } minutes`,
              },
            ],
          });
      }
      const otp = otpGenerator.generate(5, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
      });

      await updateToken({ userId: id }, { token: otp, sentTime: dateTime });
      const link = `${process.env.URL}api/v1/auth/verifyemail/${id}/${otp}`;
      sendEmail(req.body.email, "verify email", verifyEmailTemplate(link, otp));
      return res.status(200).json({ msg: "otp resent succesfully" });
    }
    return res.status(401).json({ errors: [{ msg: "Invalid Request" }] });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ errors: [{ msg: "server error" }] });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.params;
  try {
    const checkUser = await getUser({ email: email });
    if (checkUser) {
      const tokenData = await getToken({ userId: checkUser._id.toString() });
      const dateTime = getDate();
      const duration = durationTime(tokenData.sentTime, dateTime);
      const checkT = checkTime(duration, resendOtp);
      if (tokenData.verified && checkT === false) {
        const otp = otpGenerator.generate(5, {
          upperCaseAlphabets: false,
          specialChars: false,
          lowerCaseAlphabets: false,
        });
        const dateTime = getDate();
        await updateToken(
          { userId: tokenData.userId },
          { token: otp, sentTime: dateTime }
        );
        const link = `${process.env.URL}api/v1/auth/forgotpassword/${tokenData.userId}/${otp}`;
        sendEmail(
          req.body.email,
          "verify email",
          verifyEmailTemplate(link, otp)
        );
        return res.status(200).json({ msg: "otp resent succesfully" });
      }
      return res
        .status(401)
        .json({
          errors: [
            {
              msg: tokenData.verified
                ? `otp service blocked for ${
                    (resendOtp - duration) / 60
                  } minutes try again after ${
                    (resendOtp - duration) / 60
                  } minutes`
                : "Invalid Request",
            },
          ],
        });
    }
    return res.status(401).json({ errors: [{ msg: "Invalid Request" }] });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ errors: [{ msg: "server error" }] });
  }
};

exports.updatePassword = async (req, res) => {
  const { id, otp } = req.params;

  try {
    const checkUser = await getUser({ _id: id });
    if (checkUser) {
      const tokenData = await getToken({ userId: id });
      if(tokenData.verified){
        if(tokenData.token===otp){
          const dateTime = getDate();
          const duration = durationTime(tokenData.sentTime, dateTime);
          const checkT = checkTime(duration, tokenValidTime);
          if (checkT) {
            const salt = await bcrypt.genSalt(10);
            const hasedPass = await bcrypt.hash(req.body.password, salt);
            
            updateUser({email:checkUser.email},{password:hasedPass});
            updateToken({userId:tokenData.userId},{token:""});
            return res.status(200).json({ msg: "Password reset succesfully" });
          }
          return res.status(401).json({ errors: [{ msg: "Token expired" }] });
        }
        return res.status(401).json({ errors: [{ msg: "Invalid Otp" }] });
      }
      return res.status(401).json({ errors: [{ msg: "Invalid Request" }] });
    }
    return res.status(401).json({ errors: [{ msg: "Invalid Request" }] });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ errors: [{ msg: "server error" }] });
  }
};

exports.autoLogin=async(req,res)=>{
  try {
    const checkUser = await getUser({ _id: req.user });
    const { password, ...others } = checkUser._doc;
    return res.status(200).json({
      msg: "You are sucessfully logged in",
      userData: others,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ errors: [{ msg: "server error" }] });
  }
}