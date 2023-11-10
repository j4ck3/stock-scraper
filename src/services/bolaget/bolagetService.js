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

  // set age consent cookie
  const decodedValue = '{"state":{"verified":true},"version":0}';
  await page.setCookie({
    name: 'systembolaget.age',
    value: decodedValue,
    domain: '.systembolaget.se',
  });

  await page.goto(url, {
    waitUntil: 'domcontentloaded',
  });

  //find & click the available stores button
  try {
    const button = await page.waitForSelector('.css-qj2vkn');
    button.click();
  } catch {
    console.error(`available stores button not found`);
    browser.close();
    return;
  }

  // Listen for share my location dialog event & dismiss it.
  page.on('dialog', async (dialog) => {
    await dialog.dismiss();
  });

  try {
    await page.waitForSelector('.css-1mcoogq');
    await page.select('select', 'sweden');
  } catch {
    console.log('Select element not found');
    browser.close();
    return;
  }

  try {
    await page.waitForSelector('.css-4od5c4');
    await page.waitForSelector('.css-1df247k');
  } catch (e) {
    console.error('could not find selectors for stores');
  }

  // get the price and stocks of all the stores
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

      const elements = document.getElementsByClassName('css-1df247k');
      const pp = elements[0].innerText;



      return {
        price: pp,
        stores: storesData,
      };
    });

    //filter stores on area
    if (area) {
      const filteredStoresData = result.stores.filter(
        (store) => store.city === area.toLocaleLowerCase()
      );
      return {
        price: result.price,
        stores: filteredStoresData,
      };
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
