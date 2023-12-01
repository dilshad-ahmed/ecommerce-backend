const nodemailer = require("nodemailer")

const sendEmail = async(options) => {
    const transporter = nodemailer.createTransport({
        host : "smtp.gmail.com",
        port : 465,
        service: "gmail",
        auth : {
            user : process.env.SMTP_MAIL,
            pass : process.env.SMTP_PASSWORD
        }
    })

    const mailOptions = {
        from : "",
        to : options.email,
        subject : options.subject,
        text : options.message
    }

    await transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
    })
}

module.exports = sendEmail;