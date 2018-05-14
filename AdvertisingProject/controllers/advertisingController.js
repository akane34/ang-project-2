var express = require('express');
var router = express.Router();
var tools = require('../util/tools');
var advertising = require('../logic/advertising');

module.exports =  (expressApp) => {

    router.get('/', function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        advertising.findAll(res, tools.sendResponse);
    });

    router.get('/:id', function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        advertising.findById(req.params.id, res, tools.sendResponse);
    });

    router.get('/publisher/:id', function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        advertising.findByPublisher(req.params.id, res, tools.sendResponse);
    });

    router.get('/keyword/:id', function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        advertising.findByKeyWord(req.params.id, res, tools.sendResponse);
    });

    router.post('/', function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        advertising.create(req.body, res, tools.sendResponse);
    });

    router.put('/:id', function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        advertising.update(req.params.id, req.body, res, tools.sendResponse);
    });

    router.delete('/:id', function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        advertising.delete(req.params.id, res, tools.sendResponse);
    });

    return router;
}