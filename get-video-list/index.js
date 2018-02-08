("use strict");

const AWS = require("aws-sdk");
const async = require("async");
const s3 = new AWS.S3();

function createErrorResponse(code, message, encoding) {
  var response = {
    statusCode: code,
    headers: { "Access-Control-Origin": "*" },
    body: JSON.stringify({ code, message, encoding })
  };

  return response;
}

function createSuccessResponse(result) {
  var response = {
    statusCode: 200,
    headers: { "Access-Control-Origin": "*" },
    body: JSON.stringify(result)
  };

  return response;
}

function createBucketParams(next) {
  var params = {
    Bucket: process.env.BUCKET
  };
  next(null, params);
}

function getVideosFromBucket(params, next) {
  s3.listObjects(params, function(err, data) {
    if (err) {
      next(err);
    } else {
      next(null, data);
    }
  });
}

function createList(encoding, data, next) {
  var files = [];
  for (var i = 0; i < data.Contents.length; i++) {
    var file = data.Contents[i];

    if (encoding) {
      var type = file.Key.substr(file.Key.lastIndexOf("-") + 1);
      if (type !== encoding + ".mp4") {
        continue;
      } else {
        if (file.Key.slice(-4) !== ".mp4") {
          continue;
        }
      }
    }

    files.push({
      filename: file.Key,
      eTag: file.ETag.replace(/"/g, ""),
      size: file.Size
    });
  }

  var result = {
    baseUrl: process.env.BASE_URL,
    bucket: process.env.BUCKET,
    files: files
  };
  next(null, result);
}

exports.handler = function(event, context, callback) {
  var encoding = null;
  if (event.queryStringParameters && event.queryStringParameters.encoding) {
    encoding = decodeURIComponent(event.queryStringParameters.encoding);
  }
  async.waterfall(
    [
      createBucketParams,
      getVideosFromBucket,
      async.apply(createList, encoding)
    ],
    function(err, result) {
      if (err) {
        callback(null, createErrorResponse(500, err, encoding));
      } else {
        if (result.files.length > 0) {
          callback(null, createSuccessResponse(result));
        } else {
          callback(
            null,
            createErrorResponse(404, "No files were found", encoding)
          );
        }
      }
    }
  );
};
