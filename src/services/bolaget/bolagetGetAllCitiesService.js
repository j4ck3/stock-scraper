const fs = require("fs");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const { executablePath } = require("puppeteer");

const getAllCities = async (url) => {
  console.log("running the scraping");
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: executablePath(),
  });
  const page = await browser.newPage();

  //set age consent cookie
  const decodedValue = '{"state":{"verified":true},"version":0}';
  await page.setCookie({
    name: "systembolaget.age",
    value: decodedValue,
    domain: ".systembolaget.se",
  });

  await page.goto(url, {
    waitUntil: "domcontentloaded",
  });

  //find the show stored button an click it!
  const button = await page.$(".css-103vv0f");

  if (button) {
    await button.click();
    // Listen for the dialog event and dissmiss it.
    page.on("dialog", async (dialog) => {
      await dialog.dismiss();
    });

    //Select hela sverige on the <select> element
    const selectElement = await page.$(".css-dz8wl");
    if (selectElement) {
      const valueToSelect = "sweden";
      await page.select("select", valueToSelect);
    } else {
      console.log("Select element not found");
    }
  } else {
    console.log("Button not found");
    return;
  }

  //Wait for stores then map store content

  await page.waitForSelector(".css-4od5c4");

  const cities = await page.evaluate(async () => {
    const stores = Array.from(document.querySelectorAll(".css-4od5c4"));

    const data = stores.map((item) => {
      let city = item
        .querySelector(".css-1tkalz1 .css-1cwtvfm")
        .textContent.trim();

      return city;
    });
    return data;
  });

  browser.close();

  function writeArrayToJsonFile(array, filename) {
    const jsonArray = JSON.stringify(array, null, 2);

    fs.writeFile(filename, jsonArray, (err) => {
      if (err) {
        console.error("Error writing to file:", err);
      } else {
        console.log("JSON array has been written to the file:", filename);
      }
    });
  }

  const filename = "output.json";

  writeArrayToJsonFile(cities, filename);
};

module.exports = getAllCities;
