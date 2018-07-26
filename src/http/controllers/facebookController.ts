import { Request, Response } from "express";
import { IncomingMessage } from "http";
import logger from "../../logger";
import rankImageGenerator from '../../imageGenerator/rankImageGenerator';

import * as fs from 'fs';
import * as i18n from 'i18n';
import * as https from 'https';
import * as FormData from 'form-data';


export let shareUserRanking = async (req: Request, res: Response) => {

  const {fbAccessToken, locale, rankDate, rank, username, fbId, score, photo} = req.body;

  //generate the image
  let imageResult: string;
  try {
    imageResult = await rankImageGenerator.generate(locale, rankDate, rank, username, score, photo);
  } catch (e) {
    logger.error(e.stack);
  }

  // share the rank
  const form = new FormData(); //Create multipart form
  form.append('file', fs.createReadStream(imageResult));
  form.append('caption', i18n.__({phrase: 'caption', locale: locale}));
  form.append('privacy', JSON.stringify({value: 'SELF'}));
  form.append('tags', JSON.stringify([{x: 62, y: 8, tag_uid: fbId, tag_text: username}]));

  //POST request options, notice 'path' has access_token parameter
  const params = {
    method: 'post',
    host: 'graph.facebook.com',
    path: '/v2.11/me/photos?access_token=' + fbAccessToken,
    headers: form.getHeaders(),
  };

  //Do POST request, callback for response
  const request = https.request(params, function (fbRes: IncomingMessage) {

    fbRes.on('data', function (data: string) {
      //remove the generated image
      fs.unlinkSync(imageResult);

      const buff = new Buffer(data, 'base64');
      const text = buff.toString('ascii');
      const json = JSON.parse(text);

      res.status(200).json(json);
    });
  });

  //Binds form to request
  form.pipe(request);

  //If anything goes wrong (request-wise not FB)
  request.on('error', function (error: any) {

    //remove the generated image
    fs.unlinkSync(imageResult);

    res.status(500).json(error);
  });
};
