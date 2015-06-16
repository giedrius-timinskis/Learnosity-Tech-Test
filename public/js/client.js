// Chat app
$(function() {
var socket = io.connect('http://localhost:1000'); //Creates connection between server and website

var $chatSender = $('.chat-send');
var $input = $('.chat-input');
var $chatWindow = $('.chat-window');
var $usernameForm = $('#username-form');
var $username = $('#username')

$chatSender.on('click', function(event) {
    event.preventDefault();
    socket.emit('chat-message', $input.val());
    $input.val('');
});

$usernameForm.submit(function(event) {
    event.preventDefault();
    socket.emit('new-user', $username.val(), function(data) {
        if(data) {
            $('.username-container').hide();
            $('.io-container').show();
            $('.chat-members-container').show();
        } else {
            $('#error').html('Username already in use.');

        }
    });
    $username.val('');
});

socket.on('usernames', function(data) {
    var currentHtml = '';
    var i = 0;
    for(i = 0; i < data.length; i++) {
        currentHtml += data[i] + '<br>';
    }
    $('#current-users').html(currentHtml);
});

socket.on('chat-message', function(data) {
    $chatWindow.append('<strong>' + data.user + '</strong>: ' + data.msg + '<hr><br>');
});

socket.on('past-messages', function(data) {
    $chatWindow.append('<strong>' + data.user + '</strong>: ' + data.msg + '<br>');
});

});
