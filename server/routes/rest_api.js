const express = require('express');
const router = express.Router();
const cors = require('cors');
const mongojs = require('mongojs');
const passport = require('passport');
const axios = require('axios');


// Options for cors midddleware
const options = {
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "X-Access-Token"],
  credentials: true,
  methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
  origin: "*",
  preflightContinue: false
};

// Use CORS middleware
router.use(cors(options));

// Enable pre-flight
router.options("*", cors(options));

// Authentication
router.use(passport.initialize());
router.use(passport.session());

/** Define your own apis here **/

module.exports = router;
