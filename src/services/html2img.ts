import * as path from "path";
import * as puppeteer from "puppeteer";
import { Response } from "request";
import { Browser } from "puppeteer";
import { Page } from "puppeteer";
import * as uuid from "node-uuid";
import * as requestPromise from "request-promise";
import * as url from "url";

const lookupAsync = require('util').promisify(require('dns').lookup);

/**
 * Generates an image base on the html and returns the image filepath
 *
 * @param {string} htmlContent
 * @returns {Promise<string>}
 */
export async function generateImage(htmlContent: string): Promise<string> {
  const options = {
    uri: `http://lexio-puppeteer:9222/json/version`,
    json: true,
    resolveWithFullResponse: true,
    headers: {
      host: 'localhost',
    }
  };

  console.log(options);

  try {
    const serviceResponse: Response = await requestPromise(options);

    const webSocket = serviceResponse.body.webSocketDebuggerUrl;
    console.log(`WebsocketUrl: ${webSocket}`);

    const endPoint = await changeUrlHostToUseIp(webSocket);
    console.log(endPoint);

    const browser: Browser = await puppeteer.connect({browserWSEndpoint: endPoint, ignoreHTTPSErrors: true});
    const page: Page = await browser.newPage();
    page.setViewport({
      width: 1200,
      height: 630,
    });
    console.log(1);
    await page.goto(`data:text/html,${htmlContent}`, {waitUntil: 'networkidle0'});
    console.log(2);
    const uniqueBasename = uuid.v4();
    const outputImageFile = path.join('/tmp', `${uniqueBasename}.png`);

    await page.screenshot({
      path: outputImageFile
    });
    console.log(3);
    //remove the html source
    // fs.unlinkSync(outputPath);

    return outputImageFile;

  } catch (e) {
    console.log(e);
  }
}

/**
 *
 * @param {string} urlString
 * @returns {Promise<string>}
 */
async function changeUrlHostToUseIp(urlString: string) {
  const urlParsed = url.parse(urlString);
  const {address: hostIp} = await lookupAsync('lexio-puppeteer');
  delete urlParsed.host;
  urlParsed.hostname = hostIp;
  urlParsed.port = '9222';
  return url.format(urlParsed);
}
