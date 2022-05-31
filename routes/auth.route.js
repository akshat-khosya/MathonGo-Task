const { newUser, login, verifyEmail, resendOtp, forgotPassword, updatePassword, autoLogin } = require("../controllers/auth.controller");
const { checkAuth } = require("../middleware/checkAuth.middleware");
const { registerValidations, loginValidation } = require("../validations/auth.validation");

const router = require("express").Router();

router.post("/newuser",registerValidations,newUser);
router.post("/login",loginValidation,login);
router.get("/verifyemail/:id/:token",verifyEmail);
router.get("/resendotp/:id",resendOtp);
router.get("/forgotpassword/:email",forgotPassword);
router.post("/forgotpassword/:id/:otp",updatePassword);
router.get("/autologin",checkAuth,autoLogin);
module.exports = router;