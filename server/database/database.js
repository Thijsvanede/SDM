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
var _insertDoc = function(db, collection, document, options, callback) {
  db.collection(collection).insertOne(document, options, function(err, result){
    assert.equal(err, null);
    callback();
  });
};

/**
 * Private method to insert document.
 */
var _insertDocs = function(db, collection, document, options, callback) {
  db.collection(collection).insertMany(document, options, function(err, result){
    assert.equal(err, null);
    callback();
  });
};

/**
 * Private method to update document.
 */
var _updateDocs = function(db, collection, document, update, options, callback) {
  db.collection(collection).update(document, update, options, function(err, result){
    assert.equal(err, null);
    callback();
  });
};

/**
 * Private method to delete single document.
 */
var _deleteDoc = function(db, collection, document, options, callback) {
  db.collection(collection).deleteOne(document, options, function(err, result){
    assert.equal(err, null);
    callback();
  });
};

/**
 * Private method to delete all documents.
 */
var _deleteDocs = function(db, collection, document, options, callback) {
  db.collection(collection).deleteMany(document, options, function(err, result){
    assert.equal(err, null);
    callback();
  });
};

/**
 * Private method to perform bulk operations.
 */
var _bulk = function(db, collection, operations, options, callback) {
  db.collection(collection).bulkWrite(operations, options, function(err, result){
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
 * @param options = options for inserting.
 */
MongoDBCon.prototype.insert = function (collection, document, options, callback){
  MongoClient.connect(url, function(err, db){
    assert.equal(null, err);
    if(Array.isArray(document)){
      _insertDocs(db, collection, document, options, function(){
        db.close();      
      });
    }else{
      _insertDoc(db, collection, document, options, function(){
        db.close();      
      });
    }
  });
  callback();
};

/**
 * Method to update document from collection.
 * @param collection = collection in which to update document.
 * @param document = document to be updated.
 * @param update = how to update document.
 * @param options = options for updating.
 */
MongoDBCon.prototype.update = function(collection, document, update, options, callback){
  MongoClient.connect(url, function(err, db){
    assert.equal(null, err);
    _updateDocs(db, collection, document, update, options, function(){
      db.close();
    });
  });
  callback();
}

/**
 * Method to delete single document from collection.
 * @param collection = collection from which to delete document.
 * @param document = document to delete in collection.
 * @param options = options for deleting.
 */
MongoDBCon.prototype.delete = function(collection, document, options, callback){
  MongoClient.connect(url, function(err, db){
    assert.equal(null, err);
    _deleteDoc(db, collection, document, options, function(){
      db.close();      
    });
  });
  callback();
};

/**
 * Method to delete all documents from collection.
 * @param collection = collection from which to delete document.
 * @param document = documents to delete in collection.
 * @param options = options for deleting.
 */
MongoDBCon.prototype.deleteAll = function(collection, document, options, callback){
  MongoClient.connect(url, function(err, db){
    assert.equal(null, err);
    _deleteDocs(db, collection, document, options, function(){
      db.close();      
    });
  });
  callback();
}

/**
 * Method to perform a bulk of operations on collection.
 * @param collection = collection to perform operations on.
 * @param document = operations to be performed on collection.
 * @param options = options for operations.
 */
MongoDBCon.prototype.bulkWrite = function(collection, operations, options, callback){
  MongoClient.connect(url, function(err, db){
    assert.equal(null, err);
    _bulk(db, collection, operations, options, function(){
      db.close();      
    });
  });
  callback();
}

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