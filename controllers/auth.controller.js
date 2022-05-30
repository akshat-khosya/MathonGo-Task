const { validationResult } = require("express-validator");
const { getUser, saveUser, saveToken } = require("../services/user.service");
const otpGenerator = require('otp-generator')
const bcrypt = require("bcrypt");
const { getDate } = require("../utils/date.utils");
const { sendEmail } = require("../utils/email.utils");
verifyEmailTemplate=require("../utils/verifyEmailTemplate.utils");
exports.newUser = async(req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
      const checkUser=await getUser({email:req.body.email});
      if(checkUser){
        return res.status(409).json({msg:"User already Exists"});
      }
      const salt = await bcrypt.genSalt(10);
      const hasedPass = await bcrypt.hash(req.body.password, salt);
      req.body.password = hasedPass;
      const newUser=await saveUser(req.body);
      const otp=otpGenerator.generate(5, { upperCaseAlphabets: false, specialChars: false ,lowerCaseAlphabets:false});
      const dateTime=getDate();
      const tokenData={
        userId:newUser._id.toString(),
        token:otp,
        sentTime:dateTime
      };
      const token=await saveToken(tokenData);
      const link=`${process.env.URL}api/v1/auth/verifyemail/${newUser._id.toString()}/${otp}`;
      sendEmail(req.body.email,"verify email",verifyEmailTemplate(link,otp));
      return res.status(200).json({ message: "user registered succesfully" });
      
  } catch (err) {
      console.log(err);
  }

};
