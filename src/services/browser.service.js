

const puppeteer = require("puppeteer");

let browser = null;

const launchBrowser = async () => {
  const instance = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  instance.on("disconnected", () => {
    console.log("Puppeteer browser disconnected.");
    browser = null;
  });

  return instance;
};

const getBrowser = async () => {
  try {
   
    if (!browser) {
      browser = await launchBrowser();
    }

    
    if (!browser.connected) {
      browser = await launchBrowser();
    }

    return browser;
  } catch (err) {
    console.log("Browser launch failed:", err);

    browser = await launchBrowser();

    return browser;
  }
};

module.exports = getBrowser;
