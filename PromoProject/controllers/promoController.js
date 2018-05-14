var express = require('express');
var router = express.Router();
var tools = require('../util/tools');
var promo = require('../logic/promo');

module.exports =  (expressApp) => {

    router.get('/', function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        promo.findAll(res, tools.sendResponse);
    });

    router.get('/:id', function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        promo.findById(req.params.id, res, tools.sendResponse);
    });

    router.get('/provider/:id', function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        promo.findByProvider(req.params.id, res, tools.sendResponse);
    });

    router.get('/keyword/:id', function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        promo.findByKeyWord(req.params.id, res, tools.sendResponse);
    });

    router.post('/', function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        promo.create(req.body, res, tools.sendResponse);
    });

    router.put('/:id', function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        promo.update(req.params.id, req.body, res, tools.sendResponse);
    });

    router.delete('/:id', function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        promo.delete(req.params.id, res, tools.sendResponse);
    });

    return router;
}