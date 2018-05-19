const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();

exports.handler = function(event, context) {
    if (CONFIG.length === 0) {
        return context.done();
    }

    for (var i = 0; i < CONFIG.length; i++) {
        pollQueue(CONFIG[i]);
    }
    console.log('exiting');
}

function pollQueue(params) {

    if (params.queueUrl === "" || params.functionName === "") {
        return;
    }

    var sqsParams = {
        QueueUrl: params.queueUrl,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 1
    };

    const options = {
        accessKeyId: params.queueAccessKeyId,
        secretAccessKey: params.queueSecretAccessKey,
        apiVersion: '2012-11-05'
    };

    const sqs = new AWS.SQS(options);

    sqs.receiveMessage(sqsParams, function(err, data) {

        if (err) {
            console.log('SQS invocation fail:', params.queueUrl, ' Details: ', err);
            return;
        }

        console.log('SQS invocation success: ', params.queueUrl);

        if (!data.Messages || data.Messages.length === 0) {
            console.log('SQS messages empty: ', params.queueUrl);
            return;
        }

        var lambdaParams = {
            FunctionName: params.functionName,
            InvocationType: "Event",
            Payload: JSON.stringify({
                action: params.action,
                queueUrl: params.queueUrl,
                table: params.table,
                message: data.Messages[0].Body
            })
        };

        lambda.invoke(lambdaParams, function(err) {
            if (err) {
                console.log('Function invocation fail: ', params.functionName, ' Details: ', err);
                return;
            }

            console.log('Function invocation success: ', params.functionName);
        });
    });
}

const CONFIG = [
    {
        queueUrl: process.env.CATALOG_QUEUE_URL_APPEND,
        queueAccessKeyId: process.env.CATALOG_QUEUE_ACCESS_KEY_APPEND,
        queueSecretAccessKey: process.env.CATALOG_QUEUE_SECRET_ACCESS_KEY_APPEND,
        functionName: process.env.CATALOG_FUNCTION_NAME,
        action: "append",
        table: process.env.OFFER_TABLE
    },
    {
        queueUrl: process.env.CATALOG_QUEUE_URL_REMOVE,
        queueAccessKeyId: process.env.CATALOG_QUEUE_ACCESS_KEY_REMOVE,
        queueSecretAccessKey: process.env.CATALOG_QUEUE_SECRET_ACCESS_KEY_REMOVE,
        functionName: process.env.CATALOG_FUNCTION_NAME,
        action: "remove",
        table: process.env.OFFER_TABLE
    },
    {
        queueUrl: process.env.PROVIDER_QUEUE_URL_APPEND,
        queueAccessKeyId: process.env.PROVIDER_QUEUE_ACCESS_KEY_APPEND,
        queueSecretAccessKey: process.env.PROVIDER_QUEUE_SECRET_ACCESS_KEY_APPEND,
        functionName: process.env.PROVIDER_FUNCTION_NAME,
        action: "append",
        table: process.env.PROVIDER_TABLE
    },
    {
        queueUrl: process.env.PROVIDER_QUEUE_URL_REMOVE,
        queueAccessKeyId: process.env.PROVIDER_QUEUE_ACCESS_KEY_REMOVE,
        queueSecretAccessKey: process.env.PROVIDER_QUEUE_SECRET_ACCESS_KEY_REMOVE,
        functionName: process.env.PROVIDER_FUNCTION_NAME,
        action: "remove",
        table: process.env.PROVIDER_TABLE
    },
    {
        queueUrl: process.env.ORDER_QUEUE_URL_APPEND,
        queueAccessKeyId: process.env.ORDER_QUEUE_ACCESS_KEY_APPEND,
        queueSecretAccessKey: process.env.ORDER_QUEUE_SECRET_ACCESS_KEY_APPEND,
        functionName: process.env.ORDER_FUNCTION_NAME,
        action: "append",
        table: process.env.ORDER_TABLE
    },
    {
        queueUrl: process.env.ORDER_QUEUE_URL_REMOVE,
        queueAccessKeyId: process.env.ORDER_QUEUE_ACCESS_KEY_REMOVE,
        queueSecretAccessKey: process.env.ORDER_QUEUE_SECRET_ACCESS_KEY_REMOVE,
        functionName: process.env.ORDER_FUNCTION_NAME,
        action: "remove",
        table: process.env.ORDER_TABLE
    },
    {
        queueUrl: process.env.QUOTATION_QUEUE_URL_APPEND,
        queueAccessKeyId: process.env.QUOTATION_QUEUE_ACCESS_KEY_APPEND,
        queueSecretAccessKey: process.env.QUOTATION_QUEUE_SECRET_ACCESS_KEY_APPEND,
        functionName: process.env.QUOTATION_FUNCTION_NAME,
        action: "append",
        table: process.env.QUOTATION_TABLE
    },
    {
        queueUrl: process.env.QUOTATION_QUEUE_URL_REMOVE,
        queueAccessKeyId: process.env.QUOTATION_QUEUE_ACCESS_KEY_REMOVE,
        queueSecretAccessKey: process.env.QUOTATION_QUEUE_SECRET_ACCESS_KEY_REMOVE,
        functionName: process.env.QUOTATION_FUNCTION_NAME,
        action: "remove",
        table: process.env.QUOTATION_TABLE
    },
    {
        queueUrl: process.env.SALE_QUEUE_URL_APPEND,
        queueAccessKeyId: process.env.SALE_QUEUE_ACCESS_KEY_APPEND,
        queueSecretAccessKey: process.env.SALE_QUEUE_SECRET_ACCESS_KEY_APPEND,
        functionName: process.env.SALE_FUNCTION_NAME,
        action: "append",
        table: process.env.SALE_TABLE
    },
    {
        queueUrl: process.env.SALE_QUEUE_URL_REMOVE,
        queueAccessKeyId: process.env.SALE_QUEUE_ACCESS_KEY_REMOVE,
        queueSecretAccessKey: process.env.SALE_QUEUE_SECRET_ACCESS_KEY_REMOVE,
        functionName: process.env.SALE_FUNCTION_NAME,
        action: "remove",
        table: process.env.SALE_TABLE
    }
];