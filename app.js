require('dotenv').config();
const PORT = process.env.PORT;
const gmail_auth_password = process.env.gmail_auth_password
const gmail_auth_email = process.env.gmail_auth_email;
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');
const schedule = require("node-schedule");

const app = express();

const url = 'https://www.maxgaming.se/sv/gaming-tangentbord/q1-qmk-barebone-spacy-grey'

const sendInStockEmailAsync = async () => {
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
}

const checkIfInStockAsync = async () => {
    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36' }
        })

        const $ = cheerio.load(response.data);
        const StockStatusText = $('.Text_Lagerstatus').text().toLocaleLowerCase().trim();

        if (StockStatusText == 'i lager') {
            await sendInStockEmailAsync()
            return true
        }
        else {
            console.count('not in stock')
            return false
        }
    }
    catch (err) {
        console.error('Failed to send the mail:', err);
        return true
    }
}


try {
    const job = schedule.scheduleJob('*/20 * * * *', async () => {
        const res = await checkIfInStockAsync();

        if (res) {
            job.cancel();
        }
    });
} catch (err) {
    console.error('Failed to schedule job:', err);
}

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});