/* jshint node: true */
'use strict';

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
 */
Archivist.prototype.configure = function(settings) {
	this.name = settings.name;
	this.version = settings.version;
	this.auth = settings.auth;

	return this;
};

/**
 * Connect to twitch chat.
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
 */
Archivist.prototype.setClientVersion = function(version) {
	client.irc.raw('twitchclient ' + version);
};

/**
 * Join a twitch channel.
 * @param {string} channel The channel to join.
 */
Archivist.prototype.joinChannel = function(channel) {
	client.irc.join(channel);
};

/**
 * Leave a twitch channel.
 * @param {string} channel The channel to leave.
 */
Archivist.prototype.leaveChannel = function(channel) {
	client.irc.part(channel);
};

/**
 * Parse the message and emit a message event when the message is complete.
 * @param {string} message The message to parse.
 * @fires Archivist#message
 *
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
Archivist.prototype.parseMessage = function(message) {
	// If it is not a normal chat message.
	if (message.nickname === 'jtv') {
		if (message.message.indexOf('USERCOLOR') === 0) {
			meta.color = this.getUserColor(message);
		} else if (message.message.indexOf('EMOTESET') === 0) {
			meta.emotesets = this.getEmoteSet(message);
		} else if (message.message.indexOf('SPECIALUSER') === 0) {
			meta.level = this.getSpecialUser(message);
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
 */
Archivist.prototype.getUserColor = function(message) {
	var parts = message.message.split(' ');
	return parts[2];
};

/**
 * Grab the user emote set from a message.
 * @param {string} message The message to get the user emote set from.
 * @return {Array} A list of emote sets.
 */
Archivist.prototype.getEmoteSet = function(message) {
	var parts = message.message.split(' ');
	var channels = parts[2].substring(1, parts[2].length - 1);
	return channels.split(',');
};

/**
 * Grab the user level from a message.
 * @param {string} message The message to get the user level from.
 * @return {string} The user level.
 */
Archivist.prototype.getSpecialUser = function(message) {
	var parts = message.message.split(' ');
	return parts[2];
};

module.exports = new Archivist();