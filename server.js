'use strict';

/**************************************************/
/**                  Definitions                 **/
/**************************************************/
var SERVER_IP = "0.0.0.0"
var SERVER_PORT = "3000"

/**************************************************/
/**                   Imports                    **/
/**************************************************/
var express      = require('express');
var http         = require('http');
var path         = require('path');
var bodyParser   = require('body-parser');
var MongoClient  = require('mongodb').MongoClient;
var assert       = require('assert');

var app          = express();

/**************************************************/
/**             Server initialisation            **/
/**************************************************/
var server       = http.Server(app);

/**************************************************/
/**          View engine initialisation          **/
/**************************************************/
app.set('views', path.join(__dirname));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(express.static(__dirname + '/public'));

/** Initialising home page to index.html */
app.use('/', function(req, res) {
  res.render('./client/html/index.html');
});

/**************************************************/
/**              Database connection             **/
/**************************************************/

/* URL to initiate connection with database. */
var databaseURL = 'mongodb://0.0.0.0:27017/SDM';

/* Connecting to database server. */
MongoClient.connect(databaseURL, function(err, db){
  assert.equal(null, err);
  console.log("Successfully connected to database.");
  db.close();
});

/**************************************************/
/**                  Server API                  **/
/**************************************************/
//TODO

/**************************************************/
/**                Starting server               **/
/**************************************************/
console.log("Starting server at " + SERVER_IP + ":" + SERVER_PORT);
server.listen(SERVER_PORT, SERVER_IP);