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
var Init = function(server, GM, clients, k) {
	this.server = server;
	this.GM = GM;
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
Init.prototype.f = function(x) {
  return this.u.modPow(x, this.n);
}

/**
 * Generate u function.
 */
Init.prototype.genu = function(){
  return bigInt(Math.floor(Math.random() * 100000)).modPow(2,bigInt(this.n));
}

/**
 * Function to generate an element of M.
 */
Init.prototype.genElemM = function() {
  var B = this.n;
  var tmp = null;
  
  do{
    forge.prime.generateProbablePrime(this.k, function(err, num){
      tmp = bigInt(num.toString());
    });
  }while(tmp == null || tmp.gt(B) || tmp.lt(2) || tmp.eq(this.p) || tmp.eq(this.q));
  return tmp;
}

Init.prototype.s = function(){
	var key = new NodeRSA({b: this.l});
  var comp = key.exportKey('components');
	return [[bigInt(comp.e),bigInt(comp.n.toString('hex'), 16)],[bigInt(comp.d.toString('hex'), 16),bigInt(comp.n.toString('hex'), 16)]];
}

/***************************************************
/**               Public functions               **/
/**************************************************/

Init.prototype.SysSet = function(k, callback) {
  this.k = k;
  var key = new NodeRSA({b: k});
  components = key.exportKey('components');
  this.p = components.p;
  this.q = components.q;
  this.n = bigInt(components.n.toString('hex'), 16);
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
  
	// Publish PKg
	this.g = public.np1;
	this.gamma = gamma;
	this.P = bigInt.randBetween(0, this.n); //TODO Make actual group generator
	this.Sg = s1[0];
	this.publishPKg(this.g, this.gamma, {u: this.u}, this.P, this.n, this.Sg, function(){});
	
	// Publish PKs
	this.beta = beta;
	this.publishPKs({k: this.k, p: this.p, q: this.q}, this.beta, this.n, function(){});
	
	// Store SK
	this.sigma = sigma;
	this.lambda = lmb;
	this.SgPrime = s1[1];
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
		return keys;
	}
}


/***************************************************
/**                 Send functions               **/
/**************************************************/

/**
 * Publish method for parameters for each group member
 */
Init.prototype.publishPKg = function(g, gamma, f, P, n, Sg, callback){
	//Publish to GM
	this.GM.receivePKg(g, gamma, f, P, n, Sg, function(){});
	//Publish to Clients
	for(var i = 0; i < this.clients.length; i++)
		this.clients[i].receivePKg(g, gamma, f, P, n, Sg, function(){});
  //TODO
  callback();
}

/**
 * Publish method for parameters for server
 */
Init.prototype.publishPKs = function(M, beta, n, callback){
	this.server.receivePKs(M, beta, n, function(){});
	callback();
}

/**************************************************/
/**                   Export                     **/
/**************************************************/
exports.Init = Init;