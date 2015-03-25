/* jshint node: true */
'use strict';

// For testing purposes get the auth from command line, eventually get it from the bookmaker.
var auth = process.argv[2];

var bookkeeper = require('./bookkeeper.js');
var archivist = require('./archivist.js');

// Get the settings from the bookmaker.
bookkeeper.getSettings('archivist', function gotSettings(settings) {
	settings.auth = auth;
	archivist.configure(settings);
	archivist.connect();
});

// When we receive a message (in the future) archive it.
archivist.on('message', function(message) {
	console.log('%s %s -> %s: %s', message.timestamp, message.channel, message.user, message.message);
});

// Act on chosen or dropped channels.
bookkeeper.on('joined', archivist.joinChannel);
bookkeeper.on('parted', archivist.leaveChannel);