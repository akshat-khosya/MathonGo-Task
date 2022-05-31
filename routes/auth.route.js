const {
  newUser,
  login,
  verifyEmail,
  resendOtp,
  forgotPassword,
  updatePassword,
  autoLogin,
  googleSignup,
} = require("../controllers/auth.controller");
const { checkAuth } = require("../middleware/checkAuth.middleware");

const {
  registerValidations,
  loginValidation,
} = require("../validations/auth.validation");

const router = require("express").Router();
const passport = require("passport");
require("../utils/passport.utils")(passport);

router.post("/newuser", registerValidations, newUser);
router.post("/login", loginValidation, login);
router.get("/verifyemail/:id/:token", verifyEmail);
router.get("/resendotp/:id", resendOtp);
router.get("/forgotpassword/:email", forgotPassword);
router.post("/forgotpassword/:id/:otp", updatePassword);
router.get("/autologin", checkAuth, autoLogin);
router.get("/google",passport.authenticate("google", { scope: ["email", "profile"] }));
router.get(
  "/google/callback/",
  passport.authenticate("google", { session: false }),
  googleSignup
);
module.exports = router;
