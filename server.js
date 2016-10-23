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
var MongoDBCon   = require('./server/database/database.js').MongoDBCon;

// Currently for testing purposes
var database = new MongoDBCon();

database.bulkWrite('temp', [
      { insertOne: { document: { a: 1 } } }
    , { updateOne: { filter: {a:2}, update: {$set: {a:2}}, upsert:true } }
    , { updateMany: { filter: {a:2}, update: {$set: {a:2}}, upsert:true } }
    , { deleteOne: { filter: {c:1} } }
    , { deleteMany: { filter: {c:1} } }
    , { replaceOne: { filter: {c:3}, replacement: {c:4}, upsert:true}}],
                  {ordered:true, w:1});

database.find('temp', {}, function(doc){
  console.log("Found:", doc);
  console.log("End.");
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