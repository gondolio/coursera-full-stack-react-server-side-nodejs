const bodyParser = require('body-parser');
const express = require('express');

const dishRouter = express.Router();
dishRouter.use(bodyParser.json());
dishRouter.route('/')
.all(
  (_req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next(); // This means to continue to look for additional specifications that match the dishes endpoint
  }
)
.get(
  (_req, res, _next) => {
    res.end('Will send all the dishes to you!');
  }
)
.post(
  (req, res, _next) => {
    res.end(`Will add the dish: ${req.body.name} with details: ${req.body.description}`);
  }
)
.put(
  (_req, res, _next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes');
  }
)
.delete(
  (_req, res, _next) => {
    res.end('Deleting all the dishes!');
  }
);

dishRouter.route('/:dishId')
.all(
  (_req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
  }
)
.get(
  (req, res, _next) => {
    res.end(`Will send details of the dish '${req.params.dishId}' to you!`);
  }
)
.post(
  (req, res, _next) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /dishes/${req.params.dishId}`);
  }
)
.put(
  (req, res, _next) => {
    res.write(`Updating the dish: ${req.params.dishId}\n`);
    res.end(`Will update the dish: ${req.body.name} with details: ${req.body.description}`);
  }
)
.delete(
  (req, res, _next) => {
    res.end(`Deleting dish: ${req.params.dishId}`);
  }
);

module.exports = dishRouter;