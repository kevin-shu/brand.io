var siteConfig = {
	facebook: {
		cx: "009276826567446154459:jywb3jk6pqe",
		apiKey: "AIzaSyBE_3x6TJE3ETvMXNN_m6Qc-atgY459Brk"
	},
	twitter: {
		cx: "009276826567446154459:jl_c89dpwma",
		apiKey: "AIzaSyCJb2qmZGY9BYeYcXIfBJPh5bMzURW8vtI"
	}
};
var StanfordSimpleNLP = require('stanford-simple-nlp').StanfordSimpleNLP;

var NLPOptions = {
	annotators: ['tokenize', 'ssplit', 'parse']
};

var stanfordSimpleNLP = new StanfordSimpleNLP(NLPOptions, function(err) {
	console.log(err);
});

var axon = require('axon'),
	https = require('https'),
	async = require('async');

(function(){

	var ignoredWords = [ 	".", ",", "·", "...", "+", ":", "&", "'", "`",
							"I", "we", "my", "our", "you", "your", "he", "his", "she", "her", "they", "their", 
							"be", "is", "are", "was", "were", 
							"a", "an", "the", "this", "that", 
							"and", "on", "at", "in", "of", "for", "to", "from", "by"];

	var site = process.argv[2],
		limit = process.argv[3] || 30,
		port = process.argv[4];

	var pusher = axon.socket('push'),
		sub = axon.socket('sub'),
		i=0,
		max=limit/10,
		arr=[],
		searchResult=[],
		finalResult={};

	sub.connect(3040);
	console.log('sub server started');

	pusher.bind(parseInt(port,10));
	console.log('push server started at port '+parseInt(port,10));


	getHttpsCallback = function(asyncCallback){
		return function(response) {

				var data = "";

				//another chunk of data has been recieved, so append it to `str`
				response.on('data', function (chunk) {
					data += chunk;
				});

				//the whole response has been recieved, so we just print it out here
				response.on('end', function () {
					searchResult = searchResult.concat(JSON.parse(data).items);
					asyncCallback();
				});
			}
	}

	sub.on('message', function(q){
		arr=[];
		finalResult={};
		q=q.toString();
		ignoredWords.push(q.toLowerCase());

		console.log("#=== Start querying google customsearch API ===#")
		for (i=0,max=limit/10; i<max; i++) {
			arr.push(
				(function(i){
					return function(asyncCallback){
						var path = '/customsearch/v1?key='+siteConfig[site].apiKey+'&cx='+siteConfig[site].cx+'&q='+encodeURI(q)+'&startIndex='+(1+i*10);
						var options = {
							host: 'www.googleapis.com',
							path: path
						};
						console.log(options.host+options.path);
						https.request(options, getHttpsCallback(asyncCallback)).end();
					}
				})(i)
			);
		}
		// console.log("#=== Start querying google customsearch API ===#")

		async.parallel(
			arr, 
			function(){

				// console.log(searchResult);

				i=0, max=searchResult.length;
				async.whilst(
				    function () { return i < max; },
				    function (callback) {
				        console.log("========================== "+i+" ===============================");
				        try {
				        	var str = searchResult[i].snippet.replace(/[?!;]/g,".");
				        	str = str.replace(/[@#|\-()]/g," ");
				        	str = str.replace(/( +)/g," ");
					        stanfordSimpleNLP.process(str, function(err, result) {
					        	console.log("Parsing["+site+"] : \""+str+"\"");
								result = result.document.sentences.sentence.forEach ? result.document.sentences.sentence : [result.document.sentences.sentence];
								result.forEach(function(elem){
									var token = elem.tokens.token.forEach ? elem.tokens.token : [elem.tokens.token];
									token.forEach(function(elem){
										var word = elem.word.toLowerCase();
										if (ignoredWords.indexOf(word)==-1 ) {
											finalResult[word] = (finalResult[elem.word] || 0) + 1;
										}
									});
								});
								console.log("Parsing complete!");
								callback();
							});
						} catch(exception) {
							console.log("Oops, something wrong!");
							callback();
						}
				        i++;
				    },
				    function (err) {
				    	searchResult=[];
				        console.log("========================== finished ===============================");
				        console.log( JSON.stringify( {site: site, words: finalResult} ) );
						pusher.send( JSON.stringify( {site: site, words: finalResult} ) );
				    }
				);
			}
		);
	});
})();