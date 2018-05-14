const kafka = require('./kafkaClient');
const AWS = require("aws-sdk");
const uuidv4 = require('uuid/v4');
const url = require('url');
const ADAPTATIVE_SERVER = 'https://zpx5g8rer6.execute-api.us-west-2.amazonaws.com';


function sendResponse(data, isSuccess, res){

    if (typeof data == 'object') {
        res.send(JSON.stringify(data));
    }
    if (typeof data == 'string') {
        res.send(data);
    }
    else {
        res.send(data.toString());
    }
}

function redirectResponse(path, search, lastEvaluatedKey, pageSize, wordKey, res){

    console.log('Redirect for Adaptative response. Server:', ADAPTATIVE_SERVER + path);

    res.redirect(url.format({
        pathname: ADAPTATIVE_SERVER + path,
        query: {
            "search": search,
            "lastEvaluatedKey": lastEvaluatedKey,
            "pageSize": pageSize,
            "wordKey": wordKey
        }
    }));
}

function sendMessageToQueue(search){
    kafka.notify(search, function (data){
        console.log('QUEUE SEND MESSAGE: ', data);
    });
}

function saveSearchTrending(wordKey, frecuency){
    const TABLE = 'LC_Search_Trending';
    const REGION = 'us-west-2';

    AWS.config.update({region: REGION});
    const ddb = new AWS.DynamoDB.DocumentClient();

    var items = {
        __ID : uuidv4() + '',
        wordKey: wordKey,
        frecuency: frecuency,
        dateL: Date.now()
    };

    var params = {
        TableName: TABLE,
        Item: items
    };

    ddb.put(params, function(err, data) {
        if (err) {
            console.log("Error append dat from queue", ' Detail: ', err);
        }
        else {
            console.log("Success append data from queue", ' Data: ', params.Item);
        }
    });
}

function getSearchTrending(wordKey, callback){
    const TABLE = 'LC_Search_Trending';
    const REGION = 'us-west-2';

    AWS.config.update({region: REGION});
    const ddb = new AWS.DynamoDB.DocumentClient();

    var params = {
        TableName: TABLE,
        FilterExpression : 'contains(wordKey, :wordKey) and dateL >= :dateL',
        ExpressionAttributeValues : {":wordKey" : wordKey, ":dateL": (Date.now() - 600000 )},
        Limit: 6
    };

    ddb.scan(params, function(err, data) {
        if (err) {
            console.log("Error getSearchTrending: ", err);
            callback(undefined);
        } else {
            console.log("Success getSearchTrending: ", data);
            callback(data);
        }
    });
}

function subscribeToQueue(callback){
    kafka.suscribe(callback);
}

exports.sendResponse = sendResponse;
exports.sendMessageToQueue = sendMessageToQueue;
exports.subscribeToQueue = subscribeToQueue;
exports.redirectResponse = redirectResponse;
exports.saveInDynamo = saveSearchTrending;
exports.getSearchTrending = getSearchTrending;
