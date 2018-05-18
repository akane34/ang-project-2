const AWS = require("aws-sdk");
const MongoClient = require('mongodb').MongoClient;
const server = process.env.LC_MONGODB_SERVER;
const port = process.env.LC_MONGODB_PORT;
const database = process.env.LC_MONGODB_DATABASE;
const url = 'mongodb://' + server + ':' + port;
const COLLECTION = 'LC_Advertising';

const TABLE = process.env.TABLE;
AWS.config.update({region: process.env.REGION});
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = function(event, context, callback){
    switch (event.httpMethod) {
        case 'GET':

            if (event.queryStringParameters && event.queryStringParameters.search){
                var search = event.queryStringParameters.search.toLowerCase()

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

                        var keyword = event.queryStringParameters.keyword;
                        if (keyword){
                            findByElement(query, res, sendResponse)
                        }

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

function findByElement(query, res, sendResponse) {

    MongoClient.connect(url, function (err, db) {
        if (err) {
            console.log(err);
            sendResponse(err, FAIL, res);
        }
        else {
            var dbo = db.db(database);

            var mysort = {creationDate: -1};
            dbo.collection(COLLECTION).find(query).sort(mysort).toArray(function (err, result) {
                var data = {};
                if (err)
                    data = err;
                else
                    data = result;

                db.close();
                sendResponse(data, SUCCESS, res);
            });
        }
    });
}