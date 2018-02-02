"use strict";
const jwt = require("jsonwebtoken");
const generatePolicy = function(principalId, effect, resource) {
  const authResponse = {};
  authResponse.principalId = principalId;
  if (effect && resource) {
    const policyDocument = {};
    policyDocument.Version = "2012-10-17";
    policyDocument.Statement = [];
    const statementOne = {};
    statementOne.Action = "execute-api:Invoke";
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;

    authResponse.policyDocument = policyDocument;
  }
  return authResponse;
};
exports.handler = function(event, context, callback) {
  if (!event.authorizationToken) {
    callback("Could not find authToken");
    return;
  }
  const token = event.authorizationToken.split(" ")[1];
  const secretBuffer = new Buffer(process.env.AUTH0_SECRET);
  jwt.verify(token, secretBuffer, function(err, decoded) {
    if (err) {
      console.log(
        "Failed jwt verification: ",
        err,
        "auth: ",
        event.authorizationToken
      );

      callback("Authorization Failed");
    } else {
      callback(null, generatePolicy("user", "allow", event.methodArn));
    }
  });
};
