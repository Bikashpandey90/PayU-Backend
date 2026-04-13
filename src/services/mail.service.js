require("dotenv").config()
const nodemailer = require("nodemailer")

class emailService {

    #transport;
    constructor() {
        try {

            let config = {
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD

                }
            }
            if (process.env.SMTP_PROVIDER === 'gmail') {
                config['service'] = 'gmail'
            }

            this.#transport = nodemailer.createTransport(config)
        } catch (exception) {
            console.log("Mail connect error", exception)
            throw exception
        }

    }

    sendEmail = async (
        {
            to,
            subject,
            message
        }
    ) => {
        try {
            let response = await this.#transport.sendMail({
                to: to,
                from: process.env.SMTP_FROM,
                subject: subject,
                html: message
            })
            console.log("Email response: ", response)
            return true

        } catch (exception) {
            console.log("Error sending email", exception)
            throw exception
        }
    }
}
const emailSvc = new emailService()
module.exports = emailSvc