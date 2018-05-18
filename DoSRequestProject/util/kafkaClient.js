var kafka = require('kafka-node');

var kafkaConsumer;
var kafkaProducer;

const TOPIC_PRODUCER = "lumenconcept.search";
const TOPIC_CONSUMER = "lumenconcept.trending";
const KAFKA_HOST = process.env.KAFKA_SERVER + ':' + process.env.KAFKA_PORT;

// public methods

exports.suscribeToTrending = suscribe;
exports.notify = notify;

// private methods

function suscribe(callback) {
    var consumer = getConsumer();

    consumer.on('message', function (message) {
        if(callback) callback(message);
    });

    consumer.on('error', function (err) {
        console.log('Error:',err);
    });

    consumer.on('offsetOutOfRange', function (err) {
        console.log('OffsetOutOfRange:',err);
    });
}

function notify(params, callback) {
    var producer = getProducer(),
        payloads = [
            { topic: TOPIC_PRODUCER, messages: params, partition: 0 }
        ];

    producer.on('ready', function () {
        console.log('Producer is ready');
    });

    producer.on('error', function (err) {
        console.log('Producer is in error state');
        console.log(err);
    });

    producer.send(payloads, function (err, data) {
        console.log('Connecting to... ', KAFKA_HOST, ' topic:', TOPIC_PRODUCER);
        if(callback) callback(err || data);
    });
}

function getConsumer() {
    if (!kafkaConsumer) {
        var Consumer = kafka.Consumer,
            client = new kafka.KafkaClient({kafkaHost: KAFKA_HOST}),
            payloads = [{ topic: TOPIC_CONSUMER, offset: 0}],
            options = {autoCommit: false};
        kafkaConsumer = new Consumer(client, payloads, options);
    }

    return kafkaConsumer;
}

function getProducer() {
    if (!kafkaProducer) {
        var Producer = kafka.Producer,
            client = new kafka.KafkaClient({kafkaHost: KAFKA_HOST});
        kafkaProducer = new Producer(client);
    }

    return kafkaProducer;
}