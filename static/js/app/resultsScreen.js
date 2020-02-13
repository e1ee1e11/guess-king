define(['require', 'app/constants'], function (require, c) {

  'use strict';

  class ResultsScreen {

    constructor(sketch, game) {
      this.sketch = sketch; // Reference to the p5 library
      this.game = game;     // Instantiated Game object
    }

    draw() {
      this.sketch.push();
      this.sketch.stroke(255);
      this.sketch.fill(255);
      this.sketch.textSize(25);
      this.sketch.textStyle(this.sketch.ITALIC);
      this.sketch.text('Results', c.screenWidth / 2, c.screenHeight / 3);

      this.sketch.textSize(38);
      this.sketch.textStyle(this.sketch.NORMAL);
      if (this.game.lifeCount != -2) {
        this.sketch.text('You Win!', c.screenWidth / 2, c.screenHeight / 2);
      } else {
        this.sketch.text('You Lose...', c.screenWidth / 2, c.screenHeight / 2);
      }

      this.sketch.pop();
    }

  }

  return ResultsScreen;

});
