import config from "../config/config.js"

const reminderHTML = () =>{
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Complete Your Order</title>
</head>
<body style="margin:0; padding:0; background:#f5f5f5; font-family:Arial, Helvetica, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden;">

          <!-- Header -->
          <tr>
            <td align="center" style="background:#0F9D58; padding:35px;">
              <h1 style="margin:0; color:#ffffff; font-size:32px;">
                CAMPUSIN
              </h1>
              <p style="margin:10px 0 0; color:#E8F5E9; font-size:16px;">
                Your cart is waiting for you 🍔
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px; color:#333333; font-size:16px; line-height:1.8;">

              <p>Hi Cutie,</p>

              <p>
                It looks like you left some delicious items in your
                <strong>CAMPUSIN</strong> cart.
              </p>

              <p>
                Your cart has been safely saved and is ready whenever you are.
                Complete your order before your favourite items go out of stock!
              </p>

              <div style="text-align:center; margin:40px 0;">
                <a href="${config.CLIENT_URL}"
                   style="
                    background:#0F9D58;
                    color:#ffffff;
                    text-decoration:none;
                    padding:15px 32px;
                    border-radius:8px;
                    display:inline-block;
                    font-size:16px;
                    font-weight:bold;
                   ">
                  Continue Shopping
                </a>
              </div>

              <p>
                Need a quick meal between classes?
                We've got you covered.
              </p>

              <p>
                See you soon! ❤️
              </p>

              <p>
                Team <strong>CAMPUSIN</strong>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background:#F8F9FA; padding:25px; color:#777777; font-size:13px;">
              <p style="margin:0;">
                CAMPUSIN • Food. Fast. Friendly.
              </p>

              <p style="margin-top:8px;">
                If you have already completed your order, you can safely ignore this email.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`

}

export default reminderHTML