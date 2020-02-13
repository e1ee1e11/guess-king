define(['require'], function () {

  'use strict';

  // Unique User Game Info

  class Game {

    constructor(maxLife) {
      this.reset(maxLife);
    }

    reset(maxLife) {
      this.guesser = '';
      this.phrase = '';
      this.lettersList = [];
      this.lifeCount = maxLife;
    }

    // Get a list of letters used as a string
    getLettersList() {
      return this.lettersList.join(' ');
    }

    // Check whether the guesser had already guessed the letter
    alreadyGuessed(letter) {
      return this.lettersList.indexOf(letter) >= 0;
    }

  }

  return Game;

});
