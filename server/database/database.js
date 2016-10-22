/**************************************************/
/**                   Imports                    **/
/**************************************************/
var MongoClient  = require('mongodb').MongoClient;
var assert       = require('assert');

/**************************************************/
/**                  Constants                   **/
/**************************************************/
/* URL to initiate connection with database. */
var url = 'mongodb://0.0.0.0:27017/SDM';

/**************************************************/
/**             Private functions                **/
/**************************************************/

/**
 * Private method to insert document.
 */
var _insertDoc = function(db, collection, document, callback) {
  db.collection(collection).insertOne(document, function(err, result){
    assert.equal(err, null);
    callback();
  });
};

/**
 * Private method to query database.
 */
var _find = function(db, collection, query, callback) {
  var cursor = db.collection(collection).find(query).toArray(function (err, docs){
    assert.equal(err, null);
    callback(docs);
  });
};

/**************************************************/
/**                  Constructor                 **/
/**************************************************/
var MongoDBCon = function () {};

/**************************************************/
/**               Public functions               **/
/**************************************************/

/**
 * Method to insert document into collection.
 * @param collection = collection in which to insert document.
 * @param document = document to insert in collection.
 */
MongoDBCon.prototype.insertDocument = function (collection, document){
  MongoClient.connect(url, function(err, db){
    assert.equal(null, err);
    _insertDoc(db, collection, document, function(){
      db.close();      
    })
  });
};

/**
 * Method to find data in collection.
 * @param collection = collection in which to find data.
 * @param query = query with which to find data.
 * @param callback = callback function to call with found data.
 */
MongoDBCon.prototype.find = function (collection, query, callback){
  MongoClient.connect(url, function(err, db){
    assert.equal(null, err);
    _find(db, collection, query, function(doc){
      db.close();   
      callback(doc);
    })
  });
};

/**************************************************/
/**                   Export                     **/
/**************************************************/
exports.MongoDBCon = MongoDBCon;