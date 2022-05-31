const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
exports.checkAuth = (req, res, next) => {
  const authtkn = req.header("x-auth-token");

  if (!authtkn) {
    return res
      .status(400)
      .json({ msg: "No auth token found. Please login again." });
  }
  try {
    let decoded = jwt.verify(authtkn, process.env.JWT_SECRET);
    console.log(decoded.uid);
    req.user = decoded.uid;
  } catch (error) {
    return res
      .status(400)
      .json({ msg: "Invalid auth token. Please login again." });
  }

  next();
};
