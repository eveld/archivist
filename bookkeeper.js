/* jshint node: true */
'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');

var path = require('path');
var etcd = require('etcd');
// etcd.configure({
// 	host: '192.168.1.200',
// 	port: 4001
// });

var Bookkeeper = function() {
	EventEmitter.call(this);
};
util.inherits(Bookkeeper, EventEmitter);

Bookkeeper.prototype.getSettings = function(name, callback) {
	//etcd.get(path.join(name + '/settings'), callback);
	callback({
		name: 'botnics',
		version: 3,
		auth: 'oauth:voy0mtsh0nxizt75igwdet7ectzhdi'
	});
};

module.exports = new Bookkeeper();