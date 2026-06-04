const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

const generateOtpHTML = (otp) => {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP Verification</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }
            .container {
                background-color: #fff;
                padding: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Your OTP for Campus In</h1>
            <p>Your OTP is ${otp}. It is valid for 10 minutes.</p>
        </div>
    </body>
</html>
    `
}

export { generateOTP, generateOtpHTML }