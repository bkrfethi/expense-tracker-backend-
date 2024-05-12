const path = require("path"); 
const transporter = require("./email");
async function sendTemplateEmail(email, subject ,template, context) {
  
try {
  let mailOptions = {
    from: process.env.email,
    to: email,
    subject,
    template,
    context
  };

 
  transporter.sendMail(mailOptions, async function (error, info) {
    if (error) {
        console.log("test")
        console.log(mailOptions)
       console.log(error);
      return false;
    } else {
      console.log("Email sent: " + info.response);
      return false;
    }
  });

} catch (error) {
  console.log(error)
  return false;
}
}




module.exports = { sendTemplateEmail };