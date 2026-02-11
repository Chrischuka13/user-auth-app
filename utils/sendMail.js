import Brevo from "@getbrevo/brevo";

const client = new Brevo.TransactionalEmailsApi();
client.authentications.apiKey.apiKey = process.env.BREVO_API_KEY;

export const sendMailer = async ({ to, subject, htmlContent }) => {
  const email = new Brevo.SendSmtpEmail();

  email.sender = {
    name: "Chuka User Auth",
    email: process.env.EMAIL_FROM
  };

  email.to = [{ email: to }];
  email.subject = subject;
  email.htmlContent = htmlContent;

  return client.sendTransacEmail(email);
};