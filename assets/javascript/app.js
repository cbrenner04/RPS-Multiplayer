// Initialize Firebase
var config = {
    apiKey: "AIzaSyAdGhATJcg2BS46FhM1GNsJaBrjfQ9Ew3Q",
    authDomain: "rps-multiplayer-25dc4.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-25dc4.firebaseio.com",
    storageBucket: "rps-multiplayer-25dc4.appspot.com",
    messagingSenderId: "449061417401"
};
firebase.initializeApp(config);

// reference the database
var database = firebase.database();

$(document).on('ready', function() {
    // if player already exists on this device set the username to currentPlayer
    var currentPlayer = localStorage.getItem('username');
    // if player does not already exist on this device
    if (currentPlayer === null) {
        // show the entrance screen and hide the gameplay screen to force username input
        $('#entrance').show();
        $('#gameplay').hide();
        // when a username has been input and the submit button is selected
        $('#submit').on('click', function() {
            // set the currentPlayer variable
            currentPlayer = $('#username').val().trim();
            // set the localStorage item -- so when the player returns this does not happen again
            localStorage.setItem('username', currentPlayer);
            // set welcome message
            $('#welcome-message').text('Welcome ' + currentPlayer + '!');
            // show welcome message
            $('#welcome-message').show();
            // hide the entrance screen
            $('#entrance').hide();
            // show the gameplay screen
            $('#gameplay').show();
            return false;
        });
        // if a player already exists on this device
    } else {
        // set the welcome message
        $('#welcome-message').text('Welcome back ' + currentPlayer + '!');
        // set the username in the game board
        $('#current-player').text(currentPlayer);
        // show the welcome message
        $('#welcome').show();
        // hide the entrance screen
        $('#entrance').hide();
        // show the gameplay screen
        $('#gameplay').show();
    }

    $('#remove-message').on('click', function() {
        $('#welcome').hide();
    });

    // get most recent game object
    database.ref().orderByChild('timestamp').limitToLast(1).once('value', function(snapshot) {
        var key = Object.keys(snapshot.val()).toString();
        var playerTwo = snapshot.val()[key].player2;

        // check for current "open" game
        // if there is an open game
        if (playerTwo === undefined) {
            // the current player is player 2
            database.ref().child(key).update({
                player2: currentPlayer
            });
        } else {
            // create new game
            // the current player is player 1
            database.ref().push({
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                player1: currentPlayer
            });
        }
    });

    /*
        show game board and messaging
            game board should show user name, wins, and losses
            data will come from firebase
        -- check for sessionStorage for current players --
        if current players are less than 2
            show a message about waiting for another player
            do not allow game play
        else
            allow game play
     */

    /*
        listen for player choice
        if both players have chosen
            display the result
            log win to winner on firebase
            log loss to loser on firebase
        else if current player has chosen
            display message that current player needs to choose
        else if other play has not chosen
            display message that waiting on other players choice

        after round is complete
            reset currentPlayers
            hide gameplay
            show restart
     */

    /*
        clear message log each new session
            -- variable in sessionStorage? --
        listen for player message
        display user name and message
     */
});
