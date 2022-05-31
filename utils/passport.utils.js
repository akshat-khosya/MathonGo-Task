const GoogleStrategy = require("passport-google-oauth2").Strategy;
const otpGenerator = require("otp-generator");
const User =require("../models/user.model");
const { getUser, saveUser, saveToken } = require("../services/user.service");
const bcrypt = require("bcrypt");
const { sendEmail } = require("../utils/email.utils");
module.exports=(passport)=>{
    passport.use(new GoogleStrategy({
        clientID:process.env.ID,
        clientSecret:process.env.SECRET,
        callbackURL:`${process.env.URL}api/v1/auth/google/callback/`,
        passReqToCallback:true,
    },
    async (request,accesToken,refreshToken,profile,done)=>{
        try {
            let checkUser=await getUser({email:profile.emails[0].value});
            if(checkUser){
                return done(null,checkUser);
            }
            const otp = otpGenerator.generate(6, {
                upperCaseAlphabets: true,
                specialChars: true,
                lowerCaseAlphabets: true,
              });
              const salt = await bcrypt.genSalt(10);
            const hasedPass = await bcrypt.hash(otp, salt);
            const userData={
                fname:profile.given_name,
                lname:profile.family_name,
                email:profile.emails[0].value,
                password:hasedPass
            }
            const newUser=await saveUser(userData);
        
            const tokenData={
                userId:newUser._id.toString(),
                verified:true
            }
            const newToken=await saveToken(tokenData);

            sendEmail(newUser.email, "Password", `your auto genrated password is ${otp}`);
            return done(null,newUser)

        } catch (err) {
            return done(err,false)
        }
    }
    ));
}