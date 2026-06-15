import crypto from 'crypto';

// Generate a 6-digit OTP
export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

// Send OTP via OTPless (SMS)
export const sendOTPSMS = async (phone: string, otp: string): Promise<boolean> => {
  try {
    const response = await fetch('https://auth.otpless.app/auth/v1/initiate/otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        clientId: process.env.OTPLESS_CLIENT_ID!,
        clientSecret: process.env.OTPLESS_CLIENT_SECRET!,
      },
      body: JSON.stringify({
        phoneNumber: `+91${phone}`,
        expiry: 600,
        otpLength: 6,
        channels: ['SMS'],
      }),
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('OTPless SMS error:', error);
    return false;
  }
};

// Verify OTP via OTPless
export const verifyOTPSMS = async (
  phone: string,
  otp: string
): Promise<boolean> => {
  try {
    const response = await fetch('https://auth.otpless.app/auth/v1/verify/otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        clientId: process.env.OTPLESS_CLIENT_ID!,
        clientSecret: process.env.OTPLESS_CLIENT_SECRET!,
      },
      body: JSON.stringify({
        phoneNumber: `+91${phone}`,
        otp,
      }),
    });

    const data = await response.json();
    return data.isOTPVerified === true;
  } catch (error) {
    console.error('OTPless verify error:', error);
    return false;
  }
};