// Create an array that lists out all of the options
var options = ['r', 'p', 's'];
// Set initial wins, losses, and ties
var wins = 0;
var losses = 0;
var ties = 0;

// Replace the character given as the guess to the associated word
function replaceWithWord(char) {
    if (char === 'p') {
        return 'paper';
    }

    if (char === 'r') {
        return 'rock';
    }

    if (char === 's') {
        return 'scissor';
    }
}

// Reset wins, losses, and ties. This is called when best of 5 game is over
function resetScore() {
    wins = 0;
    losses = 0;
    ties = 0;
}

// Captures Key Clicks
$(document).on('keyup', function(event) {
    // Determines which exact key was selected. Make it lowercase
    var userGuess = String.fromCharCode(event.keyCode).toLowerCase();
    // Create code to randomly choose one of the three options (Computer)
    var computerGuess = options[Math.floor(Math.random() * options.length)];
    // declare variables for later use
    var response;
    var overallWinner = '';
    var message;

    // return after alerting the user they did not enter a valid character
    if (!options.includes(userGuess)) {
        alert('Please choose r, p, or s');
        return;
    }

    // compare user guess and computer guess to determine who wins or tie
    if (userGuess === computerGuess) {
        ties += 1;
        response = 'YOU TIED';
    } else if ((userGuess === 'r' && computerGuess === 's') ||
              (userGuess === 's' && computerGuess === 'p') ||
              (userGuess === 'p' && computerGuess === 'r')) {
        wins += 1;
        response = 'YOU WIN';
    } else {
        losses += 1;
        response = 'YOU LOSE';
    }

    // print winner if exists
    if (wins === 3) {
        overallWinner = '<h1>YOU WIN THE GAME!</h1>';
    } else if (losses === 3) {
        overallWinner = '<h1>YOU LOSE THE GAME!</h1>';
    }

    $('#winner').html(overallWinner);

    // print stats
    message = '<p>Press r, p, or s to play</p>' +
              '<p>User guess: ' + replaceWithWord(userGuess) + '</p>' +
              '<p>Computer guess: ' + replaceWithWord(computerGuess) + '</p>' +
              '<p>' + response + '</p>' +
              '<p>Wins: ' + wins + '</p>' +
              '<p>Losses: ' + losses + '</p>' +
              '<p>Ties: ' + ties + '</p>';

    $('#game').html(message);

    // reset score when best of 5 completed
    // I'd prefer to put this in a function and call it in above conditional
    if ((wins === 3) || (losses === 3)) {
        resetScore();
    }
});
