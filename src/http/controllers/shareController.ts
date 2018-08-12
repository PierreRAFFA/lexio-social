import { Request, Response } from "express";
import { filter, head, take } from "lodash";
import * as fs from 'fs';
import * as i18n from 'i18n';
import * as FormData from 'form-data';

import { lexio, LexioRequest, IRankingItem, IRanking, getAuthenticatedUser, createError, IFullUser } from "lexio";
import logger from "../../logger";
import rankImageGenerator from '../../imageGenerator/rankImageGenerator';
import * as fb from "../../services/fb";


/**
 *
 * @param {LexioRequest} req
 * @param {e.Response} res
 * @returns {Promise<Response>}
 */
export let shareUserRanking = async (req: LexioRequest, res: Response) => {
  const locale: string = req.body.locale;
  const rankingReference: string = req.body.rankingReference;

  const authenticatedUser: IFullUser = getAuthenticatedUser(req);

  //get the ranking from reference
  let ranking: IRanking;
  try {
    ranking = await lexio.fromReq(req).getRanking(locale, rankingReference);
  } catch (e) {
    return res.status(404).send(createError('No Ranking found', 404));
  }

  if (ranking) {
    if (ranking.userPosition >= 0) {

      //get user ranking
      const userRanking: IRankingItem = ranking.ranking[ranking.userPosition];
      const score: number = userRanking.score;
      const facebookAccessToken: string = authenticatedUser.identities[0].credentials.accessToken;
      const facebookId: string = authenticatedUser.identities[0].profile.id;
      const photo: string = authenticatedUser.identities[0].profile.photos[0].value;

      //generate the image
      let imagePath: string;
      try {
        imagePath = await rankImageGenerator.generateUserRanking(
          locale,
          ranking.reference,
          ranking.userPosition + 1,
          authenticatedUser.username,
          score,
          photo
        );
      } catch (e) {
        logger.error(e.stack);
      }

      if (imagePath) {

        // share the rank
        const form = new FormData(); //Create multipart form
        form.append('file', fs.createReadStream(imagePath));
        form.append('caption', i18n.__({phrase: 'caption', locale: locale}));
        form.append('privacy', JSON.stringify({value: 'SELF'}));
        form.append('tags', JSON.stringify([{x: 62, y: 8, tag_uid: facebookId, tag_text: authenticatedUser.username}]));

        try {
          const result: any = await fb.publishToFacebook(form, facebookAccessToken, imagePath);
          return res.status(200).json(result);
        } catch (e) {
          throw e;
        }
      } else {
        throw createError('The image could not be generated', 500);
      }
    } else {
      return res.status(401).send(createError('You have not played during this month', 401));
    }
  }
};

/**
 *
 * @param {LexioRequest} req
 * @param {e.Response} res
 * @returns {Promise<void>}
 */
export async function shareRanking(req: LexioRequest, res: Response) {
  const locale: string = req.body.locale;
  const rankingReference: string = req.body.rankingReference;

  //get the ranking from reference
  let ranking: IRanking;
  try {
    ranking = await lexio.fromReq(req).getRanking(locale, rankingReference);
  } catch (e) {
    return res.status(404).send(createError('No Ranking found', 404));
  }

  if (ranking) {
    const top3: Array<IRankingItem> = take<IRankingItem>(ranking.ranking, 3);

    //get information from the top3
    const player1Name: string = top3[0].user.username;
    const player1Photo: string = top3[0].user.identities[0].profile.photos[0].value;
    const player1Score: number = top3[0].score;
    const player2Name: string = top3[1].user.username;
    const player2Photo: string = top3[1].user.identities[0].profile.photos[0].value;
    const player2Score: number = top3[1].score;
    const player3Name: string = top3[2].user.username;
    const player3Photo: string = top3[2].user.identities[0].profile.photos[0].value;
    const player3Score: number = top3[2].score;

    //generate the image
    let imagePath: string;
    try {
      imagePath = await rankImageGenerator.generateRankingImage(
        locale,
        ranking.reference,
        player1Name,
        player1Photo,
        player1Score,
        player2Name,
        player2Photo,
        player2Score,
        player3Name,
        player3Photo,
        player3Score
      );
    } catch (e) {
      logger.error(e.stack);
    }

    if (imagePath) {
      //get authenticated user facebook
      const authenticatedUser: IFullUser = getAuthenticatedUser(req);
      const facebookAccessToken: string = authenticatedUser.identities[0].credentials.accessToken;
      const facebookId: string = authenticatedUser.identities[0].profile.id;

      // share the rank
      const form = new FormData(); //Create multipart form
      form.append('file', fs.createReadStream(imagePath));
      form.append('caption', i18n.__({phrase: 'caption', locale: locale}));
      form.append('privacy', JSON.stringify({value: 'SELF'}));
      form.append('tags', JSON.stringify([{x: 62, y: 8, tag_uid: facebookId, tag_text: authenticatedUser.username}]));

      try {
        const result: any = await fb.publishToFacebook(form, facebookAccessToken, imagePath);
        return res.status(200).json(result);
      } catch (e) {
        throw e;
      }
    } else {
      throw createError('The image could not be generated', 500);
    }
  }
}

// /**
//  * Publishes on facebook
//  *
//  * @param {string} facebookAccessToken
//  * @param {string} locale
//  * @param {string} rankDate
//  * @param {number} rank
//  * @param {string} username
//  * @param {string} facebookId
//  * @param {number} score
//  * @param {string} photo
//  * @returns {Promise<any>}
//  */
// async function publishUserRanking(
//   facebookAccessToken: string,
//   locale: string,
//   rankDate: string,
//   rank: number,
//   username: string,
//   facebookId: string,
//   score: number,
//   photo: string): Promise<any> {
//
//   //generate the image
//   let imagePath: string;
//   try {
//     imagePath = await rankImageGenerator.generateUserRanking(locale, rankDate, rank, username, score, photo);
//   } catch (e) {
//     logger.error(e.stack);
//   }
//
//   if (imagePath) {
//
//     // share the rank
//     const form = new FormData(); //Create multipart form
//     form.append('file', fs.createReadStream(imagePath));
//     form.append('caption', i18n.__({phrase: 'caption', locale: locale}));
//     form.append('privacy', JSON.stringify({value: 'SELF'}));
//     form.append('tags', JSON.stringify([{x: 62, y: 8, tag_uid: facebookId, tag_text: username}]));
//
//     try {
//       return await fb.publishToFacebook(form, facebookAccessToken, imagePath);
//     } catch (e) {
//       throw e;
//     }
//   } else {
//     throw createError('The image could not be generated', 500);
//   }
// }
