const nodemailer = require('nodemailer');
const gmail_auth_password = process.env.gmail_auth_password
const gmail_auth_email = process.env.gmail_auth_email;


const sendEmail = async () => {
    const parsedUrl = new URL(url);
    const pathnameParts = parsedUrl.pathname.split('/');
    const desiredValue = pathnameParts[pathnameParts.length - 1].replaceAll('-', ' ');

    const html = `
        <h2>NU FINNS ${desiredValue} TILLGÄNGLIG</h2>
        <a href=${url}>KLICKA HÄR FÖR ATT KOMMA TILL KÖPSIDAN.</a>
    `

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: gmail_auth_email,
                pass: gmail_auth_password,
            },
        });

        const info = await transporter.sendMail({
            from: `StockScraper <${gmail_auth_email}>`,
            to: gmail_auth_email,
            subject: `${desiredValue} FINNS NU TILLGÄNGLIG`,
            html: html,
        })

        console.log('Email sent successfully ' + info.messageId)


    } catch (err) {
        console.error('Failed to send the mail:', err);
    }
};

module.exports = sendEmail;