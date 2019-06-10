const bodyParser = require('body-parser');
const express = require('express');
const multer = require('multer');

const cors = require('./cors');
const authenticate = require('../authenticate');

const storage = multer.diskStorage(
  {
    destination: (req, file, cb) => {
      cb(
        null, 
        'public/images',
      );
    },
    filename: (req, file, cb) => {
      cb(
        null,
        file.originalname
      );
    },
  }
);

const imageFileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(
      new Error('You can only upload image files!'),
      false,
    );
  }
  
  cb(null, true);
};

const upload = multer(
  {
    storage: storage,
    fileFilter: imageFileFilter,
  }
);

const uploadRouter = express.Router();
uploadRouter.use(bodyParser.json());

uploadRouter.route('/')
.options(
  cors.corsWithOptions, 
  (req, res) => { 
    res.sendStatus(200);
  }
)
.get(
  cors.cors,
  authenticate.verifyUser,
  authenticate.verifyAdmin,
  (_req, res, _next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload');
  }
)
.post(
  cors.corsWithOptions, 
  authenticate.verifyUser,
  authenticate.verifyAdmin,
  upload.single('imageFile'),
  (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(req.file);
  }
)
.put(
  cors.corsWithOptions, 
  authenticate.verifyUser,
  authenticate.verifyAdmin,
  (_req, res, _next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /imageUpload');
  }
)
.delete(
  cors.corsWithOptions, 
  authenticate.verifyUser,
  authenticate.verifyAdmin,
  (_req, res, _next) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /imageUpload');
  }
)

module.exports = uploadRouter;
