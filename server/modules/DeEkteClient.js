/**************************************************/
/**                   Imports                    **/
/**************************************************/
var NodeRSA = require('node-rsa');
var bigInt = require('big-integer');
var random = require('random-gen');
var forge = require('node-forge');

/**************************************************/
/**                  Constructor                 **/
/**************************************************/
var Client = function(server, gm) {
	// ID of current client.
	
  // Server instance.
  this.server = server;
	
	// GM instance
	this.gm = gm;
  
  // PKg variables received from GM.
  this.g = null;
  this.gamma = null;
  this.P = null;
  this.n = null;
  this.Sg = null;
	
	// Plaintext received from GM
	var p = null;
	
	// PIN and ci variables received from GM.
	this.PIN = null;
	this.ci = null;
  
  // Variable to execute f function, can only be used in f
  this.u = null;
  
  // Variables for IndGen
  this.R = null;
  this.CSIR = null;
};

/***************************************************
/**               Private functions              **/
/**************************************************/

/**
 * Function f
 */
Client.prototype.f = function(x) {
  return this.u.modPow(x, this.n);
}

/***************************************************
/**        Public functions - upload data        **/
/**************************************************/

/**
 * Upload encrypted data in one function.
 */
Client.prototype.UploadData = function(R, callback) {
	this.IndGen(R, function(){});
	this.DatUpl(callback);	
}

/**
* IndGen(R) is to make a common secure index. It takes as input a data R,
* outputs its common secure index CSIR.

@requires \forall i typeof(R[i]) == bigInt
*/
Client.prototype.IndGen = function(R, callback) {
	
  // calculate common secure index of R
  var rho = bigInt.randBetween(0, this.n);
  var CSIR = [];
  CSIR[0] = rho.multiply(this.P).mod(this.n); // mod n?
  for(var j = 0; j < R.length; j++) {
    var w = R[j];
    CSIR[j+1] = rho.multiply(this.gamma).multiply(this.P).multiply(this.f(w)).mod(this.n); // mod n?
  }
  
  // Output CSIR
  this.R = R;
  this.CSIR = CSIR;
  callback();
}

/**
* DatUpl(R,CSIR) is to upload the encrypted data with the common secure
* index to the server. It takes as input a data R and its common secure
* index CSIR, and then uploads the encrypted data Sg(R) with its CSIR
* to the server.

@requires \forall i typeof(R[i]) == bigInt
*/
Client.prototype.DatUpl = function(callback) {
  // rsa encrypt using Sg
	var SgR = [];
	for(var j = 0; j < this.R.length; j++) {
		SgR[j] = this.R[j].modPow(this.Sg[0], this.Sg[1]);
	}
	
  this.sendSgR(SgR, this.CSIR, callback);
}

/***************************************************
/**        Public functions - Query data         **/
/**************************************************/
/**
* Trpdor(L', l) is executed by a group member to make a trapdoor of a list of
* keywords the member wants to search. It takes as input a keyword list L
* and the locations l of the keywords in the common secure index, outputs
* the trapdoor TL
*/
Client.prototype.Trpdor = function(L, l, callback) {
  var ri = bigInt.randBetween(0, this.n);
  var cj = null;
  var C = bigInt.one;
  var word = null;
  for(var j = 0; j < L.length; j++) {
    word = L[j];
    cj = this.g.modPow(this.f(word), this.n.square()).multiply(ri.modPow(this.n, this.n.square())).mod(this.n.square());
    C = C.multiply(cj).mod(this.n.square());
  }
  
	//TODO send trapdoor along with PIN di and secure code ci to server
  callback(C,l);
}


/***************************************************
/**                 Send functions               **/
/**************************************************/
/**
 * Send Sg(R) with CSIR to server.
 */
Client.prototype.sendSgR = function(SgR, CSIR, callback) {
  this.server.receiveSgR(SgR, CSIR, function(){});
  callback();
}

/**
 * Send trapdoor to server.
 */
Client.prototype.sendTrpdor = function(L, l, callback) {
	var C = null;
	var newl = null;
	this.Trpdor(L, l, function(computedC, computedl){
		C = computedC;
		newl = computedl;
	});
	this.server.receiveTrpdor(C, newl, this.PIN, this.ci , function(data){
		if(data.empty)
			console.log("NO DATA MATCHED");
		callback(data);
	});
}

/**
* Receive collection of queried encrypted data from the server, or an empty array if there was no match
*/
Client.prototype.DatDcp = function (enc, callback){
	this.gm.receiveSgR(enc, function(plain){
		callback(plain);
	});
}

Client.prototype.initQuery = function(L, l, callback){
	var SgRcollection = null;
	var tmp = this;
	var plainText = [];
	this.sendTrpdor(L, l, function(collection){
		var SgRcollection = collection;	
		for(var i = 0; i < SgRcollection.length; i++){
			tmp.DatDcp(SgRcollection[i], function(plain){
				console.log("Plaintext = " + plain);
				plainText.push(plain);
			});
		}
	});
	callback(plainText);
}


/***************************************************
/**               Receive functions              **/
/**************************************************/
/**
 * Method to receive PIN and ci from GM.
 */
Client.prototype.receivePINs = function(PIN, ci, callback){
	this.PIN = PIN;
	this.ci = ci;
	callback();
}

/**
 * Method to receive PKg from GM.
 */
Client.prototype.receivePKg = function (gm, g, gamma, f, P, n, Sg, callback){
	this.gm = gm;
  this.g = g;
  this.gamma = gamma;
  this.u = f.u;
  this.P = P;
  this.n = n;
  this.Sg = Sg;
  callback();
}

/**************************************************/
/**                   Export                     **/
/**************************************************/
exports.Client = Client;