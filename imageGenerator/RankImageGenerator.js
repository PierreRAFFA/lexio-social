/**
 * Created by pierre on 12/11/2017.
 */
const fs = require('fs');
const path = require('path');
const phantom = require('phantom');
const uuid = require('node-uuid');
const numeral = require('numeral');
const i18n = require("i18n");

function RankImageGenerator() {

  numeral.register('locale', 'fr', {
    delimiters: {
      thousands: ' ',
      decimal: ','
    },
    ordinal : function (number) {
      return number === 1 ? 'er' : 'ème';
    },
  });
}

/**
 * Generates an image related to the rank
 *
 * @param eventNumber
 * @param locale
 * @param rank
 * @param username
 * @param score
 * @param photo
 * @returns {Promise.<TResult>}
 */
RankImageGenerator.prototype.generate = function(locale, eventNumber, rank, username, score, photo) {

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

  let htmlContent = fs.readFileSync(path.join(__dirname, `assets/htmls/${htmlFilename}`), 'utf8');
  console.log(htmlContent);

  htmlContent = htmlContent
    .replace('{{eventNumber}}', eventNumber)
    .replace('{{rank}}', rank)
    .replace('{{ordinalRank}}', numeral(rank).format('0o'))
    .replace('{{textCongrats}}', i18n.__({phrase: 'congrats', locale: locale}))
    .replace('{{username}}', username)
    .replace('{{score}}', numeral(score).format())
    .replace('{{photo}}', photo);

  const uniqueBasename = uuid.v4();
  const outputPath = path.join(__dirname, 'assets/htmls' , `${uniqueBasename}.html`);
  fs.writeFileSync(outputPath, htmlContent);

  //create a phantom instance
  return phantom.create().then(ph => {

    //Create a phantom page
    return ph.createPage().then(page => {

      //open a html page
      return page.open(outputPath).then(() => {

        //render the page to png
        const outputImageFile = path.join('tmp', `${uniqueBasename}.png`);
        page.property('viewportSize', { width: '1200px', height: '600px' });
        return page.render(outputImageFile, {quality: 100}).then(() => {

          //remove the html source
          fs.unlinkSync(outputPath);

          //close phantom page
          ph.exit();
          return outputImageFile;
        });
      });
    })
  })
};

module.exports = new RankImageGenerator();