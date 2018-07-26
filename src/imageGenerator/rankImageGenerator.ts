import { PhantomJS, WebPage } from "phantom";
/**
 * Created by pierre on 12/11/2017.
 */
const fs = require('fs');
const path = require('path');
const phantom = require('phantom');
const uuid = require('node-uuid');
const numeral = require('numeral');
const i18n = require("i18n");

class RankImageGenerator {

  constructor() {
    numeral.register('locale', 'fr', {
      delimiters: {
        thousands: ' ',
        decimal: ','
      },
      ordinal: function (number: number) {
        return number === 1 ? 'er' : 'ème';
      },
    });
  }

  /**
   * Generates an image related to the rank
   *
   * @param rankDate
   * @param locale
   * @param rank
   * @param username
   * @param score
   * @param photo
   * @returns {Promise.<TResult>}
   */
  public async generate(locale: string, rankDate: string, rank: number, username: string, score: number, photo: string): Promise<string> {

    numeral.locale(locale);

    let htmlFilename = '';
    switch (rank) {
      case 1:
      case 2:
      case 3:
        htmlFilename = 'rank1-2-3.html';
        break;

      default:
        htmlFilename = 'rankn.html';
    }

    let htmlContent = fs.readFileSync(path.join(process.cwd(), `assets/htmls/${htmlFilename}`), 'utf8');
    console.log(htmlContent);

    const dateSplitted: Array<string> = rankDate.split('-');
    const year: string = dateSplitted[0];
    const month: string = dateSplitted[1];
    const monthAstring: string = i18n.__({phrase: `month${month}`, locale: locale});

    const humanDate: string = `${monthAstring} ${year}`;

    htmlContent = htmlContent
      .replace('{{rankDate}}', humanDate)
      .replace('{{rank}}', rank)
      .replace('{{ordinalRank}}', numeral(rank).format('0o'))
      .replace('{{textCongrats}}', i18n.__({phrase: 'congrats', locale: locale}))
      .replace('{{username}}', username)
      .replace('{{score}}', numeral(score).format())
      .replace('{{photo}}', photo);

    const uniqueBasename = uuid.v4();
    const outputPath = path.join(process.cwd(), '_generation', `${uniqueBasename}.html`);
    console.log(outputPath);
    fs.writeFileSync(outputPath, htmlContent);

    //create a phantom instance
    const ph: PhantomJS = await phantom.create();

    //Create a phantom page
    const page: WebPage = await ph.createPage();

    await page.open(outputPath);

    //render the page to png
    const outputImageFile = path.join(process.cwd(), '_generation', `${uniqueBasename}.png`);
    page.property('viewportSize', {width: '1200px', height: '600px'});
    await page.render(outputImageFile, {quality: '100'});

    //remove the html source
    fs.unlinkSync(outputPath);

    //close phantom page
    ph.exit();
    return outputImageFile;
  }
}

export default new RankImageGenerator();
