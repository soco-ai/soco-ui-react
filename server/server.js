require('dotenv').config();
const throng = require('throng');


const WORKERS = process.env.WEB_CONCURRENCY || 1;
const PORT = process.env.PORT || 3031;
const BLITZ_KEY = process.env.BLITZ_KEY;

throng({
  workers: WORKERS, lifetime: Infinity
}, start);

function start() {
  const express = require('express');
  const blitz = require('blitzkrieg');
  const app = module.exports.app = express();
  const path = require('path');
  const bodyParser = require('body-parser');
  const restApi = require(path.join(__dirname, 'routes/rest_api'));
  const sslRedirect = require('heroku-ssl-redirect');

  app.use(sslRedirect());
  app.use(blitz(BLITZ_KEY));

  app.use(express.static(path.join(__dirname, '../client/public')));
  app.use(bodyParser.json({limit: '50mb'}));
  app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

  // APIs
  app.use('/api', restApi);
  app.use(function(req, res, next) {
    next();
  });

  // Everything else
  app.get("/*", function(req, res) {
    res.sendFile(path.join(__dirname, '../client/public/index.html'));
  });
  app.use(function(err, req, res, next) {
    res.status(err.status || 500).json({err: "internal error"});
    res.end();
  });
  app.listen(process.env.PORT || PORT, function() {
    console.log("SOCO core backend running on port " + (process.env.PORT || PORT))
  });
}
