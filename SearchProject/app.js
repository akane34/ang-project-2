const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = process.env.LC_SEARCH_PORT || 4001;
const fs = require('fs');
const fsmk = require('node-fs');
const properties = require('properties-parser');
const path = require("path");
const tools = require("./util/tools.js");

const LC_MOfferSimpleSearchMicroserviceController = require('./controllers/LC_MOfferSimpleSearchMicroserviceController')(app);
const LC_MOrderSimpleSearchMicroserviceController = require('./controllers/LC_MOrderSimpleSearchMicroserviceController')(app);
const LC_MProviderSimpleSearchMicroserviceController = require('./controllers/LC_MProviderSimpleSearchMicroserviceController')(app);
const LC_MQuotationSimpleSearchMicroserviceController = require('./controllers/LC_MQuotationSimpleSearchMicroserviceController')(app);
const LC_MSalesSimpleSearchMicroserviceController = require('./controllers/LC_MSalesSimpleSearchMicroserviceController')(app);
const LC_WOfferSimpleSearchMicroserviceController = require('./controllers/LC_WOfferSimpleSearchMicroserviceController')(app);
const LC_WOrderSimpleSearchMicroserviceController = require('./controllers/LC_WOrderSimpleSearchMicroserviceController')(app);
const LC_WProviderSimpleSearchMicroserviceController = require('./controllers/LC_WProviderSimpleSearchMicroserviceController')(app);
const LC_WQuotationSimpleSearchMicroserviceController = require('./controllers/LC_WQuotationSimpleSearchMicroserviceController')(app);
const LC_WSalesSimpleSearchMicroserviceController = require('./controllers/LC_WSalesSimpleSearchMicroserviceController')(app);

var logDirectory = path.join(__dirname, 'logs/');
if (!fs.existsSync(logDirectory)) {
    fsmk.mkdirSync(logDirectory, 666, true);
}
var fileLog = path.join(logDirectory, 'server.log');

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/lumenconcept/mobile/marketplace/search/simple/offer', LC_MOfferSimpleSearchMicroserviceController);
app.use('/lumenconcept/mobile/marketplace/search/simple/order', LC_MOrderSimpleSearchMicroserviceController);
app.use('/lumenconcept/mobile/marketplace/search/simple/provider', LC_MProviderSimpleSearchMicroserviceController);
app.use('/lumenconcept/mobile/marketplace/search/simple/quotation', LC_MQuotationSimpleSearchMicroserviceController);
app.use('/lumenconcept/mobile/marketplace/search/simple/sale', LC_MSalesSimpleSearchMicroserviceController);
app.use('/lumenconcept/web/marketplace/search/simple/offer', LC_WOfferSimpleSearchMicroserviceController);
app.use('/lumenconcept/web/marketplace/search/simple/order', LC_WOrderSimpleSearchMicroserviceController);
app.use('/lumenconcept/web/marketplace/search/simple/provider', LC_WProviderSimpleSearchMicroserviceController);
app.use('/lumenconcept/web/marketplace/search/simple/quotation', LC_WQuotationSimpleSearchMicroserviceController);
app.use('/lumenconcept/web/marketplace/search/simple/sale', LC_WSalesSimpleSearchMicroserviceController);

app.listen(port, function() {
    console.log('Backend listening on ' + port)
});

tools.subscribeToQueue(function (wordKey, frecuency){
    if (wordKey && frecuency){
        tools.saveInDynamo(wordKey, frecuency);
    }
});

process.on('uncaughtException', function (err) {
    var fs = require('fs');
    var fsmk = require('node-fs');
    var LOG = require('./util/logger');

    var dirLog = path.join(__dirname, 'logs');
    var fileLog = path.join(dirLog,'exceptions.log');
    if (!fs.existsSync(dirLog)) {
        fsmk.mkdirSync(dirLog, 666, true);
    }

    var code = err.code;
    if (code == 'EACCES'){
        fs.appendFileSync(fileLog, LOG('ACCESS_DENIED', [code + ' ' + err]));
    }
    else{
        fs.appendFileSync(fileLog, LOG('ERROR', [' ' + err]));
    }
});