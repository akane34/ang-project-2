const uuidv4 = require('uuid/v4');
var persistence = require('../dataAccess/persistence');
var COLLECTION = 'LC_Promo';

function findAll(res, sendResponse) {
    persistence.findAll(COLLECTION, res, sendResponse);
}

function findById(id, res, sendResponse) {
    persistence.findById(id, COLLECTION, res, sendResponse);
}

function findByProvider(idProvider, res, sendResponse) {
    persistence.findAllByElement({idProvider: idProvider}, COLLECTION, res, sendResponse);
}

function findByKeyWord(keyWord, res, sendResponse) {
    persistence.findAllByElement({keyWords: {'$regex': keyWord} }, COLLECTION, res, sendResponse);
}

function create(promo, res, sendResponse) {
    if (isValidPromo(promo)){
        promo.id = promo.id || uuidv4();

        var promoClean = createCleanPromo(promo);
        promoClean.id = promo.id || uuidv4();

        persistence.create(promoClean, COLLECTION, res, sendResponse);
    } else{
        sendResponse({error: 'faltan parametros de entrada'}, false, res);
    }
}

function update(id, promo, res, sendResponse) {
    if (isValidPromo(promo)){
        var promoClean = createCleanPromo(promo);
        promoClean.id = id;

        persistence.update(promoClean, COLLECTION, res, sendResponse);
    } else{
        sendResponse({error: 'faltan parametros de entrada'}, false, res);
    }
}

function deleteElement(id, res, sendResponse) {
    persistence.delete(id, COLLECTION, res, sendResponse);
}

function isValidPromo(promo){
    return (promo &&
        promo.text &&
        promo.description &&
        promo.link &&
        promo.image &&
        promo.idProvider &&
        promo.idOffer &&
        promo.discount &&
        promo.weight &&
        promo.active &&
        promo.keyWords &&
        promo.validUntil
    );
}

function createCleanPromo(promo){
    var cleanPromo = {};
    cleanPromo.text = promo.text;
    cleanPromo.description = promo.description;
    cleanPromo.link = promo.link;
    cleanPromo.image = promo.image;
    cleanPromo.idProvider = promo.idProvider;
    cleanPromo.idOffer = promo.idOffer;
    cleanPromo.discount = promo.discount;
    cleanPromo.weight = promo.weight;
    cleanPromo.active = promo.active;
    cleanPromo.keyWords = promo.keyWords;
    cleanPromo.validUntil = promo.validUntil;
    cleanPromo.creationDate = (new Date()).getTime();

    return cleanPromo;
}

exports.findAll = findAll;
exports.findById = findById;
exports.findByProvider = findByProvider;
exports.findByKeyWord = findByKeyWord;
exports.create = create;
exports.update = update;
exports.delete = deleteElement;
