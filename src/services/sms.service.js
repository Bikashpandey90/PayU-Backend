const Surge = require("@surgeapi/node");
const env = require("dotenv").config();

const client = new Surge({
  apiKey: process.env.SMS_API_KEY,
});
class SMSService {
  sendMessage = async () => {
    const message = await client.messages.create(
      "acct_01j9a43avnfqzbjfch6pygv1td",
      {
        body: "Thought you could leave without saying goodbye?",
        attachments: [
          {
            url: "https://toretto.family/coronas.gif",
          },
        ],
        conversation: {
          contact: {
            first_name: "Dominic",
            last_name: "Toretto",
            phone_number: "+9779866328872",
          },
        },
      },
    );
    return message;
  };
}
const smsService = new SMSService();
module.exports = smsService;
