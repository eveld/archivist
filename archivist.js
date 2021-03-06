/* jshint node: true */
'use strict';

/**
 * @event Archivist#message
 * @type {Object}
 * @property {Array} emotesets - A list of emotesets the user has access to.
 * @property {string} color - The color of the message.
 * @property {string} level - The level of the user.
 * @property {long} timestamp - The timestamp when the message was sent.
 * @property {string} user - The user that sent the message.
 * @property {string} channel - The channel the message was sent to.
 * @property {string} message - The contents of the message.
 */

// Events.
var EventEmitter = require('events').EventEmitter;
var util = require('util');

// IRC.
var factory = require('irc-factory');
var api = new factory.Api();
var client = {};

// Message meta.
var meta = {};

/**
 * Archivist connects to twitch chat and collects all chat messages.
 * @constructor
 */
var Archivist = function() {
	EventEmitter.call(this);
	var archivist = this;

	// Wait for a registered message to send the client version to twitch chat.
	api.hookEvent('archivist', 'registered', function onRegistered(message) {
		archivist.setClientVersion(archivist.version);
		archivist.joinChannel('#imaqtpie');
	});

	// Parse all incoming chat messages.
	api.hookEvent('archivist', 'privmsg', function onMessage(message) {
		archivist.parseMessage(message);
	});
};
util.inherits(Archivist, EventEmitter);

/**
 * Configure Archivist.
 * @param {Object} settings The settings for the twitch client.
 * @return {Object} The Archivist instance.
 *
 * @example
 * archivist.configure({
 *   name: 'chatbot',
 *   version: 3,
 *   auth: 'oauth:mysecrettoken'
 * });
 */
Archivist.prototype.configure = function(settings) {
	this.name = settings.name;
	this.version = settings.version;
	this.auth = settings.auth;

	return this;
};

/**
 * Connect to twitch chat.
 *
 * @example
 * archivist.connect();
 */
Archivist.prototype.connect = function() {
	if (this.name && this.version && this.auth) {
		client = api.createClient('archivist', {
			nick: this.name,
			user: this.name,
			realname: this.name,
			server: 'irc.twitch.tv',
			port: 6667,
			password: this.auth
		});
	} else {
		throw new Error('Archivist is not configured');
	}
};

/**
 * Set the twitch chat client version.
 * @param {int} version The client version to use.
 *
 * @example
 * archivist.setClientVersion(3);
 */
Archivist.prototype.setClientVersion = function(version) {
	client.irc.raw('twitchclient ' + version);
};

/**
 * Join a twitch channel.
 * @param {string} channel The channel to join.
 *
 * @example
 * archivist.joinChannel('#mytwitchchannel');
 */
Archivist.prototype.joinChannel = function(channel) {
	client.irc.join(channel);
};

/**
 * Leave a twitch channel.
 * @param {string} channel The channel to leave.
 *
 * @example
 * archivist.leaveChannel('#mytwitchchannel');
 */
Archivist.prototype.leaveChannel = function(channel) {
	client.irc.part(channel);
};

/**
 * Parse the message and emit a message event when the message is complete.
 * @param {string} message The message to parse.
 * @fires Archivist#message
 *
 * @example
 * archivist.parseMessage({
 *   nickname: 'someuser',
 *   username: 'someuser',
 *   hostname: 'someuser.tmi.twitch.tv',
 *   target: '#mytwitchchannel',
 *   message: 'I am saying something very cool!',
 *   time: Wed Mar 25 2015 16:09:45 GMT+0100 (CET),
 *   raw: ':someuser!someuser@someuser.tmi.twitch.tv PRIVMSG #mytwitchchannel :I am saying something very cool!'
 * });
 */
Archivist.prototype.parseMessage = function(message) {
	console.log(message);

	// If it is not a normal chat message.
	if (message.nickname === 'jtv') {
		if (message.message.indexOf('USERCOLOR') === 0) {
			meta.color = this.getUserColor(message.message);
		} else if (message.message.indexOf('EMOTESET') === 0) {
			meta.emotesets = this.getEmoteSet(message.message);
		} else if (message.message.indexOf('SPECIALUSER') === 0) {
			meta.level = this.getSpecialUser(message.message);
		}
	} else if (message.target !== this.name) {
		this.emit('message', {
			emotesets: meta.emotesets,
			color: meta.color,
			level: meta.level,
			timestamp: Date.now(),
			user: message.nickname,
			channel: message.target,
			message: message.message
		});

		meta = {};
	}
	// We don't care about other types of messages.
};

/**
 * Grab the user color from a message.
 * @param {string} message The message to get the user color from.
 * @return {string} The user color as hex value e.g. #FFFFFF.
 *
 * @example
 * // Returns #B22222
 * archivist.getUserColor('USERCOLOR someuser #B22222');
 */
Archivist.prototype.getUserColor = function(message) {
	var parts = message.split(' ');
	return parts[2];
};

/**
 * Grab the user emote set from a message.
 * @param {string} message The message to get the user emote set from.
 * @return {Array} A list of emote sets.
 *
 * @example
 * // Returns [72, 3419]
 * archivist.getEmoteSet('EMOTESET someuser [72,3419]');
 */
Archivist.prototype.getEmoteSet = function(message) {
	var parts = message.split(' ');
	var channels = parts[2].substring(1, parts[2].length - 1);
	return channels.split(',');
};

/**
 * Grab the user level from a message.
 * @param {string} message The message to get the user level from.
 * @return {string} The user level.
 *
 * @example
 * // Returns subscriber
 * archivist.getSpecialUser('SPECIALUSER someuser subscriber');
 */
Archivist.prototype.getSpecialUser = function(message) {
	var parts = message.split(' ');
	return parts[2];
};

module.exports = new Archivist();