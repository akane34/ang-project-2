var express = require('express');
var router = express.Router();
var tools = require('../util/tools');
var provider = require('../logic/LC_WQuotationSimpleSearchMicroservice');

module.exports =  (expressApp) => {

    router.get('/', function (req, res) {
        res.setHeader('Content-Type', 'application/json');

        provider.search(req.query.search, req.query.lastEvaluatedKey, req.query.pageSize, res, tools.sendResponse);
    });

    return router;
}