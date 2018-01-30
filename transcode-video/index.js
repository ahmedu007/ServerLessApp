"use strict";

const AWS = require("aws-sdk");
const elasticTranscoder = new AWS.ElasticTranscoder({
  region: "eu-west-1"
});

exports.handler = function(event, context, callback) {
  const key = event.Records[0].s3.object.key;
  const sourceKey = decodeURIComponent(key.replace(/\+/g, " "));
  const outputKey = sourceKey.split(".")[0];

  console.log("key:", key, sourceKey, outputKey);

  const params = {
    PipelineId: "1517065409501-nqlixk",
    OutputKeyPrefix: outputKey + "/",
    Input: {
      Key: sourceKey
    },
    Outputs: [
      {
        Key: outputKey + "-1080p" + ".mp4",
        PresetId: "1351620000001-000001"
      },
      {
        Key: outputKey + "-720p" + ".mp4",
        PresetId: "1351620000001-000010"
      },
      {
        Key: outputKey + "-web-720p" + ".mp4",
        PresetId: "1351620000001-100070"
      }
    ]
  };

  elasticTranscoder.createJob(params, function(error, data) {
    console.log("data: ", data);
    if (error) {
      callback(error);
    }
  });
};
