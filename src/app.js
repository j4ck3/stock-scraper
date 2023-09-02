require('dotenv').config();
const PORT = process.env.PORT;
const schedule = require("node-schedule");
const check = require('./services/main/scrapeService')
const getDrink = require('./services/bolaget/bolagetService')
const getAllCities = require('./services/bolaget/bolagetGetAllCitiesService')
const express = require('express');
const app = express();
app.use(express.json());
const mainController = require('./controllers/mainController');
const bolagetController = require('./controllers/bolagetController');
app.use('/api', mainController);
app.use('/api/bolaget', bolagetController);

const url = 'https://www.maxgaming.se/sv/gaming-tangentbord/q1-qmk-barebone-spacy-grey'
//getAllCities('https://www.systembolaget.se/produkt/ol/ey-bro-143215')
// try {
//     const job = schedule.scheduleJob('*/5 * * * * *', async () => {
//         const product = await check(url);
//         getDrink('https://www.systembolaget.se/produkt/cider-blanddrycker/fors-cocktails-107315/')
//         const currentDate = new Date();
//         const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
//         console.log(`Stauts: ${product.stock} - Time: ${formattedDate}`);

//         if (product.stock == 'i lager') {
//             job.cancel();
//         }
//     });
// } catch (err) {
//     console.error('Failed to execute job:', err);
// }

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});