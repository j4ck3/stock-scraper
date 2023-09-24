const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const { executablePath } = require('puppeteer');

const getDrink = async (url, area) => {
  const browser = await puppeteer.launch({
    headless: 'false',
    executablePath: executablePath(),
  });
  const page = await browser.newPage();

  //set age consent cookie
  const decodedValue = '{"state":{"verified":true},"version":0}';
  await page.setCookie({
    name: 'systembolaget.age',
    value: decodedValue,
    domain: '.systembolaget.se',
  });

  await page.goto(url, {
    waitUntil: 'domcontentloaded',
  });

  //find the show stores button an click it
  const button = await page.waitForSelector('.css-103vv0f');

  if (button) {
    await button.click();

    // Listen for dialog event and dissmiss it.
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
      browser.close();
      return;
    }
  } else {
    console.log('Button not found');
    browser.close();
    return;
  }

  // get the price and stocks of all the stores
  await page.waitForSelector('.css-4od5c4');
  await page.waitForSelector('.css-6dcbqr');

  try {
    const result = await page.evaluate(async () => {
      const stores = Array.from(document.querySelectorAll('.css-4od5c4'));

      const storesData = stores.map((e) => {
        const paragraphs = [...e.querySelectorAll('p')].map((e) =>
          e.textContent.trim()
        );
        return {
          address: paragraphs[0] || 'no address',
          city: paragraphs[1] ? paragraphs[1].toLowerCase().trim() : 'no city',
          amount: paragraphs[3] || 'no amount',
        };
      });
      //then get the price
      const priceElements = document.getElementsByClassName('css-6dcbqr');
      const price = priceElements[0].innerText;

      return {
        price: price,
        stores: storesData,
      };
    });

    //filter stores on area
    if (area) {
      const filteredStoresData = result.stores.filter(
        (store) => store.city === area.toLocaleLowerCase()
      );
      console.log(filteredStoresData);
      return filteredStoresData;
    } else {
      return result;
    }
  } catch (e) {
    console.error(e, 'could not get store data');
  } finally {
    browser.close();
  }
};

module.exports = getDrink;
