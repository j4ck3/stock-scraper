//require('dotenv').config();
//const PORT = process.env.PORT;
//const schedule = require("node-schedule");
//const check = require('./services/main/scrapeService')
//const getDrink = require('./services/bolaget/bolagetService')
//const getAllCities = require('./services/bolaget/bolagetGetAllCitiesService')
const getProductsFromSearch = require("./services/m/mService");
const express = require("express");
const app = express();
app.use(express.json());
const mainController = require("./controllers/mainController");
const bolagetController = require("./controllers/bolagetController");
const mController = require("./controllers/mController");
app.use("/api", mainController);
app.use("/api/bolaget", bolagetController);
app.use("/api/m", mController);

//getProductsFromSearch('https://www.matsmart.se/search?q=nocco')

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

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
