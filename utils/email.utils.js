const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const dotenv = require("dotenv");
const { myOAuth2Client } = require("./google.utils");
dotenv.config();

const sendEmail = (to, sub, htmlContent) => {
  myOAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
  const myAccessToken = myOAuth2Client.getAccessToken();

  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: "20106@iiitu.ac.in",
      clientId: process.env.ID,
      clientSecret: process.env.SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: myAccessToken,
    },

    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: "20106@iiitu.ac.in",
    to: to,
    subject: sub,
    html: htmlContent,
  };

  transport.sendMail(mailOptions, function (err, result) {
    if (err) {
      console.error(err);
    } else {
      transport.close();
    }
  });
};
module.exports = { sendEmail };
