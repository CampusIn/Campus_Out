import config from "../config/config.js";

const createMimeMessage = ({ to, subject, text, html }) => {
  const boundary = `campus-out-${Date.now()}`;

  return [
    `From: Campus In <${config.GOOGLE_USER}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "",
    text,
    "",
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "",
    html,
    "",
    `--${boundary}--`,
  ].join("\r\n");
};

const toBase64Url = (value) =>
  Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const getGmailAccessToken = async () => {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: config.CLIENT_ID,
      client_secret: config.CLIENT_SECRET,
      refresh_token: config.GOOGLE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Failed to get Gmail access token:", data);
    throw new Error(
      data.error_description || "Failed to get Gmail access token",
    );
  }

  return data.access_token;
};

const sendEmail = async (to, subject, text, html) => {
  const accessToken = await getGmailAccessToken();
  const raw = toBase64Url(createMimeMessage({ to, subject, text, html }));

  const response = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Failed to send Gmail message:", data);
    throw new Error(data.error?.message || "Failed to send email");
  }

  console.log("Message sent: %s", data.id);
  return data;
};

export { sendEmail };
