/**************************************************/
/**                   Imports                    **/
/**************************************************/

var NodeRSA = require('node-rsa');
var bigInt = require('big-integer');
var forge = require('node-forge');
var random = require('random-gen');

/**************************************************/
/**                  Definitions                 **/
/**************************************************/

/**************************************************/
/**                  Constructor                 **/
/**************************************************/
var Client = function() {
  //Defining attributes
};

/***************************************************
/**               Private functions              **/
/**************************************************/

var Cm = function(input) {
  // todo
  return 0;
}

var CmInv = function(input) {
  // todo
  return 0;
}

var encrypt = function(plain) {
  // todo
  return 0;
}

/***************************************************
/**               Public functions               **/
/**************************************************/

/**
* The client SysSet receives all public key information from the GM
* PKg = (g,γ,f(·),P,n,Sg)
*/
Client.prototype.SysSet = function() {
  // request from here to the server to retreive public keys?
  
  this.g = 0;
  this.gamma = 0;
  this.f = function(w) {
    return 0;
  }
  this.P = 0;
  this.n = 0;
  this.Sg = 0;
  
  this.n2 = n.pow(2);
}

/**
* IndGen(R) is to make a common secure index. It takes as input a data R,
* outputs its common secure index CSIR.
*/
Client.prototype.IndGen = function(R) {
  // build keywords
  keywords = [];
  
  // calculate common secure index of R
  rho = bigInt.randBetween(0, this.n);
  var CSIR = [];
  CSIR[0] = rho.multiply(this.P); // mod n?
  for(j = 0; j < keywords.length; j++) {
    w = keywords[j];
    CSIR[j+1] = rho.multiply(this.gamma).multiply(this.P).multiply(f(w)).mod(this.n);
  }
  
  return CSIR;
}

/**
* DatUpl(R,CSIR) is to upload the encrypted data with the common secure
* index to the server. It takes as input a data R and its common secure
* index CSIR, and then uploads the encrypted data Sg(R) with its CSIR
* to the server.
*/
Client.prototype.DatUpl = function(R, CSIR) {
  SgR = encrypt(R);
  // send SgR to server
}

/**
* Trpdor(L', l) is executed by a group member to make a trapdoor of a list of
* keywords the member wants to search. It takes as input a keyword list L
* and the locations l of the keywords in the common secure index, outputs
* the trapdoor TL
*/
Client.prototype.Trpdor = function(L, l) {
  ri = bigInt.randBetween(0, this.n);
  
  C = bigInt.one;
  
  for(j = 0; j < L.length; j++) {
    word = L[j];
    cj = this.g.pow(f(word)).multiply(ri).mod(this.n2);
    C = C.multiply(cj).mod(this.n2);
  }
  
  return [C,l];
}

/**
* Retreives a collection of data R from the server where the keywords in the
* trapdoor have been found
*/
Client.prototype.DatDwn = function(COLR) {
  
}

/**
* Sends encrypted data received from the server to the TTP to decrypt it
*/
Client.prototype.DatDcp = function(SgR) {
  CmSgR = encrypt(SgR);
  // send CmSgR to server -> receive CmR from server
  // R = decrypt(CmR)
  // return R;
}

exports.Client = Client;