const { newUser } = require("../controllers/auth.controller");
const { registerValidations } = require("../validations/auth.validation");

const router = require("express").Router();

router.post("/newuser",registerValidations,newUser);


module.exports = router;