const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const app = express();

dotenv.config();
PORT = process.env.PORT || 4000;
const corsOptions = {
  origin: "*",
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  exposedHeaders: ['x-auth-token'],
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get("/", (req, res) => {
  res.send("Backend Web Development Internship - Sample Task");
});

// MongoDb connection

mongoose.connect(
  process.env.MONGO_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Database Connected");
    }
  }
);

// routes
const auth = require("./routes/auth.route");

//routes use
app.use("/api/v1/auth/", auth);

app.listen(PORT, () => {
  console.log("Server started at " + process.env.URL);
});
