const kafka = require('./kafkaClient');
const AWS = require("aws-sdk");
const uuidv4 = require('uuid/v4');
const url = require('url');
const SEARCH_ADAPTATIVE_SERVER = 'https://zpx5g8rer6.execute-api.us-west-2.amazonaws.com';
const DoS_ADAPTATIVE_SERVER = 'https://zpx5g8rer6.execute-api.us-west-2.amazonaws.com';
const TOPIC_PRODUCER_SEARCH = "lumenconcept.search";
const TOPIC_PRODUCER_REQUEST = "lumenconcept.request";

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

function redirectSearchResponse(path, search, lastEvaluatedKey, pageSize, wordKey, res){

    console.log('Redirect for Adaptative response. Server:', SEARCH_ADAPTATIVE_SERVER + path);

    res.redirect(url.format({
        pathname: SEARCH_ADAPTATIVE_SERVER + path,
        query: {
            "search": search,
            "lastEvaluatedKey": lastEvaluatedKey,
            "pageSize": pageSize,
            "wordKey": wordKey
        }
    }));
}

function redirectRequestDoSResponse(path, ip, res){

    console.log('Redirect for Adaptative response. Server:', SEARCH_ADAPTATIVE_SERVER + path);

    res.redirect(url.format({
        pathname: DoS_ADAPTATIVE_SERVER + path,
        query: {
            "ip": ip,
            "timeL": Date.now()
        }
    }));
}

function sendSearchMessageToQueue(search){
    kafka.notify(search, TOPIC_PRODUCER_SEARCH, function (data){
        console.log('QUEUE SEND MESSAGE ', TOPIC_PRODUCER_SEARCH, ': ', data);
    });
}

function sendRequestMessageToQueue(iprequest){
    kafka.notify(iprequest, TOPIC_PRODUCER_REQUEST, function (data){
        console.log('QUEUE SEND MESSAGE ', TOPIC_PRODUCER_REQUEST, ': ', data);
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

function saveRequestDoS(ip, frecuency){
    const TABLE = 'LC_Request_DoS';
    const REGION = 'us-west-2';

    AWS.config.update({region: REGION});
    const ddb = new AWS.DynamoDB.DocumentClient();

    var items = {
        __ID : uuidv4() + '',
        ip: ip,
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

function getRequestDoS(ip, callback){
    const TABLE = 'LC_Request_DoS';
    const REGION = 'us-west-2';

    AWS.config.update({region: REGION});
    const ddb = new AWS.DynamoDB.DocumentClient();

    var params = {
        TableName: TABLE,
        FilterExpression : 'contains(ip, :ip) and dateL >= :dateL',
        ExpressionAttributeValues : {":ip" : ip, ":dateL": (Date.now() - 600000 )},
        Limit: 6
    };

    ddb.scan(params, function(err, data) {
        if (err) {
            console.log("Error getRequestDoS: ", err);
            callback(undefined);
        } else {
            console.log("Success getRequestDoS: ", data);
            callback(data);
        }
    });
}

function subscribeToTrendingQueue(callback){
    kafka.suscribeToTrending(function(err, data){
        if (err)
            callback();
        else{
            var json = JSON.parse(data.value);
            callback(json.word, json.frequency);
        }
    });
}

function subscribeToDoSQueue(callback){
    kafka.suscribeToDoS(function(err, data){
        console.log('subscribeToDoSQueue: ', err || data);
        if (err)
            callback();
        else{
            var json = JSON.parse(data.value);
            callback(json.word, json.frequency);
        }
    });
}

function streamingSubscribeToQueue(callback){
    kafka.streamingSuscribe(function(err, data){
        if (err)
            callback();
        else{
            var json = JSON.parse(data);
            callback(json.word, json.frecuency);
        }
    });
}


exports.sendResponse = sendResponse;
exports.sendSearchMessageToQueue = sendSearchMessageToQueue;
exports.sendRequestMessageToQueue = sendRequestMessageToQueue;
exports.subscribeToTrendingQueue = subscribeToTrendingQueue;
exports.subscribeToDoSQueue = subscribeToDoSQueue;
exports.redirectSearchResponse = redirectSearchResponse;
exports.redirectRequestDoSResponse = redirectRequestDoSResponse;
exports.saveSearchTrending = saveSearchTrending;
exports.getSearchTrending = getSearchTrending;
exports.streamingSubscribeToQueue = streamingSubscribeToQueue;
exports.saveRequestDoS = saveRequestDoS;
exports.getRequestDoS = getRequestDoS;
