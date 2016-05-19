/* This file is used to communicate with the server and manipulate the front-end.
 * There are two parts to this: the first one creates emit events, the second
 * part receives data from the server, and appends it to the DOM
 */
$(function () {
    var socket = io.connect('http://localhost:1000'); //Creates connection between server and website

    // Initialize local variables
    var $chatSender = $('.chat-send');
    var $input = $('.chat-input');
    var $chatWindow = $('.chat-window');
    var $usernameForm = $('#username-form');
    var $username = $('#username')

    // When a message is sent emits the value from .chat-input
    $chatSender.on('click', function (event) {
        event.preventDefault();
        socket.emit('chat-message', $input.val());
        $input.val('');
    });

    // When user submits a new username, check it doesn't already exist,
    // if it doesn't hide the .username-container, and show the chat
    $usernameForm.submit(function (event) {
        event.preventDefault();
        socket.emit('new-user', $username.val(), function (data) {
            if (data) {
                $('.username-container').hide();
                $('.io-container').show();
                $('.chat-members-container').show();
            } else {
                $('#error').html('Username already in use.');

            }
        });
        $username.val('');
    });

    // When usernames is emitted, update the username list
    socket.on('usernames', function (data) {
        var currentHtml = '';
        var i = 0;
        for (i = 0; i < data.length; i++) {
            currentHtml += data[i] + '<br>';
        }
        $('#current-users').html(currentHtml);
    });

    // When chat-message is emitted, append it to the chat window
    socket.on('chat-message', function (data) {
        $chatWindow.append('<strong>' + data.user + '</strong>: ' + data.msg + '<br>');
    });

    // When past-messages is emitted, append it to the chat window
    socket.on('past-messages', function (data) {
        $chatWindow.append('<strong>' + data.user + '</strong>: ' + data.msg + '<br>');
    });

});
