var kafka = require('kafka-node');

var kafkaConsumer;
var kafkaStreamingConsumer;
var kafkaProducer;

const TOPIC_CONSUMER = "lumenconcept.trending";
const KAFKA_HOST = process.env.KAFKA_SERVER + ':' + process.env.KAFKA_PORT;

// public methods

exports.suscribe = suscribe;
exports.streamingSuscribe = streamingSuscribe;
exports.notify = notify;

// private methods

function suscribe(callback) {
    var consumer = getConsumer();

    consumer.on('message', function (message) {
        if(callback) callback(undefined, message);
    });

    consumer.on('error', function (err) {
        console.log('Error:',err);
        if(callback) callback(err, undefined);
    });

    consumer.on('offsetOutOfRange', function (err) {
        console.log('OffsetOutOfRange:',err);
        if(callback) callback(err, undefined);
    });
}

function streamingSuscribe(callback) {
    var consumer = getStreamingConsumer();

    consumer.on('message', function(message) {

        console.log('streamingSuscribe arrive message: ', message);
        var buf = new Buffer(message.value, 'binary'); // Read string into a buffer.
        var decodedMessage = type.fromBuffer(buf.slice(0)); // Skip prefix.

        if(callback) callback(undefined, decodedMessage);
    });

    consumer.on('offsetOutOfRange', function (err) {
        console.log('OffsetOutOfRange:',err);
        if(callback) callback(err, undefined);
    });

    consumer.on('error', function(err) {
        console.log('error', err);
        if(callback) callback(err, undefined);
    });
}

function notify(params, topic, callback) {
    var producer = getProducer(),
        payloads = [
            { topic: topic, messages: params, partition: 0 }
        ];

    producer.on('ready', function () {
        console.log('Producer is ready');
    });

    producer.on('error', function (err) {
        console.log('Producer is in error state');
        console.log(err);
    });

    producer.send(payloads, function (err, data) {
        console.log('Connecting to... ', KAFKA_HOST, ' topic:', topic);
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

function getStreamingConsumer() {
    if (!kafkaStreamingConsumer) {
        var HighLevelConsumer = kafka.HighLevelConsumer;
        var Client = kafka.Client;

        var client = new Client(KAFKA_HOST);
        var topics = [{
            topic: TOPIC_CONSUMER
        }];

        var options = {
            autoCommit: true,
            fetchMaxWaitMs: 1000,
            fetchMaxBytes: 1024 * 1024,
            encoding: 'buffer'
        };
        kafkaStreamingConsumer = new HighLevelConsumer(client, topics, options);
    }

    return kafkaStreamingConsumer;
}

function getProducer() {
    if (!kafkaProducer) {
        var Producer = kafka.Producer,
            client = new kafka.KafkaClient({kafkaHost: KAFKA_HOST});
        kafkaProducer = new Producer(client);
    }

    return kafkaProducer;
}