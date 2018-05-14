const uuidv4 = require('uuid/v4');
var persistence = require('../dataAccess/persistence');
var COLLECTION = 'LC_Advertising';

function findAll(res, sendResponse) {
    persistence.findAll(COLLECTION, res, sendResponse);
}

function findById(id, res, sendResponse) {
    persistence.findById(id, COLLECTION, res, sendResponse);
}

function findByPublisher(idPublisher, res, sendResponse) {
    persistence.findAllByElement({idPublisher: idPublisher}, COLLECTION, res, sendResponse);
}

function findByKeyWord(keyWord, res, sendResponse) {
    persistence.findAllByElement({keyWords: {'$regex': keyWord} }, COLLECTION, res, sendResponse);
}

function create(advertising, res, sendResponse) {
    if (isValidAdvertising(advertising)){
        advertising.id = advertising.id || uuidv4();

        var advertisingClean = createCleanAdvertising(advertising);
        advertisingClean.id = advertising.id || uuidv4();

        persistence.create(advertisingClean, COLLECTION, res, sendResponse);
    } else{
        sendResponse({error: 'faltan parametros de entrada'}, false, res);
    }
}

function update(id, advertising, res, sendResponse) {
    if (isValidAdvertising(advertising)){
        var advertisingClean = createCleanAdvertising(advertising);
        advertisingClean.id = id;

        persistence.update(advertisingClean, COLLECTION, res, sendResponse);
    } else{
        sendResponse({error: 'faltan parametros de entrada'}, false, res);
    }
}

function deleteElement(id, res, sendResponse) {
    persistence.delete(id, COLLECTION, res, sendResponse);
}

function isValidAdvertising(advertising){
    return (advertising &&
        advertising.text &&
        advertising.description &&
        advertising.link &&
        advertising.image &&
        advertising.width &&
        advertising.high &&
        advertising.idPublisher &&
        advertising.name &&
        advertising.weight &&
        advertising.active &&
        advertising.keyWords
    );
}

function createCleanAdvertising(advertising){
    var cleanAdvertising = {};
    cleanAdvertising.text = advertising.text;
    cleanAdvertising.description = advertising.description;
    cleanAdvertising.link = advertising.link;
    cleanAdvertising.image = advertising.image;
    cleanAdvertising.width = advertising.width;
    cleanAdvertising.high = advertising.high;
    cleanAdvertising.idPublisher = advertising.idPublisher;
    cleanAdvertising.name = advertising.name;
    cleanAdvertising.weight = advertising.weight;
    cleanAdvertising.active = advertising.active;
    cleanAdvertising.keyWords = advertising.keyWords;
    cleanAdvertising.creationDate = (new Date()).getTime();

    return cleanAdvertising;
}

exports.findAll = findAll;
exports.findById = findById;
exports.findByProvider = findByPublisher;
exports.findByKeyWord = findByKeyWord;
exports.create = create;
exports.update = update;
exports.delete = deleteElement;
