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

// global variables for use in multiple functions
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

        // if current player is player one
        if (currentPlayer === playerOne) {
            // set wins for current player
            currentPlayerWins = snapshot.val()[gameKey].playerOneWins;
            // set wins for other player
            otherPlayerWins = snapshot.val()[gameKey].playerTwoWins;
            // display stats
            displayWins();
            // if current player is player two
        } else if (currentPlayer === playerTwo) {
            // set wins for current player
            currentPlayerWins = snapshot.val()[gameKey].playerTwoWins;
            // set wins for other player
            otherPlayerWins = snapshot.val()[gameKey].playerOneWins;
            // display stats
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

// display wins and losses
function displayWins() {
    // display current players wins or 0 if undefined
    $('#current-wins').text(currentPlayerWins || 0);
    // display current players losses or 0 if undefined (which are the other players wins)
    $('#current-losses').text(otherPlayerWins || 0);
    // display other players wins
    $('#other-wins').text(otherPlayerWins);
    // display other players losses (which are the current players wins)
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
    // listen for request for new
    $('#new-game').on('click', function() {
        createNewGame();
    });

    var roundKey;
    var playerOneChoice;
    var playerTwoChoice;

    // get the most recent "round" of the current "game"
    database.ref().child(gameKey).orderByChild('timestamp').limitToLast(1).on('value', function(snapshot) {
        roundKey = Object.keys(snapshot.val()).toString();
        playerOneChoice = snapshot.val()[roundKey].player1;
        playerTwoChoice = snapshot.val()[roundKey].player2;

        // if both players have made a choice on current round
        if (playerOneChoice !== undefined && playerTwoChoice !== undefined) {
            // show players choices
            if (playerOne === currentPlayer) {
                $('#other-choice').text('They played ' + playerTwoChoice);
            } else if (playerTwo === currentPlayer) {
                $('#other-choice').text('They played ' + playerOneChoice);
            }

            // if both players choices are the same
            if (playerOneChoice === playerTwoChoice) {
                $('#current-result').text('You tied');
                $('#other-result').text('They tied');
                // if player one wins
            } else if ((playerOneChoice === 'Rock' && playerTwoChoice === 'Scissors') ||
                (playerOneChoice === 'Scissors' && playerTwoChoice === 'Paper') ||
                (playerOneChoice === 'Paper' && playerTwoChoice === 'Rock')) {

                // if current player is player one (the winner)
                if (currentPlayer === playerOne) {
                    $('#current-result').text('You win!');
                    $('#other-result').text('They lose!');
                    // if current player is player two (the loser)
                } else {
                    $('#current-result').text('You lose!');
                    $('#other-result').text('They win!');
                }
                // database.ref().child(gameKey).update({
                //     playerOneWins: currentPlayerWins + 1
                // });
                // database.ref().child(gameKey).push({
                //     timestamp: firebase.database.ServerValue.TIMESTAMP
                // });
                // return playGame();
                // if player two wins
            } else {
                // if current player is player two (the winner)
                if (currentPlayer === playerTwo) {
                    $('#current-result').text('You win!');
                    $('#other-result').text('They lose!');
                    // if current player is player one (the loser)
                } else {
                    $('#current-result').text('You lose!');
                    $('#other-result').text('They win!');
                }
                // database.ref().child(gameKey).update({
                //     playerTwoWins: currentPlayerWins + 1
                // });
                // database.ref().child(gameKey).push({
                //     timestamp: firebase.database.ServerValue.TIMESTAMP
                // });
                // return playGame();
            }
        }

        // listen for a user to make a choice
        $('.choice').on('click', function() {
            // set the choice to choice
            var choice = $(this).text();
            // display what was chosen
            $('#current-choice').text('You chose ' + choice);
            // if the current player is player one and they have not yet chosen
            if (playerOne === currentPlayer && playerOneChoice === undefined) {
                // set the choice for player one in this round
                database.ref().child(gameKey).child(roundKey).update({
                    player1: choice
                });
                // if the current player is player two and they have not yet chosen
            } else if (playerTwo === currentPlayer && playerTwoChoice === undefined) {
                // set the choice for player two in this round
                database.ref().child(gameKey).child(roundKey).update({
                    player2: choice
                });
            }
            // don't refresh page
            return false;
        });

        // current player is player  one
        if (playerOne === currentPlayer) {
            // if player two has not yet chosen
            if (playerTwoChoice === undefined) {
                // display waiting message
                $('#other-choice').text('Waiting on other player to choose');
            }
            // if current player is player two
        } else if (playerTwo === currentPlayer) {
            // if player one has not yet chosen
            if (playerOneChoice === undefined) {
                // display waiting message
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
