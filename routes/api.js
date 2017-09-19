/*
 * API
 */
// var axon = require('axon'),
// 	pusher = axon.socket('push'),

exports.parse = function(req, res){
	res.render('index', { title: 'API' });
};