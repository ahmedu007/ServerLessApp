"use strict";

const jwt = require("jsonwebtoken");
const request = require("request");

exports.handler = function(event, context, callback) {
  if (!event.authToken) {
    callback("Could not find authToken");
    return;
  }
  const token = event.authToken.split(" ")[1];
  const secretBuffer = new Buffer(process.env.AUTH0_SECRET);
  jwt.verify(token, secretBuffer, function(err, decoded) {
    if (err) {
      console.log("Failed jwt verification: ", err, "auth: ", event.authToken);
      callback("Authorization Failed");
    } else {
      const body = {
        id_token: token
      };
      const options = {
        url: "https://" + process.env.DOMAIN + "/tokeninfo",
        method: "POST",
        json: true,
        body: body
      };
      request(options, function(error, response, body) {
        if (!error && response.statusCode === 200) {
          callback(null, body);
        } else {
          callback(error);
        }
      });
    }
  });
};
