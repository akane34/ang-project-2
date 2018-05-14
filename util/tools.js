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

exports.sendResponse = sendResponse;
