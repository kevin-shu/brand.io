var StanfordSimpleNLP = require('stanford-simple-nlp').StanfordSimpleNLP;

var NLPOptions = {
	annotators: ['tokenize', 'ssplit', 'parse']
};
var stanfordSimpleNLP = new StanfordSimpleNLP( NLPOptions, function(err) {
	stanfordSimpleNLP.process("The latest from yungchihshu Kevin yungchihshu .", function(err, result) {
		console.log(result.document.sentences.sentence);
		var tmp = {};
		result = result.document.sentences.sentence.forEach ? result.document.sentences.sentence : [result.document.sentences.sentence];
		result.forEach(function(elem){
			var token = elem.tokens.token.forEach ? elem.tokens.token : [elem.tokens.token];
			console.log(token);
			token.forEach(function(elem){
				tmp[elem.word] = (tmp[elem.word] || 0) + 1;
			});
		});
		console.log(tmp);
		// console.log(data.document.sentences.sentence.tokens.token);
	});
});