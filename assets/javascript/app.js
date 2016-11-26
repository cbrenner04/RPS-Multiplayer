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
// global variable for currentPlayer
var currentPlayer;

$(document).on('ready', function() {
    // listen for message removal
    $('#remove-message').on('click', function() {
        $('#welcome').hide();
    });

    // if player already exists on this device set the username to currentPlayer
    currentPlayer = localStorage.getItem('username');
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
            setUpGameBoard();
            setUpGame();
            return false;
        });
        // if a player already exists on this device
    } else {
        // set the welcome message
        $('#welcome-message').text('Welcome back ' + currentPlayer + '!');
        setUpGameBoard();
        setUpGame();
    }
});

function setUpGameBoard() {
    // set the username in the game board
    $('#current-player').text(currentPlayer);
    // show the welcome message
    $('#welcome').show();
    // hide the entrance screen
    $('#entrance').hide();
    // show the gameplay screen
    $('#gameplay').show();
}

var gameKey;
var playerOne;
var playerTwo;
var currentPlayerWins;
var otherPlayerWins;

function setUpGame() {
    // get most recent game object
    database.ref().orderByChild('timestamp').limitToLast(1).on('value', function(snapshot) {
        gameKey = Object.keys(snapshot.val()).toString();
        playerOne = snapshot.val()[gameKey].player1;
        playerTwo = snapshot.val()[gameKey].player2;

        if (currentPlayer === playerOne) {
            currentPlayerWins = snapshot.val()[gameKey].playerOneWins;
            otherPlayerWins = snapshot.val()[gameKey].playerTwoWins;
            displayWins();
        } else if (currentPlayer === playerTwo) {
            currentPlayerWins = snapshot.val()[gameKey].playerTwoWins;
            otherPlayerWins = snapshot.val()[gameKey].playerOneWins;
            displayWins();
        }

        // check for current "open" game
        // if there is an open game
        if (playerTwo === undefined) {
            // check that current player is not already attached to this game
            if (playerOne !== currentPlayer) {
                // the current player is player 2
                database.ref().child(gameKey).update({
                    player2: currentPlayer,
                    playerTwoWins: 0
                });
            }
        // check that current player is not already attached to latest game
        } else if (playerOne !== currentPlayer && playerTwo !== currentPlayer) {
            createNewGame();
        } else if (playerOne === currentPlayer) {
            // set player2 as the other player
            $('#other-player').text(playerTwo);
            // hide waiting alert
            $('#waiting-on-player').hide();
            // show other player card
            $('#other-player-panel').show();
            // play the game
            playGame();
        } else if (playerTwo === currentPlayer) {
            // set player1 as the other player
            $('#other-player').text(playerOne);
            // hide waiting alert
            $('#waiting-on-player').hide();
            // show other player card
            $('#other-player-panel').show();
            // play game
            playGame();
        }
    });
}

function displayWins() {
    $('#current-wins').text(currentPlayerWins || 0);
    $('#current-losses').text(otherPlayerWins || 0);
    $('#other-wins').text(otherPlayerWins);
    $('#other-losses').text(currentPlayerWins);
}

function createNewGame() {
    // create new game
    // the current player is player 1
    database.ref().push({
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        player1: currentPlayer,
        playerOneWins: 0
    }).push({
        // initialize first round
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });
    // show waiting on player alert
    $('#waiting-on-player').show();
    // hide player 2 card
    $('#other-player-panel').hide();
    setUpGame();
}

function playGame() {
    $('#new-game').on('click', function() {
        createNewGame();
    });

    var roundKey;
    var playerOneChoice;
    var playerTwoChoice;

    database.ref().child(gameKey).orderByChild('timestamp').limitToLast(1).on('value', function(snapshot) {
        roundKey = Object.keys(snapshot.val()).toString();
        playerOneChoice = snapshot.val()[roundKey].player1;
        playerTwoChoice = snapshot.val()[roundKey].player2;

        if (playerOneChoice !== undefined && playerTwoChoice !== undefined) {
            if (playerOne === currentPlayer) {
                $('#other-choice').text('They played ' + playerTwoChoice);
            } else if (playerTwo === currentPlayer) {
                $('#other-choice').text('They played ' + playerOneChoice);
            }

            if (playerOneChoice === playerTwoChoice) {
                $('#current-result').text('You tied');
                $('#other-result').text('They tied');
            } else if ((playerOneChoice === 'Rock' && playerTwoChoice === 'Scissors') ||
                      (playerOneChoice === 'Scissors' && playerTwoChoice === 'Paper') ||
                      (playerOneChoice === 'Paper' && playerTwoChoice === 'Rock')) {
                if (currentPlayer === playerOne) {
                    $('#current-result').text('You win!');
                    $('#other-result').text('They lose!');
                } else {
                    $('#current-result').text('You lose!');
                    $('#other-result').text('They win!');
                }
                // database.ref().child(gameKey).update({
                //     playerOneWins: currentPlayerWins + 1
                // });
            } else {
                if (currentPlayer === playerTwo) {
                    $('#current-result').text('You win!');
                    $('#other-result').text('They lose!');
                } else {
                    $('#current-result').text('You lose!');
                    $('#other-result').text('They win!');
                }
                // database.ref().child(gameKey).update({
                //     playerTwoWins: currentPlayerWins + 1
                // });
            }
        }

        $('.choice').on('click', function() {
            var choice = $(this).text();
            $('#current-choice').text('You chose ' + choice);
            if (playerOne === currentPlayer && playerOneChoice === undefined) {
                database.ref().child(gameKey).child(roundKey).update({
                    player1: choice
                });
            } else if (playerTwo === currentPlayer && playerTwoChoice === undefined) {
                database.ref().child(gameKey).child(roundKey).update({
                    player2: choice
                });
            }

            return false;
        });

        if (playerOne === currentPlayer) {
            if (playerTwoChoice === undefined) {
                $('#other-choice').text('Waiting on other player to choose');
            }

        } else if (playerTwo === currentPlayer) {
            if (playerOneChoice === undefined) {
                $('#other-choice').text('Waiting on other player to choose');
            }
        }
    });
}
    /*
        clear message log each new session
            -- variable in sessionStorage? --
        listen for player message
        display user name and message
     */
