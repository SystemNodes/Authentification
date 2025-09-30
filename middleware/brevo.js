const SibApiV3Sdk = require("sib-api-v3-sdk");

const emailSender = async ({ to, subject, html }) => {
  try {
    const client = SibApiV3Sdk.ApiClient.instance;
    const apiKey = client.authentications["api-key"];
    apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const sendSmtpEmail = {
      sender: {
        email: process.env.SENDINBLUE_SENDER_EMAIL,
        name: process.env.SENDINBLUE_SENDER_NAME,
      },
      to: Array.isArray(to)
        ? to.map((email) => ({ email }))
        : [{ email: to }],
      subject,
      htmlContent: html,
    };

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Failed to send email:", error.response?.body || error);
    throw error;
  }
};

module.exports = emailSender;
