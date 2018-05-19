const AWS = require("aws-sdk");
const DOC = require("dynamodb-doc");

const TABLE = process.env.TABLE;
AWS.config.update({region: process.env.REGION});
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = function(event, context, callback){
    switch (event.httpMethod) {
        case 'GET':

            if (event.queryStringParameters && event.queryStringParameters.search){
                var search = event.queryStringParameters.search.toLowerCase();

                var params = {
                    TableName: TABLE,
                    FilterExpression : process.env.FILTER,
                    ExpressionAttributeValues : {":search" : search},
                    Limit: 6
                };

                if (event.queryStringParameters.lastEvaluatedKey){
                    params.ExclusiveStartKey = {__ID: event.queryStringParameters.lastEvaluatedKey + ''};
                }

                ddb.scan(params, function(err, data) {
                    if (err) {
                        console.log("Error", err);
                        callback(null, {
                            statusCode: 200,
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({"response":err})
                        });
                    } else {
                        console.log("Success", data);
                        callback(null, {
                            statusCode: 200,
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({"response":data})
                        });
                    }
                });
            }
            else {
                callback(null, {
                    statusCode: 200,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({"response":[]})
                });
            }
            break;
        default:
            callback(null, {
                statusCode: 400,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({"response":`Unsupported method "${event.httpMethod}"`})
            });
    }

};