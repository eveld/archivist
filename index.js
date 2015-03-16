/* jshint node: true */
'use strict';

var bookkeeper = require('./bookkeeper.js');
var archivist = require('./archivist.js');

bookkeeper.getSettings('archivist', function gotSettings(settings) {
	archivist.configure({
		name: 'botnics',
		version: 3,
		auth: 'oauth:voy0mtsh0nxizt75igwdet7ectzhdi'
	});

	archivist.connect();
});

archivist.on('message', function(message) {
	console.log('%s %s / %s: %s', message.timestamp, message.channel, message.user, message.message);
});

bookkeeper.on('joined', archivist.joinChannel);
bookkeeper.on('parted', archivist.leaveChannel);