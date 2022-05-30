const verifyEmailTemplate=(verifyLink,otp)=>(`<h1>Your 5 digit otp is ${otp} or click below link to verify your account. <a href=${verifyLink}>click me</a></h1>`);

module.exports = verifyEmailTemplate;