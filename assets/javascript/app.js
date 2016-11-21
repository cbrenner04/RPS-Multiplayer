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
    // show entrance screen
    // if current players are less than 2
    // get name of current player
    // show game board and messaging
    // if only one current player, show a message about waiting for another player
    // when both players have entered, allow game play
});
