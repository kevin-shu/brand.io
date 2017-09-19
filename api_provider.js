/**
 * Module dependencies.
 */

var express = require('express'),
	axon = require('axon'),
	pub = axon.socket('pub'),
	puller1 = axon.socket('pull'),
	puller2 = axon.socket('pull'),
	app = express();

var result = {
	name:"Social keyword",
	children:[]
},
	workerCounter=0;

pub.bind(3040);

puller1.connect(3041);
puller2.connect(3042);
console.log("Pull server ready")

app.get('/parse', function(req, res){
	puller1.on('message', function(msg){
		workerCounter+=1;
		console.log("Puller1 ready, count:"+workerCounter);
		data = JSON.parse(msg.toString())
		// result[data.site] = data.words;
		result.children.push(formatData(data));
		if (workerCounter>=2) {
			// res.send('jsonCallback('+JSON.stringify(result)+")");
			// workerCounter=0;
			// result={};
			responseClient(res);
		}
	});
	puller2.on('message', function(msg){
		workerCounter+=1;
		console.log("Puller2 ready, count:"+workerCounter);
		data = JSON.parse(msg.toString())
		result.children.push(formatData(data));
		if (workerCounter>=2) {
			responseClient(res);
		}
	});
	pub.send(req.query.q);
});

app.get('/', function(req, res){
	res.send("hello world");
});

app.listen(3030);

function formatData(data) {
	var result={
			name: data.site,
			children: []
		},
		words = data.words;
	for(key in words){
		if (words[key]>=3) {
			result.children.push(
				{
					name: key,
					size: words[key]
				}
			);
		}
	}
	return result;
}

function responseClient(res) {
	res.send('jsonCallback('+JSON.stringify(result)+")");
	workerCounter=0;
	result={
		name:"Social keyword",
		children:[]
	};
};