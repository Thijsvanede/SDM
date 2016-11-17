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
var GM = function(server, clients, k) {
  // Hosting server
  this.server = server;
  // Clients of group
  this.clients = clients;
  
  //Security parameters
  this.k = null;					// security parameter k
  this.l = bigInt(2048);	// length of longest word
	
	//RSA variables
  this.n = null;					// n modulus of RSA
  this.q = null;					// prime p of RSA
  this.p = null;					// prime q of RSA
	
	//PKg variables
	this.g = null;					
	this.gamma = null;			
  this.u = null;					// random quadratic residue u modulo n
	this.P = null;					
	this.Sg = null;					
	
	//PKs variables
	this.beta = null;				
	
	//SK variables
	this.sigma = null;			
	this.lambda = null;			
	this.SgPrime = null;		
  
  // Variables from GrpAut
  this.ci = null;
  this.D = null;
  
  this.SysSet(k, function(){
    console.log("System initialised.");
  });
};

/***************************************************
/**               Private functions              **/
/**************************************************/

/**
 * Function f
 */
GM.prototype.f = function(x) {
  return this.u.modPow(x, this.n);
}

/**
 * Generate u function.
 */
GM.prototype.genu = function(){
  return bigInt(Math.floor(Math.random() * 100000) + 2).modPow(2, bigInt(this.n));
}

/**
 * Function to generate an element of M.
 */
GM.prototype.genElemM = function(callback) {
  var B = this.n;
  var tmp = null;
  
  do{
    forge.prime.generateProbablePrime(this.k, function(err, num){
      tmp = bigInt(num.toString());
    });
  }while(tmp == null || tmp.gt(B) || tmp.lt(2) || tmp.eq(this.p) || tmp.eq(this.q));	
  callback(tmp);
}

GM.prototype.s = function(){
	var key = new NodeRSA({b: this.l});
  var comp = key.exportKey('components');
	return [[bigInt(comp.e),bigInt(comp.n.toString('hex'), 16)],[bigInt(comp.d.toString('hex'), 16),bigInt(comp.n.toString('hex'), 16)]];
}

/***************************************************
/**          Public functions - SysSet           **/
/**************************************************/
GM.prototype.SysSet = function(k, callback) {
  this.k = k;
//   var key = new NodeRSA({b: k});
//   components = key.exportKey('components');
//   this.p = components.p;
//   this.q = components.q;
//   this.n = bigInt(components.n.toString('hex'), 16);
  
  //paillier
  var pkeys = paillier.generateKeys(k);
  var public = pkeys.pub;
  var priv = pkeys.sec;
	this.p = pkeys.p;
	this.q = pkeys.q;
	this.n = public.n;
	
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
	
	// Generate parameter u.
  this.u = this.genu();
  
	// Publish PKg
	this.g = public.np1;
	this.gamma = gamma;
	this.P = bigInt.randBetween(0, this.n); //TODO Make actual group generator
	this.Sg = s1;
	this.publishPKg(this.receiveSgR, this.g, this.gamma, {u: this.u}, this.P, this.n, this.Sg, function(){});
	
	// Publish PKs
	this.beta = beta;
	this.publishPKs({k: this.k, p: this.p, q: this.q}, this.beta, this.n, function(){});
	
	// Store SK
	this.sigma = sigma;
	this.lambda = lmb;
	this.SgPrime = s2;
  callback();
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
		keys.p = p;
		keys.q = q;
		return keys;
	}
}

/***************************************************
/**         Public functions - GrpAuth           **/
/**************************************************/
/**
 * is executed by GM to make authentication codes for the orig-
 * inal group. It takes as input all members M1,...,MN in the group G,
 * outputs PIN numbers di and secure codes ci for all members, and a secure
 * test code STC for the server.
 */
GM.prototype.GrpAuth = function(callback) {
  //GrpAuth step 1
  var pins = [];
  for (var i = 0; i < this.clients.length; i++) {
    this.server.genElemM(function(di){
      pins[i] = di;
    });
  }
  
  var pinGM = null;
  var stop = true;
  
  while(pinGM == null || stop){
    stop = false;
    this.server.genElemM(function(di){
      pinGM = di;
    });
    for (i = 0; i < this.clients.length; i++){
      if(pins[i] == pinGM)
        stop = true;
    }
  }
  
  //GrpAuth step 2
  var ci = [];
  for(i = 0; i < this.clients.length; i++){
		var sc = this.u;
		for(var j = 0; j < this.clients.length; j++){
			if(j == i){
				continue;
			}
			sc = sc.modPow(pins[j], this.n);
		}
		ci[i] = sc.modPow(pinGM, this.n);
		
		//Send PIN and ci to client
		this.sendPINs(this.clients[i], pins[i], ci[i], function(){});
  }
	
	//GrphAuth step 3
	var STC = ci[0].modPow(pins[0], this.n);
	
	pins.push(pinGM);
	
  this.ci = ci;
	this.D = pins;
  
  this.sendSTC(STC, function(){});
  callback();
}

/***************************************************
/**                 Send functions               **/
/**************************************************/
/**
 * Publish method for parameters for each group member
 */
GM.prototype.publishPKg = function(receiveSgR, g, gamma, f, P, n, Sg, callback){
	//Publish to Clients
	for(var i = 0; i < this.clients.length; i++)
		this.clients[i].receivePKg(this, g, gamma, f, P, n, Sg, function(){});
  callback();
}

/**
 * Publish method for parameters for server
 */
GM.prototype.publishPKs = function(M, beta, n, callback){
	this.server.receivePKs(M, beta, n, function(){});
	callback();
}

/**
 * Method to send STC to server.
 */
GM.prototype.sendSTC = function(STC, callback){
  this.server.receiveSTC(STC, function(){});
  callback();
}

/**
 * Method to send PIN and ci to client.
 */
GM.prototype.sendPINs = function(client, PIN, ci, callback){
	client.receivePINs(PIN, ci, function(){});
	callback();
}

/***************************************************
/**               Receive functions              **/
/**************************************************/
GM.prototype.receiveSgR = function(SgR, callback) {
	var plain = SgR.modPow(this.SgPrime[0], this.SgPrime[1]);
	callback(plain);
}

/**************************************************/
/**                   Export                     **/
/**************************************************/
exports.GM = GM;