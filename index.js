/* jshint node: true */
'use strict';

var auth = process.argv[2];

var bookkeeper = require('./bookkeeper.js');
var archivist = require('./archivist.js');

bookkeeper.getSettings('archivist', function gotSettings(settings) {
	settings.auth = auth;
	archivist.configure(settings);
	archivist.connect();
});

archivist.on('message', function(message) {
	console.log('%s %s -> %s: %s', message.timestamp, message.channel, message.user, message.message);
});

bookkeeper.on('joined', archivist.joinChannel);
bookkeeper.on('parted', archivist.leaveChannel);