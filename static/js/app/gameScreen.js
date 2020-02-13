define(['require', 'app/constants'], function (require, c) {

  'use strict';

  class GameScreen {

    constructor(sketch, player, game) {
      this.sketch = sketch; // Reference to the p5 library
      this.player = player; // Instantiated Player object
      this.game = game;     // Instantiated Game object
    }

    draw() {
      const adjustedSW = c.screenWidth - 20;

      this.sketch.push();

      this.drawPhraseLetters();

      // this.sketch.fill(255);
      // this.sketch.textSize(28);
      // this.sketch.text('Remaining Life: ' + this.game.lifeCount, (adjustedSW / 2) + 400, 45);

      // head bar
      this.sketch.textAlign(this.sketch.CENTER);
      this.sketch.textSize(28);
      this.sketch.fill(255);
      this.sketch.strokeWeight(1);
      this.sketch.textSize(28);
      this.sketch.text('Level: ' + this.player.level, 110 , 45);
      this.sketch.text('GUESS KING', adjustedSW / 2, 45);

      // enter letter field
      this.sketch.rectMode(this.sketch.CORNERS);
      this.sketch.noFill();
      this.sketch.strokeWeight(1);
      this.sketch.rect(30, 625, 770, 682);

      // letters in field
      this.sketch.textSize(28);
      if (this.player.letterChosen.length === 0 && this.player.isGuesser()) {
        this.sketch.fill(210);
        this.sketch.stroke(210);
        this.sketch.text('Enter letter to guess', 400, 665);
      }
      if (!this.player.isGuesser()) {
        this.sketch.fill(210);
        this.sketch.stroke(210);
        this.sketch.text('You are a guest', 400, 665);
      }

      // input letter
      this.sketch.fill(255);
      this.sketch.text(this.player.letterChosen, 400, 665);

      this.sketch.pop();
    }

    drawPhraseLetters() {
      this.sketch.push();
      this.sketch.textAlign(this.sketch.CENTER);
      this.sketch.textSize(48);
      this.sketch.stroke(255);
      this.sketch.fill(255);
      this.sketch.strokeWeight(1);
      this.sketch.text(this.game.phrase, c.screenWidth / 2, 280);
      this.sketch.textSize(48);
      this.sketch.text('Used: ' + this.game.getLettersList(), c.screenWidth / 2, 450);
      this.sketch.pop();
    }

  }

  return GameScreen;

});
