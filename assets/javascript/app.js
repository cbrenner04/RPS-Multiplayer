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

// set game object -- to be populated laters
var game = {
    currentPlayer: '',
    gameKey: '',
    playerOne: '',
    playerTwo: '',
    currentPlayerWins: 0,
    otherPlayerWins: 0
};

$(document).on('ready', function() {
    // listen for message removal
    $('#remove-message').on('click', function() {
        $('#welcome').hide();
    });

    // if player already exists on this device set the username to currentPlayer
    game.currentPlayer = localStorage.getItem('username');
    // if player does not already exist on this device
    if (game.currentPlayer === null) {
        // show the entrance screen and hide the gameplay screen to force username input
        $('#entrance').show();
        $('#gameplay').hide();
        // when a username has been input and the submit button is selected
        $('#submit').on('click', function() {
            var input = $('#username').val().trim();
            if (input !== '') {
                // set the currentPlayer variable
                game.currentPlayer = input;
                // set the localStorage item -- so when the player returns this does not happen again
                localStorage.setItem('username', game.currentPlayer);
            }
        });
        return;
    }

    // set the welcome message
    $('#welcome-message').text('Welcome ' + game.currentPlayer + '!');
    // set the username in the game board
    $('#current-player').text(game.currentPlayer);
    // show the welcome message
    $('#welcome').show();
    // hide the entrance screen
    $('#entrance').hide();
    // show the gameplay screen
    $('#gameplay').show();
    // show waiting on player alert
    $('#waiting-on-player').show();
    // hide player 2 card
    $('#other-player-panel').hide();

    // get most recent game object in firebase
    database.ref().orderByChild('timestamp').limitToLast(1).on('value', function(snapshot) {
        game.gameKey = Object.keys(snapshot.val()).toString();
        game.playerOne = snapshot.val()[game.gameKey].player1;
        game.playerTwo = snapshot.val()[game.gameKey].player2;

        // if current player is player one
        if (game.currentPlayer === game.playerOne) {
            // set wins for current player
            game.currentPlayerWins = snapshot.val()[game.gameKey].playerOneWins;
            // set wins for other player
            game.otherPlayerWins = snapshot.val()[game.gameKey].playerTwoWins;
        // if current player is player two
        } else if (game.currentPlayer === game.playerTwo) {
            // set wins for current player
            game.currentPlayerWins = snapshot.val()[game.gameKey].playerTwoWins;
            // set wins for other player
            game.otherPlayerWins = snapshot.val()[game.gameKey].playerOneWins;
        }

        // check for current "open" game
        // if there is an open game
        if (game.playerTwo === undefined) {
            // check that current player is not already attached to this game
            if (game.playerOne !== game.currentPlayer) {
                // the current player is player 2
                database.ref().child(game.gameKey).update({
                    player2: game.currentPlayer,
                    playerTwoWins: 0
                });
            }
        // check that current player is not already attached to latest game
        } else if (game.playerOne !== game.currentPlayer && game.playerTwo !== game.currentPlayer) {
            // create new game
            // the current player is player 1
            database.ref().push({
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                player1: game.currentPlayer,
                playerOneWins: 0,
                messaging: ''
            }).push({
                // initialize first round
                timestamp: firebase.database.ServerValue.TIMESTAMP
            });
        } else {
            if (game.playerOne === game.currentPlayer) {
                // set player2 as the other player
                $('#other-player').text(game.playerTwo);
            } else if (game.playerTwo === game.currentPlayer) {
                // set player1 as the other player
                $('#other-player').text(game.playerOne);
            }
            // hide waiting alert
            $('#waiting-on-player').hide();
            // show other player card
            $('#other-player-panel').show();
            // display current players wins or 0 if undefined
            $('#current-wins').text(game.currentPlayerWins || 0);
            // display current players losses or 0 if undefined (which are the other players wins)
            $('#current-losses').text(game.otherPlayerWins || 0);
            // display other players wins
            $('#other-wins').text(game.otherPlayerWins);
            // display other players losses (which are the current players wins)
            $('#other-losses').text(game.currentPlayerWins);
            // play the game
            playGame();
            // allow messaging
            messaging();
        }
    });
});

function playGame() {
    // listen for request for new
    $('#new-game').on('click', function() {
        localStorage.removeItem('username');
        location.reload();
    });

    // set directions
    $('#current-choice').text('Please make a choice');

    // round object
    var round = {
        roundKey: '',
        playerOneChoice: '',
        playerTwoChoice: ''
    };

    // get the most recent "round" of the current "game"
    database.ref().child(game.gameKey).orderByChild('timestamp').limitToLast(1).once('value', function(snapshot) {
        round.roundKey = Object.keys(snapshot.val()).toString();
        round.playerOneChoice = snapshot.val()[round.roundKey].player1;
        round.playerTwoChoice = snapshot.val()[round.roundKey].player2;

        // if both players have made a choice on current round
        if (round.playerOneChoice !== undefined && round.playerTwoChoice !== undefined) {
            // show players choices
            if (game.playerOne === game.currentPlayer) {
                $('#other-choice').text('They played ' + round.playerTwoChoice);
            } else if (game.playerTwo === game.currentPlayer) {
                $('#other-choice').text('They played ' + round.playerOneChoice);
            }

            // if both players choices are the same
            if (round.playerOneChoice === round.playerTwoChoice) {
                $('#current-result').text('You tied');
                $('#other-result').text('They tied');
                // if player one wins
            } else if ((round.playerOneChoice === 'Rock' && round.playerTwoChoice === 'Scissors') ||
                (round.playerOneChoice === 'Scissors' && round.playerTwoChoice === 'Paper') ||
                (round.playerOneChoice === 'Paper' && round.playerTwoChoice === 'Rock')) {

                // if current player is player one (the winner)
                if (game.currentPlayer === game.playerOne) {
                    youWin();
                    // if current player is player two (the loser)
                } else {
                    theyWin();
                }
                // database.ref().child(game.gameKey).update({
                //     playerOneWins: game.currentPlayerWins + 1
                // });
                // database.ref().child(game.gameKey).push({
                //     timestamp: firebase.database.ServerValue.TIMESTAMP
                // });
            // if player two wins
            } else {
                // if current player is player two (the winner)
                if (game.currentPlayer === game.playerTwo) {
                    youWin();
                    // if current player is player one (the loser)
                } else {
                    theyWin();
                }
                // database.ref().child(game.gameKey).update({
                //     playerTwoWins: game.currentPlayerWins + 1
                // });
                // database.ref().child(game.gameKey).push({
                //     timestamp: firebase.database.ServerValue.TIMESTAMP
                // });
            }
        }

        // listen for a user to make a choice
        $('.choice').on('click', function() {
            // set the choice to choice
            var choice = $(this).text();
            // display what was chosen
            $('#current-choice').text('You chose ' + choice);
            // if the current player is player one and they have not yet chosen
            if (game.playerOne === game.currentPlayer && round.playerOneChoice === undefined) {
                // set the choice for player one in this round
                database.ref().child(game.gameKey).child(round.roundKey).update({
                    player1: choice
                });
                // if the current player is player two and they have not yet chosen
            } else if (game.playerTwo === game.currentPlayer && round.playerTwoChoice === undefined) {
                // set the choice for player two in this round
                database.ref().child(game.gameKey).child(round.roundKey).update({
                    player2: choice
                });
            }
            // don't refresh page
            return false;
        });

        // if current player is player one and if player two has not yet chosen
        // or if current player is player two and if player one has not yet chosen
        if ((game.playerOne === game.currentPlayer && round.playerTwoChoice === undefined) ||
           (game.playerTwo === game.currentPlayer && round.playerOneChoice === undefined)) {
            // display waiting message
            $('#other-choice').text('Waiting on other player to choose');
        }
    });
}

// display who won to the user, if the user won
function youWin() {
    $('#current-result').text('You win!');
    $('#other-result').text('They lose!');
}

// display who won to the user, if the user lost
function theyWin() {
    $('#current-result').text('You lose!');
    $('#other-result').text('They win!');
}

// controls messaging functionality
function messaging() {
    // on click of the messaging submit button
    $('#send-message').on('click', function() {
        // get the message input
        var message = $('#message').val().trim();
        // if the message input is not empty
        if (message !== '') {
            // push the message to firebase
            database.ref().child(game.gameKey).child('messaging').push({
                message: message,
                user: game.currentPlayer,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            });
            // clear input
            $('#message').val('');
        }
        // do not refresh page
        return false;
    });

    // listen for value in messaging portion of the game object on firebase -- limit to the last one
    database.ref().child(game.gameKey).child('messaging').on('child_added', function(snapshot) {
        // get the user who wrote the message
        var user = snapshot.val().user;
        // get the message
        var message = snapshot.val().message;
        // get the timestamp of the message
        var timestamp = moment(snapshot.val().timestamp).format('M/D/YY h:mm:s a');
        // show message to the user
        $('#messages').prepend('<p>' + timestamp + ' - ' + user + ': ' + message + '</p>');
    });
}
