const bodyParser = require('body-parser');
const express = require('express');

const promoRouter = express.Router();
promoRouter.use(bodyParser.json());
promoRouter.route('/')
.all(
  (_req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next(); // This means to continue to look for additional specifications that match the promotions endpoint
  }
)
.get(
  (_req, res, _next) => {
    res.end('Will send all the promotions to you!');
  }
)
.post(
  (req, res, _next) => {
    res.end(`Will add the promotion: ${req.body.name} with details: ${req.body.description}`);
  }
)
.put(
  (_req, res, _next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /promotions');
  }
)
.delete(
  (_req, res, _next) => {
    res.end('Deleting all the promotions!');
  }
);

promoRouter.route('/:promoId')
.all(
  (_req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
  }
)
.get(
  (req, res, _next) => {
    res.end(`Will send details of the promotion '${req.params.promoId}' to you!`);
  }
)
.post(
  (req, res, _next) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /promotions/${req.params.promoId}`);
  }
)
.put(
  (req, res, _next) => {
    res.write(`Updating the promotion: ${req.params.promoId}\n`);
    res.end(`Will update the promotion: ${req.body.name} with details: ${req.body.description}`);
  }
)
.delete(
  (req, res, _next) => {
    res.end(`Deleting promotion: ${req.params.promoId}`);
  }
);

module.exports = promoRouter;