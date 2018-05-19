exports.handler = function(event, context, callback){
    switch (event.httpMethod) {
        case 'GET':
            callback(null, {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({"response": {}})
            });

            break;
        default:
            callback(null, {
                statusCode: 400,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({"response": 'Unsupported method "${event.httpMethod}"'})
            });
    }

};
