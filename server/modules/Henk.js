/**************************************************/
/**                   Imports                    **/
/**************************************************/
var NodeRSA = require('node-rsa');
var bigInt = require('big-integer');
var random = require('random-gen');
var forge = require('node-forge');

/**************************************************/
/**                  Definitions                 **/
/**************************************************/

/**************************************************/
/**                  Constructor                 **/
/**************************************************/
var Henk = function() {
  //Defining attributes
  this.l = bigInt(512);
  this.u = 1;
  this.n = null;
  this.q = 0;
  this.p = 0;
  this.k = null;
	this.D = null;
	
	//TODO implement initialisation of these variables.
	this.gamma = null;
	this.P = null;
	this.Sg = null;
	this.g = null;
};

/***************************************************
/**               Private functions              **/
/**************************************************/

/**
 * Function f
 */
Henk.prototype.f = function(u, x) {
  return u.modPow(x, this.n);
}

/**
 * Function f
 */
Henk.prototype.f = function(x) {
	var u = bigInt.randBetween(0, this.n.divide(x));
  return u.modPow(x, this.n);
}

/**
 * Function to generate an element of M.
 */
Henk.prototype.getM = function() {
  var B = this.n;
  var tmp = null;
  
  do{
    forge.prime.generateProbablePrime(this.k, function(err, num){
      tmp = bigInt(num.toString());
    });
  }while(tmp == null || tmp.gt(B) || tmp.lt(2) || tmp.eq(this.p) || tmp.eq(this.q));
  return tmp;
}

/**
 * Computes pow-th element from generator.
 */
Henk.prototype.G1 = function(gen, pow) {
  return gen.modPow(exp, this.n);
}

/**
 * Generate u function.
 */
Henk.prototype.genu = function(){
  return bigInt(Math.floor(Math.random() * 100000)).modPow(2,bigInt(this.n));
}

/* Currently unused
* Can be used to verify blind signatures 
*/
Henk.prototype.hash = function(){
  var x = Math.floor((Math.random() * 100000000) + 1);
  var md = forge.md.sha256.create();
  return md.update(x);
}

/* funtion to create a signing function (in this case RSA) for the group to encrypt data
* It returns an array with a tuple of the public RSA key (e,n) for the user and a tuple for the 
* private key (d,n) for the GM to keep to itself.
*/
Henk.prototype.s = function(){
	var key = new NodeRSA({b: this.l});
  var comp = key.exportKey('components');
	return [[bigInt(comp.e),bigInt(comp.n.toString('hex'), 16)],[bigInt(comp.d.toString('hex'), 16),bigInt(comp.n.toString('hex'), 16)]];
}

/***************************************************
/**               Public functions               **/
/**************************************************/

/**
 * is executed by GM to make authentication codes for the orig-
 * inal group. It takes as input all members M1,...,MN in the group G,
 * outputs PIN numbers di and secure codes ci for all members, and a secure
 * test code STC for the server.
 */
Henk.prototype.GrpAuth = function(G, callback) {
  //GrpAuth step 1
  var pins = [];
  for (var i = 0; i < G.length; i++) {
    pins[i] = this.getM();
  }  
  
  var pinGM = null;
  var stop = true;
  
  while(pinGM == null || stop){
    stop = false;
    pinGM = this.getM();
    for (i = 0; i < G.length; i++){
      if(pins[i] == pinGM)
        stop = true;
    }
  }
  
  //GrpAuth step 2
  var ci = [];
  for(i = 0; i < G.length; i++){
		var sc = bigInt(1);
		for(var j = 0; j < G.length; j++){
			if(j == i){
				j++;
				if(j >= G.length)
					break;
			}
    	sc = sc.multiply(this.u.modPow(pins[j], this.n)).mod(this.n);
		}
		ci[i] = sc.multiply(this.u.modPow(pinGM, this.n)).mod(this.n);
  }
	
	//GrphAuth step 3
	var STC = ci[0].multiply(this.u.modPow(pins[0], this.n)).mod(this.n);
	pins.push(pinGM);
	
	this.D = pins;
	
	//TODO send variables
	//ci = secure code Mi to all group members
	//STC = secure test code server to server
  callback(ci, STC);
}

/**
* IndGen(R) is to make a common secure index. It takes as input a data R,
* outputs its common secure index CSIR.

@requires \forall i typeof(R[i]) == bigInt
*/
Henk.prototype.IndGen = function(R, callback) {
	
  // calculate common secure index of R
  var rho = bigInt.randBetween(0, this.n);
  var CSIR = [];
  CSIR[0] = rho.multiply(this.P); // mod n?
  for(j = 0; j < R.length; j++) {
    w = R[j];
    CSIR[j+1] = rho.multiply(this.gamma).multiply(this.P).multiply(this.f(w)).mod(this.n);
  }
  
	//TODO output CSIR
  callback(CSIR);
}

/**
* DatUpl(R,CSIR) is to upload the encrypted data with the common secure
* index to the server. It takes as input a data R and its common secure
* index CSIR, and then uploads the encrypted data Sg(R) with its CSIR
* to the server.

@requires \forall i typeof(R[i]) == bigInt
*/
Henk.prototype.DatUpl = function(R, CSIR, callback) {
  // rsa encrypt using Sg
	SgR = [];
	for(j = 0; j < R.length; j++) {
		SgR[j] = R[j].modPow(this.Sg, this.n);
	}
	
  // TODO send SgR to server
	callback(SgR);
}

/**
* Trpdor(L', l) is executed by a group member to make a trapdoor of a list of
* keywords the member wants to search. It takes as input a keyword list L
* and the locations l of the keywords in the common secure index, outputs
* the trapdoor TL
*/
Henk.prototype.Trpdor = function(L, l, callback) {
  ri = bigInt.randBetween(0, this.n);
  
  C = bigInt.one;
  
  for(j = 0; j < L.length; j++) {
    word = L[j];
    cj = this.g.modPow(this.f(word), this.n.multiply(this.n)).multiply(ri).modPow(this.n, this.n.multiply(this.n)).mod(this.n.multiply(this.n));
    C = C.multiply(cj).mod(this.n.multiply(this.n));
  }
  
	//TODO send trapdoor along with PIN di and secure code ci to server
  callback(C,l);
}

/*DatDwn(...) takes all the server parameters that are required to obtain data that matches a query using keywords
* It calls both SrhInd and MemChk to authenticate users and check if the queried data is available.
* The function returns a collection of data elements matching the queried key-word or a message toLocaleString
* the user indicating that no data matched the keyword search.
*/
Henk.prototype.DatDwn = function(G,di,ci,STC,C,l,allCSIr,R, callback){
	if(MemChk(G,di,ci,STC)){
		var collection = [];
		for(i = 0; i<allCSIr.length;i++){
			if(SrhInd(C,l,allCSIr[i])){
				collection.add(R[i]);
			}
		}		
		if(!collection.empty){
			sendToMember(collection);
		} else {
			sendToMember("No Data Matched");
		}	
	}

}

/* MemChk(di,ci,STC) verifies whether di is an element of (SysSet defined) M and ci^di is equal to the 
*  secure test code (STC) to see if a member is allowed to access the data.
*/
Henk.prototype.MemChk = function(di,ci,STC){
	for(i =0;i<this.D.length;i++){
		if(this.D[i] == di){
			if(ci.modPow(di,this.n) == STC){
				return true;
			}
		}
	}
	sendToMember("ACCESS DENIED");
	//unauthorised user trying to query -> terminate the system
	return false;
}

/* SrhInd(C,l, CSIr) is a funtionthat takes a Trapdoor (C,l) and a Common Security Index of Data Range
*  It checks whether the sum of security parameters s from the CSIr for which the location in the 
*  CSIr is equal to the keywords in list l of the trapdoor is equal to the Paillier function L of
*  trapdoor part C to the power beta*s0 mod n^2
*/
Henk.prototype.SrhInd = function(C,l, CSIr){
	var sumS = bigInt(0);
	for(i=0;i<l.length;i++){
		sumS = sumS.add(CSIr[l[i]]);
	}
	//L(x)=(x-1)/n
	return C.modPow(this.beta.multiply(CSIr[0]),paillier.n2).subtract(bigInt.one).divide(this.n) != sumS;	
}

/*DatDcp(sgr) sends the encrypted data to the GM for it to decrypt. We assume that the decrypted
* text sent back by the GM is sent over a secure (encrypted) channel.
*/
Henk.prototype.DatDcp = function(sgr, callback) {
	sendToGM(sgr);
}

Henk.prototype.SysSet = function(k, callback) {
  //rsa
  this.k = k;
	var key = new NodeRSA({b: k});
	components = key.exportKey('components');
	this.p = components.p;
	this.q = components.q;
  this.n = bigInt(components.n.toString('hex'), 16);
  var zn = this.f(bigInt(k),this.l);
  this.u = this.genu();
  
  //paillier
  var pkeys = paillier.generateKeys(100);
  var public = pkeys.pub;
  var priv = pkeys.sec;
  var sigma = bigInt(Math.floor((Math.random() * 100000000) + 2)); 
  var lmb = priv.lambda;
  var beta = sigma.multiply(lmb).mod(public.n2);
  var lfunc = public.np1.modPow(priv.lambda, public.n2).subtract(bigInt.one).divide(public.n);
  var gamma = sigma.multiply(lfunc).mod(public.n);
  
  //blind signatures 
  var s = this.s();
  //rsa tuple [e,n]
  var s1 = s[0];
  //rsa tuple [d,n]
  var s2 = s[1];
  
	//TODO actual send
	this.gamma = gamma;
	this.P = bigInt.randBetween(0, this.n); //TODO Make actual group generator
	this.Sg = s1[0];
	this.g = public.np1;
  //PKg = {public.np1, gamma, f, P, this.n, s1}
  //PKs = {m, beta, lfunc, this.n}
  //SK = {sigma, lmb, s2}
  callback(/* TODO sending parameters */);
}

paillier = {
	publicKey: function(bits, n) {
		this.bits = bits;
		this.n = n;
		this.n2 = n.square();
		this.np1 = n.add(bigInt.one);
		this.rncache = [];
	},
	privateKey: function(lambda, pubkey) {
		this.lambda = lambda;
		this.pubkey = pubkey;
		this.x = pubkey.np1.modPow(this.lambda,pubkey.n2).subtract(bigInt.one).divide(pubkey.n).modInv(pubkey.n);
	},
	generateKeys: function(modulusbits) {
		var p, q, n, keys = {};
		do {
			do {
				p = bigInt.randBetween(bigInt(2).pow(modulusbits-2), bigInt(2).pow(modulusbits+2));//new bigInt(modulusbits>>1,1,rng);
			} while (!p.isProbablePrime(10));

			do {
				q = bigInt.randBetween(bigInt(2).pow(modulusbits-2), bigInt(2).pow(modulusbits+2));//new bigInt(modulusbits>>1,1,rng);
			} while(!q.isProbablePrime(10));

			n = p.multiply(q);
		} while(!(n.and(bigInt(1).shiftLeft(modulusbits - 1))) || (p.compareTo(q) == 0));
		keys.pub = new paillier.publicKey(modulusbits,n);
		lambda = bigInt.lcm(p.subtract(bigInt.one),q.subtract(bigInt.one));
		keys.sec = new paillier.privateKey(lambda, keys.pub);
		return keys;
	}
}



/**************************************************/
/**                   Export                     **/
/**************************************************/
exports.Henk = Henk;