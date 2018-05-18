const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = process.env.LC_SEARCH_PORT || 7001;
const fs = require('fs');
const fsmk = require('node-fs');
const properties = require('properties-parser');
const path = require("path");
const tools = require("./util/tools.js");

const LC_MOfferSimpleSearchMicroserviceController = require('./controllers/LC_MOfferSimpleSearchMicroserviceController')(app);

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

app.listen(port, function() {
    console.log('Backend listening on ' + port)
});

tools.subscribeToTrendingQueue(function (wordKey, frecuency){
    if (wordKey && frecuency){
        tools.saveSearchTrending(wordKey, frecuency);
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