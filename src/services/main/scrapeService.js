const axios = require('axios');
const cheerio = require('cheerio');

const sendEmail = require('../main/emailService')

const check = async (url) => {
    try {
        const product = { title: '', stock: '', image: '', price: '', url: url }
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const StockStatusText = $('.Text_Lagerstatus').text().toLocaleLowerCase().trim();
        const title = $('#ArtikelnamnFalt').text();
        const priceDiscount = $('.PrisREA').text().replace('kr', '').trim();
        const priceOrg = $('.PrisORD').text().replace('kr', '').trim();
        const image = $('#Zoomer').attr('href');

        product.title = title
        product.price = priceDiscount !== null && priceDiscount !== undefined ? priceDiscount : priceOrg;
        product.stock = StockStatusText
        product.image = `https://www.maxgaming.se${image}`


        if (StockStatusText == 'i lager') 
            await sendEmail(product)
        return product
    }
    catch (err) {
        console.error('Failed to scrape the product:', err);
        return null
    }
};

module.exports = check;