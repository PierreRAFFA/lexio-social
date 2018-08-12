import * as fs from 'fs';
import * as path from 'path';
import * as numeral from 'numeral';
import * as i18n from 'i18n';
import * as html2img from "../services/html2img";

class RankImageGenerator {

  constructor() {
    // numeral.register('locale', 'en', {
    //   delimiters: {
    //     thousands: ' ',
    //     decimal: ','
    //   },
    //   abbreviations: {
    //     thousand: '',
    //     million: '',
    //     billion: '',
    //     trillion: '',
    //   },
    //   ordinal: (num: number): string => {
    //     switch (num) {
    //       case 1:
    //         return 'st';
    //       case 2:
    //         return 'nd';
    //       case 3:
    //         return 'rd';
    //       default:
    //         return 'th';
    //     }
    //   },
    //   currency: {
    //     symbol: 'e'
    //   }
    // });

    numeral.register('locale', 'fr', {
      delimiters: {
        thousands: ' ',
        decimal: ','
      },
      abbreviations: {
        thousand: '',
        million: '',
        billion: '',
        trillion: '',
      },
      ordinal: (num: number): string => {
        return num === 1 ? 'er' : 'ème';
      },
      currency: {
        symbol: 'e'
      }
    });
  }

  /**
   * Generates an image related to the top3 of the ranking
   *
   * @param {string} locale
   * @param {string} rankDate
   * @param {string} player1Name
   * @param {string} player1Photo
   * @param {string} player1Score
   * @param {string} player2Name
   * @param {string} player2Photo
   * @param {string} player2Score
   * @param {string} player3Name
   * @param {string} player3Photo
   * @param {string} player3Score
   * @returns {Promise<string>}
   */
  public async generateRankingImage(
    locale: string,
    rankDate: string,
    player1Name: string,
    player1Photo: string,
    player1Score: number,
    player2Name: string,
    player2Photo: string,
    player2Score: number,
    player3Name: string,
    player3Photo: string,
    player3Score: number): Promise<string> {

    numeral.locale(locale);

    let htmlContent = fs.readFileSync(path.join(process.cwd(), 'assets/htmls/ranking.html'), 'utf8');

    const dateSplitted: Array<string> = rankDate.split('-');
    const year: string = dateSplitted[0];
    const month: string = dateSplitted[1];
    const monthAstring: string = i18n.__({phrase: `month${month}`, locale: locale});

    const humanDate: string = `${monthAstring} ${year}`;

    htmlContent = htmlContent
      .replace('{{rankDate}}', humanDate)
      .replace('{{player1.name}}', player1Name)
      .replace('{{player1.score}}', numeral(player1Score).format())
      .replace('{{player1.photo}}', player1Photo)
      .replace('{{player2.name}}', player2Name)
      .replace('{{player2.score}}', numeral(player2Score).format())
      .replace('{{player2.photo}}', player2Photo)
      .replace('{{player3.name}}', player3Name)
      .replace('{{player3.score}}', numeral(player3Score).format())
      .replace('{{player3.photo}}', player3Photo);

    return await html2img.generateImage(htmlContent);
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
  public async generateUserRanking(locale: string, rankDate: string, rank: number, username: string, score: number, photo: string): Promise<string> {

    numeral.locale(locale);

    let htmlFilename: string = '';
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

    const dateSplitted: Array<string> = rankDate.split('-');
    const year: string = dateSplitted[0];
    const month: string = dateSplitted[1];
    const monthAstring: string = i18n.__({phrase: `month${month}`, locale: locale});

    const humanDate: string = `${monthAstring} ${year}`;

    htmlContent = htmlContent
      .replace('{{rankDate}}', humanDate)
      .replace('{{rank}}', rank.toString())
      .replace('{{ordinalRank}}', numeral(rank).format('0o'))
      .replace('{{textCongrats}}', i18n.__({phrase: 'congrats', locale: locale}))
      .replace('{{username}}', username)
      .replace('{{score}}', numeral(score).format())
      .replace('{{photo}}', photo);

    return await html2img.generateImage(htmlContent);
  }
}

export default new RankImageGenerator();
