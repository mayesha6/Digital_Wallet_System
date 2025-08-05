import twilio from "twilio";
import { envVars } from "../config/env"; 
import AppError from "../errorHelpers/AppError";

// const client = twilio(envVars.TWILIO_ACCOUNT_SID, envVars.TWILIO_API_SECRET);

interface SendSMSOptions {
  to: string; 
  message: string;
}

export const sendSMS = async ({ to, message }: SendSMSOptions) => {
  try {
    // const response = await client.messages.create({
    //   body: message,
    //   // from: envVars.TWILIO_PHONE_NUMBER,
    //   to,
    // });

    console.log(`SMS sent to ${to}: ${message}`);
    // console.log(`SMS sent to ${to}: ${response.sid}`);
  } catch (error: any) {
    console.error("SMS sending error:", error.message);
    throw new AppError(500, "SMS could not be sent");
  }
};
