'use strict';

const fs = require('fs');
const https = require('https');
const request = require('request-promise');
const FormData = require('form-data');
const rankImageGenerator = require('../../imageGenerator/RankImageGenerator');
const i18n = require("i18n");

module.exports = function(Share) {
  Share.disableRemoteMethodByName('create');
  Share.disableRemoteMethodByName('findById');
  Share.disableRemoteMethodByName('find');
  Share.disableRemoteMethodByName('upsert');
  Share.disableRemoteMethodByName('updateAll');
  Share.disableRemoteMethodByName('exists');
  Share.disableRemoteMethodByName('findOne');
  Share.disableRemoteMethodByName('deleteById');
  Share.disableRemoteMethodByName('count');
  Share.disableRemoteMethodByName('replaceOrCreate');
  Share.disableRemoteMethodByName('createChangeStream');
  Share.disableRemoteMethodByName('replaceById');
  Share.disableRemoteMethodByName('upsertWithWhere');
  Share.disableRemoteMethodByName('prototype.patchAttributes');


  /**
   * Returns the 15 latest games played
   * Calls the AuthService to get the user informations (send accessToken and not JWT)
   */
  Share.remoteMethod('rank', {
    http: {
      path: '/rank',
      verb: 'post'
    },
    accepts: [
      {"arg": "fbAccessToken", "type": "string"},
      {"arg": "locale", "type": "string"},
      {"arg": "eventNumber", "type": "number"},
      {"arg": "rank", "type": "number"},
      {"arg": "username", "type": "string"},
      {"arg": "facebookId", "type": "string"},
      {"arg": "score", "type": "number"},
      {"arg": "photo", "type": "string"},
      {"arg": "options", "type": "object", "http": "optionsFromRequest"}
    ],
    returns: { arg:'game', type: 'object', root: true }
  });

  Share.rank = function (fbAccessToken, locale, eventNumber, rank, username, facebookId, score, photo, options, cb) {
    console.log('rank');

    //generate the image
    rankImageGenerator.generate(locale, eventNumber, rank, username, score, photo).then(imageResult => {
      //share the rank
      console.log(imageResult);
      const form = new FormData(); //Create multipart form
      form.append('file', fs.createReadStream(imageResult));
      form.append('caption', i18n.__({phrase: 'share.ranking.caption', locale: locale}));
      form.append('privacy', JSON.stringify({value: 'SELF'}));
      form.append('tags', JSON.stringify([{x: 62, y: 8, tag_uid: facebookId, tag_text: username}]));

      //POST request options, notice 'path' has access_token parameter
      const params = {
        method: 'post',
        host: 'graph.facebook.com',
        path: '/v2.11/me/photos?access_token=' + fbAccessToken,
        headers: form.getHeaders(),
      };

      //Do POST request, callback for response
      const request = https.request(params, function (res){

        res.on('data', function(data) {
          //remove the generated image
          fs.unlinkSync(imageResult);

          const buff = new Buffer(data, 'base64');
          const text = buff.toString('ascii');
          const json = JSON.parse(text);


          cb(null, json);
        });

      });

      //Binds form to request
      form.pipe(request);

      //If anything goes wrong (request-wise not FB)
      request.on('error', function (error) {

        //remove the generated image
        fs.unlinkSync(imageResult);

        cb(err);
      });
    });
  };
};


