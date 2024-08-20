import { google } from "googleapis";
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

const OAuth2 = google.auth.OAuth2;

export const getMailAccessToken = async (): Promise<string | null> => {
  try {
    const oauth2Client = new OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    );
    oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    });
    const accessToken = await oauth2Client.getAccessToken();
    if (accessToken.token) return accessToken.token;
    return null;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const createMailTransporter = async (
  accessToken: string
): Promise<nodemailer.Transporter<SMTPTransport.SentMessageInfo>> => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.USER_EMAIL,
      accessToken,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    },
  });
  return transporter;
};
