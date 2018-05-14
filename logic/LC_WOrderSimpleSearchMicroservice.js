const uuidv4 = require('uuid/v4');
const AWS = require("aws-sdk");
const DOC = require("dynamodb-doc");
const tools = require('../util/tools');
const TABLE = 'LC_SearchOrder';
const REGION = 'us-west-2';
const FILTER = '';

const SUCCESS = true;
const  FAIL = false;

function search(search, lastEvaluatedKey, pageSize, res, sendResponse) {

    AWS.config.update({region: REGION});
    const ddb = new AWS.DynamoDB.DocumentClient();

    search = search.toLowerCase();

    tools.sendMessageToQueue(search);

    var pgSize = 10;
    if (isInt(pageSize) === true){
        pgSize = pageSize;
        if (pgSize <= 0){
            pgSize = 10;
        }
    }

    var params = {
        TableName: TABLE,
        FilterExpression : FILTER,
        ExpressionAttributeValues : {":search" : search},
        Limit: pgSize
    };

    if (lastEvaluatedKey){
        params.ExclusiveStartKey = {__ID: lastEvaluatedKey + ''};
    }

    ddb.scan(params, function(err, data) {
        if (err) {
            console.log("Error", err);
            sendResponse({"response":err}, FAIL, res);
        } else {
            console.log("Success", data);
            sendResponse({"response":data}, SUCCESS, res);
        }
    });
}

function isInt(value) {
    var x;
    if (isNaN(value)) {
        return false;
    }
    x = parseFloat(value);
    return (x | 0) === x;
}

exports.search = search;
