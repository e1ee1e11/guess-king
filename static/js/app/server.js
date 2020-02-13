define(['require', 'socketio'], function (require, io) {

  'use strict';

  class Server {

    constructor() {
      this.socket = io.connect('http://' + document.domain + ':' + location.port);
    }

    emit(eventName, info) { return this.socket.emit(eventName, info); }
    on(eventName, callback) { return this.socket.on(eventName, callback); }

    //
    // Make requests to the server
    //

    joinGame() {
      this.emit('connection', {
        'data': 'I\'m connected!'
      });
    }


    // Ask the server to become the guesser
    becomeGuesser(level) {
      this.emit('start_game', {
        'level': level
      });
    }

    // Send the guess to the server as the guesser
    guessLetter(letter) {
      this.emit('guess_letter', {
        'letter': letter
      });
    }

    // Request the server to give up the game (for everyone)
    giveupGame() {
      this.emit('giveup_game');
    }

    // Request the server to reset the game (for everyone)
    resetGame() {
      this.emit('reset_game');
    }


    //
    // Get data from the server
    //

    // Connected to the server
    onConnect(callback) { this.on('connect', callback); }

    // The screen of the game changed (ex. from TitleScreen to GameScreen)
    onGameStateChanged(callback) { this.on('change_gamestate', callback); }

    // Updates to the phrase currently discovered
    onDiscoveredPhraseUpdates(callback) { this.on('discovered_phrase', callback); }

    // Server asked the client to reset the game
    onResetGameRequest(callback) { this.on('reset_game', callback); }
  }

  return Server;

});
