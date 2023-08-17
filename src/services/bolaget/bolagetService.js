const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin())
const { executablePath } = require('puppeteer')

const getDrink = async (url, area) => {

    const browser = await puppeteer.launch({headless: false, executablePath: executablePath()})
    const page = await browser.newPage()

    //set age consent cookie
    const decodedValue = '{"state":{"verified":true},"version":0}';
    await page.setCookie({
      name: 'systembolaget.age',
      value: decodedValue,
      domain: '.systembolaget.se'
    });

    await page.goto(url, {
      waitUntil: 'domcontentloaded',
    })

    //find the show stored button an click it!
    const button = await page.$('.css-103vv0f');

  if (button) {

    await button.click();

    // Listen for the dialog event and dissmiss it.
    page.on('dialog', async (dialog) => {
    await dialog.dismiss();
    });

    //Select hela sverige on the <select> element
    const selectElement = await page.$('.css-dz8wl');
    if (selectElement) {
    const valueToSelect = 'sweden';
    await page.select('select', valueToSelect);
    } else {
      console.log('Select element not found');
    }
  } else {
    console.log('Button not found');
    return
  }

//Wait for stores then map store content

  await page.waitForSelector('.css-4od5c4');

  const storesData = await page.evaluate(async () => {

    const convertCount = (amount) => {
      return parseFloat(amount.replace('st', '').trim());
  }

  const stores = Array.from(document.querySelectorAll('.css-4od5c4'));
  const data = stores.map((item) => {
      let address = item.querySelector('.css-1tkalz1 .css-iqfm9l').textContent.trim();
      let city = item.querySelector('.css-1tkalz1 .css-1cwtvfm').textContent.trim().toLowerCase();
      let amountElement = item.querySelector('.css-177ui4i .css-iqfm9l');
      let amount = amountElement ? amountElement.textContent.trim() : 'no value';

      let convertedAmount = convertCount(amount);

      return {
          address,
          city,
          amount: convertedAmount
      };
  });
    return data;
});


if (area) {
    const filteredStoresData = storesData.filter(store => store.city === area.toLocaleLowerCase());
    return filteredStoresData
} else {
  console.log(storesData)
  return storesData
}

};




module.exports = getDrink;

