import * as FormData from 'form-data';
import * as https from 'https';
import * as fs from 'fs';
import { IncomingMessage } from "http";

/**
 * Publishes a post in Facebook
 *
 * @param {FormData} form
 * @param {string} facebookAccessToken
 * @param {string} imagePath
 * @returns {Promise<any>}
 */
export async function publishToFacebook(form: FormData, facebookAccessToken: string, imagePath: string): Promise<any> {
  console.log('publishToFacebook');
  return new Promise(async (resolve, reject) => {
    //POST request options, notice 'path' has access_token parameter
    const params = {
      method: 'post',
      host: 'graph.facebook.com',
      path: '/v2.11/me/photos?access_token=' + facebookAccessToken,
      headers: form.getHeaders(),
    };

    //Do POST request, callback for response
    const request = https.request(params, function (fbRes: IncomingMessage) {

      fbRes.on('data', function (data: string) {
        //remove the generated image
        fs.unlinkSync(imagePath);

        const buff = new Buffer(data, 'base64');
        const text = buff.toString('ascii');
        const json = JSON.parse(text);

        resolve(json);
      });
    });

    //Binds form to request
    form.pipe(request);

    //If anything goes wrong (request-wise not FB)
    request.on('error', function (error: any) {

      //remove the generated image
      fs.unlinkSync(imagePath);

      reject(error);
    });
  });
}
