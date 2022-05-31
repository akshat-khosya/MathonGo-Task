const { check } = require("express-validator");
const registerValidations = [
  check("email").isEmail(),
  check("password").isLength({ min: 6 }),
  check("fname").notEmpty(),
  check("lname").notEmpty()
];
const loginValidation=[
  check("email").isEmail(),
  check("password").isLength({min:6})
];

module.exports = {registerValidations,loginValidation};