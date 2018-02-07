"use strict";

const AWS = require("aws-sdk");
const async = require("async");
const SES = new AWS.SES();

function createMessage(toList, fromEmail, subject, message, next) {
  var params = {
    Source: fromEmail,
    Destination: { ToAddresses: toList },
    Message: {
      Subject: {
        Data: subject
      },
      Body: {
        Text: {
          Data: message
        }
      }
    }
  };
  next(null, params);
}
function dispatch(params, next) {
  SES.sendEmail(params, function(err, data) {
    if (err) {
      next(err);
    } else {
      next(null, data);
    }
  });
}
function send(toList, fromEmail, subject, message) {
  async.waterfall(
    [createMessage.bind(this, toList, fromEmail, subject, message), dispatch],
    function(err, result) {
      if (err) {
        console.log("Error sending email", err);
      } else {
        console.log("Email Sent Successfully", result);
      }
    }
  );
}
module.exports = {
  send: send
};
