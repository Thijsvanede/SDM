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
var MongoDBCon = require('../database/database.js').MongoDBCon;

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
Server.prototype.L = function(val) {
	return val.subtract(bigInt(1)).divide(this.n); //.modInv(this.n);
}

/**
 * Function to generate an element of M.
 */
Server.prototype.genElemM = function(callback) {
	var B = this.n;
	var tmp = null;

	do {
		forge.prime.generateProbablePrime(this.k, function(err, num) {
			tmp = bigInt(num.toString());
		});
	} while (tmp == null || tmp.gt(B) || tmp.lt(2) || tmp.eq(this.p) || tmp.eq(this.q));
	callback(tmp);
}

/**
 * Function to check whether an element is in M.
 */
Server.prototype.inM = function(number, callback) {
	callback(number.isProbablePrime() && number.leq(this.n) && number.geq(2) && number.neq(this.p) && number.neq(this.q));
}

/***************************************************
/**       Public functions - Data queries        **/
/**************************************************/
/*DatDwn(...) takes all the server parameters that are required to obtain data that matches a query using keywords
 * It calls both SrhInd and MemChk to authenticate users and check if the queried data is available.
 * The function returns a collection of data elements matching the queried key-word or a message toLocaleString
 * the user indicating that no data matched the keyword search.
 */
Server.prototype.DatDwn = function(di, ci, STC, C, l, callback) {
	var data = null;
	var tmp = this;
	if (this.MemChk(di, ci, STC)) {

		this.database.find('encryptedData', {}, function(documents) {
			tmp.ProcessData(documents, C, l, function(data){
				callback(data);
			});
		});
	}
}

Server.prototype.ProcessData = function(dataA, C, l, callback) {
	var collection = [];
	for (var i = 0; i < dataA.length; i++) {
		if (this.SrhInd(C, l, dataA[i].CSIR)) {
			var myData = dataA[i].data;
			var myBigIntData = [];
			for(var j = 0; j < myData.length; j++){
				myBigIntData.push(bigInt(myData[j].toString()));
			}
		}
	}
	callback(myBigIntData);
}

/* MemChk(di,ci,STC) verifies whether di is an element of (SysSet defined) M and ci^di is equal to the 
 *  secure test code (STC) to see if a member is allowed to access the data.
 */
Server.prototype.MemChk = function(di, ci, STC) {
	var isInM = null;
	this.inM(di, function(res) {
		isInM = res;
	});

	if (isInM && ci.modPow(di, this.n).equals(STC)) {
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
Server.prototype.SrhInd = function(C, l, CSIr) {
	var sumS = bigInt(0);
	for (var i = 0; i < l.length; i++) {
		sumS = sumS.add(CSIr[l[i]]).mod(this.n);
	}

	return C.modPow(this.beta.multiply(CSIr[0]), this.n.square()).subtract(bigInt.one).divide(this.n).equals(sumS);
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
Server.prototype.receiveSgR = function(SgR, CSIR, callback) {
	var stringifiedSgR = [];
	for(var i = 0; i < SgR.length; i++)
		stringifiedSgR.push(SgR[i].toString());
	
	this.database.insert('encryptedData', {
		'data': stringifiedSgR,
		'CSIR': CSIR
	}, {}, function() {});
	callback();
}

/**
 * Method to receive trapdoor from client after which it will search for said data.
 * TODO communicate correctly, currently we give the client as a parameter to be
 * able to send back the correct data.
 */
Server.prototype.receiveTrpdor = function(C, l, PIN, ci, callback) {
	this.DatDwn(PIN, ci, this.STC, C, l, function(data){
		callback(data);
	});
}

/**************************************************/
/**                   Export                     **/
/**************************************************/
exports.Server = Server;