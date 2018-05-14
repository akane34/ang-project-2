var kafka = require('./kafkaClient');

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

function sendMessageToQueue(search){
    kafka.notify(search, function (data){
        console.log('QUEUE SEND MESSAGE: ', data);
    });
}

exports.sendResponse = sendResponse;
exports.sendMessageToQueue = sendMessageToQueue;
