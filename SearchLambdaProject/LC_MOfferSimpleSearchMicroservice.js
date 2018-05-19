const AWS = require("aws-sdk");
const DOC = require("dynamodb-doc");
const http = require('http');
const ADVERTISING_URL = process.env.LC_ADVERTISING_URL;
const ADVERTISING_PATH = process.env.LC_ADVERTISING_PATH;
const ADVERTISING_PORT = process.env.LC_ADVERTISING_PORT;
const PROMO_URL = process.env.LC_PROMO_URL;
const PROMO_PATH = process.env.LC_PROMO_PATH;
const PROMO_PORT = process.env.LC_PROMO_PORT;

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

                        var keyword = event.queryStringParameters.wordKey;
                        if (keyword){
                            callAPIAdvertising(keyword, function (err, advertising) {

                                if (!err){
                                    data.advertising = advertising;
                                }

                                callAPIPromo(keyword, function (err, promo) {

                                    if (!err){
                                        data.promo = promo;
                                    }

                                    callback(null, {
                                        statusCode: 200,
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({"response":data})
                                    });
                                });
                            });
                        }
                        else{
                            callback(null, {
                                statusCode: 200,
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({"response":data})
                            });
                        }
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

function callAPIAdvertising(params, callback) {
    console.log('In callAPI, params: ' + params);
    var options = {
        method: 'GET',
        host: ADVERTISING_URL,
        path: ADVERTISING_PATH + params,
        port: ADVERTISING_PORT,
        headers: {
            'accept': 'application/json',
        }
    };

    var dataStr = "";
    const req = http.request(options, function (response) {
        response.on('data', data => dataStr += data);
        response.on('end', () => callback(undefined, JSON.parse(dataStr)));
    }).on('error', err => callback(err, undefined)
    );

    req.end();
}

function callAPIPromo(params, callback) {
    console.log('In callAPI, params: ' + params);
    var options = {
        method: 'GET',
        host: PROMO_URL,
        path: PROMO_PATH + params,
        port: PROMO_PORT,
        headers: {
            'accept': 'application/json',
        }
    };

    var dataStr = "";
    const req = http.request(options, function (response) {
        response.on('data', data => dataStr += data);
        response.on('end', () => callback(undefined, JSON.parse(dataStr)));
    }).on('error', err => callback(err, undefined)
    );

    req.end();
}