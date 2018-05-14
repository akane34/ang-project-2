const kafkaServer = process.env.KAFKA_SERVER || 'localhost';
const kafkaPort = process.env.KAFKA_PORT || '9092';
const   kafka = require('kafka-node'),
    Producer = kafka.Producer,
    client = new kafka.Client(kafkaServer + ':' + kafkaPort),
    queueProducer = new Producer(client, {
        requireAcks: 1,
        ackTimeoutMs: 100,
        partitionerType: 2
    });

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
    var payloads = [
        { topic: 'lumenconcept.search', messages: search, partition: 0 }
    ];

    queueProducer.send(payloads, function (err, data) {
        console.log('QUEUE SEND MESSAGE: ' + (err || data));
    });
}

queueProducer.on('ready', function () {console.log('queueProducer ready');});
queueProducer.on('error', function (err) {console.log('ERROR QUEUE SEND MESSAGE: ' + err);})

exports.sendResponse = sendResponse;
exports.sendMessageToQueue = sendMessageToQueue;
