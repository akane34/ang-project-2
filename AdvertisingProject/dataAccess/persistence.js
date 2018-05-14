const MongoClient = require('mongodb').MongoClient;
const server = process.env.LC_MONGODB_SERVER || 'localhost';
const port = process.env.LC_MONGODB_PORT || '27017';
const database = process.env.LC_MONGODB_DATABASE || 'LumenConcept';
const url = 'mongodb://' + server + ':' + port;

const SUCCESS = true;
const  FAIL = false;

function findAll(collectionName, res, sendResponse) {

    MongoClient.connect(url, function(err, db) {
        if (err) {
            console.log(err);
            sendResponse(err, FAIL, res);
        }
        else {
            var dbo = db.db(database);
            createIfCollectionNotExist(collectionName, dbo, function (isSuccess, re){
                if (isSuccess && isSuccess === true) {
                    dbo.collection(collectionName).find({}).toArray(function (err, result) {
                        var data = {};
                        if (err) {
                            data = err;
                        }
                        else
                            data = result;

                        db.close();

                        sendResponse(data, SUCCESS, res);
                    });
                }
                else{
                    sendResponse(re, FAIL, res);
                }
            });
        }
    });
}

function findById(id, collectionName, res, sendResponse) {
    findByElement({id: id}, collectionName, true, res, sendResponse);
}

function findByIdElement(id, collectionName, res, sendResponse) {
    findByElement(query, collectionName, true, res, sendResponse);
}

function findAllByElement(query, collectionName, res, sendResponse){
    findByElement(query, collectionName, false, res, sendResponse);
}

function findByElement(query, collectionName, returnFirts, res, sendResponse) {

    MongoClient.connect(url, function (err, db) {
        if (err) {
            console.log(err);
            sendResponse(err, FAIL, res);
        }
        else {
            var dbo = db.db(database);
            createIfCollectionNotExist(collectionName, dbo, function (isSuccess, re){
                if (isSuccess && isSuccess === true) {
                    var mysort = {creationDate: -1};
                    dbo.collection(collectionName).find(query).sort(mysort).toArray(function (err, result) {
                        var data = {};
                        if (err)
                            data = err;
                        else
                            data = result;

                        db.close();
                        if (data.length > 0) {
                            if(returnFirts === true)
                                data = data[0];
                        }

                        sendResponse(data, SUCCESS, res);
                    });
                }
                else{
                    sendResponse(re, FAIL, res);
                }
            });
        }
    });
}

function create(element, collectionName, res, sendResponse) {

    MongoClient.connect(url, function(err, db) {
        if (err) {
            console.log(err);
            sendResponse(err, FAIL, res);
        }
        else {
            var dbo = db.db(database);
            createIfCollectionNotExist(collectionName, dbo, function (isSuccess, re){
                if (isSuccess && isSuccess === true) {
                    return dbo.collection(collectionName).save(element, function (err, result) {
                        var data = {};
                        if (err)
                            data = err;
                        else
                            data = result.ops[0];

                        db.close();

                        sendResponse(data, SUCCESS, res);
                    })
                }
                else{
                    sendResponse(re, FAIL, res);
                }
            });
        }
    });
}

function update(element, collectionName, res, sendResponse) {
    create(element, collectionName, res, function (data, isSuccess, resp){
        if (isSuccess && isSuccess === true) {

            MongoClient.connect(url, function (err, db) {
                if (err) {
                    console.log(err);
                    sendResponse(err, FAIL, res);
                }
                else {
                    var dbo = db.db(database);
                    var query = {id: element.id};
                    var mysort = {creationDate: 1};
                    dbo.collection(collectionName).find(query).sort(mysort).toArray(function (err, result) {
                        var data = {};
                        if (err)
                            data = err;
                        else
                            data = result;

                        if (data.length > 1) {
                            var myquery = {id: data[0].id};
                            dbo.collection(collectionName).deleteOne(myquery, function (err, obj) {
                            });
                        }

                        db.close();

                        sendResponse(data, SUCCESS, res);
                    });
                }
            });
        }
        else{
            sendResponse(data, FAIL, res);
        }
    });
}

function deleteElement(id, collectionName, res, sendResponse) {

    MongoClient.connect(url, function(err, db) {
        if (err) {
            console.log(err);
            sendResponse(err, FAIL, res);
        }
        else {
            var dbo = db.db(database);
            createIfCollectionNotExist(collectionName, dbo, function (isSuccess, re){
                if (isSuccess && isSuccess === true) {
                    var myquery = {id: id};
                    dbo.collection(collectionName).remove(myquery, function (err, result) {
                        var data = {};
                        if (err)
                            data = err;
                        else
                            data = result;

                        db.close();

                        sendResponse(data, SUCCESS, res);
                    });
                }
                else{
                    sendResponse(re, FAIL, res);
                }
            });
        }
    });
}

function createIfCollectionNotExist (name, dbo, cb) {

    dbo.listCollections({name: name})
        .next(function(err, collinfo) {
            if (collinfo) {
                cb (SUCCESS, name);
            }
            else{
                dbo.createCollection(name, function(err, res) {
                    if (err){
                        cb (FAIL, err);
                    }
                    else{
                        cb (SUCCESS, name);
                    }
                });
            }
        });
}

exports.findAll = findAll;
exports.findById = findById;
exports.create = create;
exports.update = update;
exports.delete = deleteElement;
exports.findByIdElement = findByIdElement;
exports.findAllByElement = findAllByElement;
