// const { Resend } = require('resend'); <-- SDK approach
// const resend = new Resend(process.env.RESEND_API_KEY);

// const emailSender = async (options) => {
//     try {
//         const data = await resend.emails.send({
//             from: "Authentication-class <onboarding@resend.dev>",
//             to: options.email,
//             subject: options.subject,
//             html: options.html
//         });

//         console.log("Message sent", data.id);
//         return data;

//     } catch (error) {
//         console.log('Email sending failed:', error);
//         throw error
//     }
// }

const emailSender = async (options) => { //<-- direct API approach
    try {
      const fetch = (await import("node-fetch")).default;  // dynamic import
  
      console.log("API Key:", process.env.RESEND_API_KEY ? "Loaded" : "Missing");
  
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "onboarding@resend.dev",
          to: options.email,
          subject: options.subject,
          html: options.html,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        console.log("Resend error:", data);
        throw new Error(data.message || "Failed to send email");
      }
  
      console.log("Email sent successfully:", data);
      return data;

    } catch (error) {
      console.log();("Email sending failed:", error.message);
      throw error;
    }
  };
  
  module.exports = emailSender;
  