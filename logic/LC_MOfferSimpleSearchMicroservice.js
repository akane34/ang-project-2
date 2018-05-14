const uuidv4 = require('uuid/v4');
const AWS = require("aws-sdk");
const DOC = require("dynamodb-doc");
const TABLE = 'LC_Search_Offer';
const REGION = 'us-west-2';
const FILTER = 'contains(product_references, :search) or contains(offer_tags, :search) or contains(product_names, :search) or contains(product_descriptions,:search)';

const SUCCESS = true;
const  FAIL = false;

function search(search, lastEvaluatedKey, res, sendResponse) {

    AWS.config.update({region: REGION});
    const ddb = new AWS.DynamoDB.DocumentClient();

    if (search){
        search = search.toLowerCase();

        var params = {
            TableName: TABLE,
            FilterExpression : FILTER,
            ExpressionAttributeValues : {":search" : search},
            Limit: 6
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
}

exports.search = search;
