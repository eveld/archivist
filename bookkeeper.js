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

/**
 * Bookkeeper connects to ectd and watches and gathers information for its clients.
 * @constructor
 */
var Bookkeeper = function() {
	EventEmitter.call(this);
};
util.inherits(Bookkeeper, EventEmitter);

/**
 * Get settings for a client from etcd.
 * @param {string} name The name of the client to get the settings for.
 * @param {Function} callback The function to call when the settings have been retrieved.
 * @return {Object} Settings for the client.
 *
 * @example
 * bookkeeper.getSettings('myservice', function(settings) {
 *   // Do something with settings.
 * });
 */
Bookkeeper.prototype.getSettings = function(name, callback) {
	//etcd.get(path.join(name + '/settings'), callback);
	callback({
		name: 'botnics',
		version: 3,
		auth: null
	});
};

module.exports = new Bookkeeper();