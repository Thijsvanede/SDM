/**************************************************/
/**                   Imports                    **/
/**************************************************/
var NodeRSA = require('node-rsa');
var bigInt = require('big-integer');
var random = require('random-gen');
var forge = require('node-forge');

/**************************************************/
/**              Database connection             **/
/**************************************************/
var MongoDBCon   = require('../database/database.js').MongoDBCon;

/**************************************************/
/**                  Constructor                 **/
/**************************************************/
var Server = function() {
	// Open database connection.
	this.database = new MongoDBCon();
	
  // PKs variables received from GM.
  this.beta = null;
  this.n = null;
  
  // Variables to generate set M
  this.k = null; //Will only be used within genElemM
  this.p = null; //Will only be used within genElemM
  this.q = null; //Will only be used within genElemM
  
  // Secure test code from GM
  this.STC = null;
};

/***************************************************
/**               Private functions              **/
/**************************************************/

/**
 * Definition of function L(.)
 */
Server.prototype.L = function(val){
  return val.subtract(bigInt(1)).multiply(this.n.modInv(this.n.square()));
}

/***************************************************
/**               Public functions               **/
/**************************************************/

/**
 * Function to generate an element of M.
 */
Server.prototype.genElemM = function(callback) {
  var B = this.n;
  var tmp = null;
  
  do{
    forge.prime.generateProbablePrime(this.k, function(err, num){
      tmp = bigInt(num.toString());
    });
  }while(tmp == null || tmp.gt(B) || tmp.lt(2) || tmp.eq(this.p) || tmp.eq(this.q));
  callback(tmp);
}

/**
 * Function to check whether an element is in M.
 */
Server.prototype.inM = function(number, callback){
  callback(number.isProbablePrime() && number.leq(this.n) && number.geq(2) && number.neq(this.p) && number.neq(this.q));
}

/***************************************************
/**               Receive functions              **/
/**************************************************/
/**
 * Method to receive PKs from GM.
 */
Server.prototype.receivePKs = function(M, beta, n, callback) {
  //Parameters for function M, can only be used within genElemM
  this.k = M.k;
  this.p = M.p;
  this.q = M.q;
  
  this.beta = beta;
  this.n = n;
  callback();
}

/**
 * Method to receive STC from GM.
 */
Server.prototype.receiveSTC = function(STC, callback) {
  this.STC = STC;
  callback();
}

/**
 * Method to receive Sg(R) and CSIR from group member.
 */
Server.prototype.receiveSgR = function(clientID, SgR, CSIR, callback) {
  this.database.insert('encryptedData', {'ID': clientID, 'data': SgR, 'CSIR': CSIR}, {}, function(){});
  callback();
}

Server.prototype.receiveTrpdor = function(clientID, C, l, PIN, ci, callback) {
  this.DatDwn(clientID,PIN,ci,this.STC,C,l, function(){
    
	});
  callback();
}

/*DatDwn(...) takes all the server parameters that are required to obtain data that matches a query using keywords
* It calls both SrhInd and MemChk to authenticate users and check if the queried data is available.
* The function returns a collection of data elements matching the queried key-word or a message toLocaleString
* the user indicating that no data matched the keyword search.
*/
Server.prototype.DatDwn = function(cid, di, ci, STC, C, l,callback){
	var data = null;
	var tmp = this;
	if(this.MemChk(di,ci,STC)){
		
		this.database.find('encryptedData', {}, function(documents){
			tmp.ProcessData(documents, C, l, function(){});
		});
	}
	callback();
}

Server.prototype.ProcessData = function(data, C, l, callback){
	var collection = [];
	for(var i = 0; i < data.length; i++){
		if(this.SrhInd(C, l, data[i].CSIR)){
			collection.push(data[i].data);
		}
	}
	console.log(collection);
	callback();
}
/* MemChk(di,ci,STC) verifies whether di is an element of (SysSet defined) M and ci^di is equal to the 
*  secure test code (STC) to see if a member is allowed to access the data.
*/
Server.prototype.MemChk = function(di, ci, STC){
	var isInM = null;
  this.inM(di, function(res){
		isInM = res;
	});
	
	if(isInM && ci.modPow(di, this.n).equals(STC)){
     return true;
  }
	//sendToMember("ACCESS DENIED");
	//unauthorised user trying to query -> terminate the system
	return false;
}

/* SrhInd(C,l, CSIr) is a funtionthat takes a Trapdoor (C,l) and a Common Security Index of Data Range
*  It checks whether the sum of security parameters s from the CSIr for which the location in the 
*  CSIr is equal to the keywords in list l of the trapdoor is equal to the Paillier function L of
*  trapdoor part C to the power beta*s0 mod n^2
*/
Server.prototype.SrhInd = function(C,l, CSIr){
	var sumS = bigInt(0);
	for(var i = 0; i < l.length; i++){
		sumS = sumS.add(CSIr[l[i]]).mod(this.n);
	}
	
	console.log("Sum = " + sumS);
	console.log("L = " + this.L(C.modPow(this.beta.multiply(CSIr[0]), this.n.square())).mod(this.n));
	
	//L(x)=(x-1)/n
	return C.modPow(this.beta.multiply(CSIr[0]), this.n.square()).subtract(bigInt.one).divide(this.n).equals(sumS);	
}

/**************************************************/
/**                   Export                     **/
/**************************************************/
exports.Server = Server;