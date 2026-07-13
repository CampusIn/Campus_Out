import { emailQueue } from "../queue/email.queue.js";
import { REDIS_KEYS } from "../constants/redis.constants.js";

const queueOTPEmail = async ({ to, subject, text, otpHtml }) => {
  return emailQueue.add(
    REDIS_KEYS.SEND_OTP,
    {
      to,
      subject,
      text,
      otpHtml,
    },
    {
      jobId: `otp-${to}-${Date.now()}`,
      removeOnComplete: true,
      delay: 0,
    },
  );
};

const queueWelcomeEmail = async ({ to, subject, text, welcomeHtml }) => {
  return emailQueue.add(
    REDIS_KEYS.WELCOME,
    {
      to,
      subject,
      text,
      welcomeHtml,
    },
    {
      jobId: `wel-${to}-${Date.now()}`,
      removeOnComplete: true,
      delay: 0,
    },
  );
};

const queueForgotEmail = async({to,subject,text,forgotHtml})=>{
  return emailQueue.add(REDIS_KEYS.FORGOT_PASSWORD,{
    to,
    subject,
    text,
    forgotHtml
  },{
    jobId: `for-${to}-${Date.now()}`,
    removeOnComplete:true,
    delay:0
  })
}
export default { queueOTPEmail, queueWelcomeEmail, queueForgotEmail };
