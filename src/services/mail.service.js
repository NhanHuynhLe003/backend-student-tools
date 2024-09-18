const { google } = require("googleapis");
const nodemailer = require("nodemailer");

class MailService {
  static async sendEmail({ destinationEmail, nameReceiver, title, content }) {
    const CLIENT_ID = process.env.CLIENT_ID;
    const CLIENT_SECRET = process.env.CLIENT_SECRET;
    const REDIRECT_URI = process.env.REDIRECT_URI;
    const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

    const senderInformation = {
      email: "nhan123huynh2k3@gmail.com",
      name: "Thư viện sách Điện Tử Truyền Thông",
    };

    if (!this.oAuth2Client) {
      this.oAuth2Client = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT_URI
      );
      this.oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
    }

    const accessToken = await this.oAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: senderInformation.email,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken,
      },
    });

    const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .email-container {
                        background-color: #ffffff;
                        margin: 20px auto;
                        padding: 20px;
                        max-width: 600px;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        overflow: hidden;
                    }
                    .email-header {
                        background-color: #007bff;
                        color: #ffffff;
                        padding: 20px;
                        border-top-left-radius: 8px;
                        border-top-right-radius: 8px;
                    }
                    .email-header .logo{
                      display: block;
                      margin: 1rem auto;
                    }
                    .email-header h1 {
                        margin: 0;
                        font-size: 24px;
                    }
                    .email-body {
                        padding: 20px;
                        color: #333333;
                        line-height: 1.6;
                    }
                    .email-footer {
                        background-color: #f4f4f4;
                        padding: 10px;
                        text-align: center;
                        border-bottom-left-radius: 8px;
                        border-bottom-right-radius: 8px;
                        font-size: 14px;
                        color: #777777;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="email-header">
                        <img class="logo" src="https://th.bing.com/th/id/R.c41c170ad1254fb9f72cb7756dfc4138?rik=mio7FQRGxi2TQg&pid=ImgRaw&r=0" alt="Logo" width="90" height="140"/>
                        <h1>${title}</h1>
                    </div>
                    <div class="email-body">
                        <p>Xin Chào <b>${nameReceiver}</b>,</p>
                        <div>${content}</div>
                        
                    </div>
                    <div class="email-footer">
                        &copy; 2024 Điện Tử Truyền Thông, Cao đẳng kỹ thuật Cao Thắng. All rights reserved.
                    </div>
                </div>
            </body>
            </html>
        `;

    const info = await transport.sendMail({
      from: `"${senderInformation.name}" <${senderInformation.email}>`, // sender address
      to: destinationEmail, // list of receivers
      subject: title, // Subject line
      text: content, // plain text body
      html: htmlContent, // html body
    });

    return info;
  }
}

module.exports = MailService;
