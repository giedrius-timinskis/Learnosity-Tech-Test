'use strict';

/* Initialize modules */
var express = require('express');
var app = express();
var server = require('http').Server(app);

// When using socket.io it is important to pass in HTTP server object
var io = require('socket.io')(server);
var storage = require('./storage/storage');

// Redis is used for persistent storage
var redis = require('redis');
var redisClient = redis.createClient();
//app.use(require('body-parser').json());

var people = [];
var userNames = [];
var userCount = 0;

/* Used as a workaround for cross-domain difficulties */
app.get('*', express.static('./public'));

/*
 * This method is used for caching the last 10 messages
 * using Redis storage. It takes username and message
 * as arguments, pushes it into a a slot called
 * "messages", and trims the oldest 11th message
 */
var storeMessage = function(username, message) {
    var message = JSON.stringify({username: username, message: message});
    // Pass the messages into the redis client for storage
    redisClient.lpush("messages", message, function(err, res) {
        // Only keep the last 10 messages
        redisClient.ltrim("messages", 0, 9);
    });
}

/*
 * Listens to a connecting user, handles all the actions
 * that may be performed when a new user connects
 */
io.on('connection', function(client) {

    /*
     * The new-user event listener is used for emitting the last 10 messages
     * when a new user joins the chat. Additionally, this event is used for
     * adding new users to the chat.
     */
    client.on('new-user', function(data, callback){
        // Get all items from Redis from 'messages' list
        redisClient.lrange('messages', 0, -1, function(err, messages) {
            // Reverse the list so it displays in order from oldest to newest
            messages = messages.reverse();
            // Iterate through each message in the list
            messages.forEach(function(message) {
                // Parse the message
                message = JSON.parse(message);
                // Emit the past 10 messages
                io.emit('past-messages', {msg: message.message, user: message.username});
            });
        });

        /* This block of code is used for adding user to the list
         * of current chat users
         */
        // Check if user doesn't already exist
        if(userNames.indexOf(data) != -1) {
            callback(false);
        // If the user doesn't exist, add the user to the list, and emit the list
        } else {
            callback(true);
            client.username = data;
            userNames.push(client.username);
            updateUsernames();
        }
    });

    // This method is used for emitting the online users
    function updateUsernames() {
        io.emit('usernames', userNames);
    }

    /*
     * If a connected user types in a message in chat
     * make it visible to all the connected users. Additionally,
     * store the message in Redis cache.
     */

    client.on('chat-message', function(message) {
        // Store the message in Redis cache
        storeMessage(client.username, message);
        // Emit the message, and user that sent it
        io.emit('chat-message', {msg: message, user: client.username});
    });

    /*
     * If a connected client disconnects make it
     * visible to other users.
     */
    client.on('disconnect', function(data) {
        if(!client.username)
            return;
        userNames.splice(userNames.indexOf(client.username), 1);
        updateUsernames();
    });
});

// Set port for the server to listen to
server.listen(1000, function () {
    console.log('Listening on port 1000');
});

// TODO: When client leaves, output that to chat
// Clean up styling
// Handle refreshes better
// Separate this into a separate storage module
// Use templating engine
// Implement unit tests
// Have chat groups + implement private messaging
// Highlight the current user
// Make it so that chat is always scrolled to bottom
// Implement keyboard shortcuts
// Add customizability for each user
// Add handling for lowercase/uppercase usernames
// Implement promises (bluebird?)
