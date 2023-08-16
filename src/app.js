require('dotenv').config();
const PORT = process.env.PORT;
const schedule = require("node-schedule");
const check = require('./services/scrapeService')
const express = require('express');
const app = express();
app.use(express.json());
const mainController = require('./controllers/mainController');
app.use('/api', mainController);

const url = 'https://www.maxgaming.se/sv/gaming-tangentbord/q1-qmk-barebone-spacy-grey'

try {
    const job = schedule.scheduleJob('*/5 * * * * *', async () => {
        const product = await check(url);

        const currentDate = new Date();
        const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
        console.log(`Stauts: ${StockStatusText} - Time: ${formattedDate}`);

        if (product.stock == 'i lager') {
            job.cancel();
        }
    });
} catch (err) {
    console.error('Failed to execute job:', err);
}

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});