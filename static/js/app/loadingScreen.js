define(['require', 'app/constants'], function (require, c) {

  'use strict';

  class LoadingScreen {

    constructor(sketch, player) {
      this.sketch = sketch; // Reference to the p5 library
      this.player = player; // Instantiated Player object
    }

    draw() {
      this.sketch.textAlign(this.sketch.CENTER);
      this.sketch.stroke(255);
      this.sketch.fill(255);

      this.sketch.textSize(20);
      this.sketch.text('Game in Session', c.screenWidth / 2, 50);

      if (this.player.isGuesser() || this.player.isSpectator()) {
        this.sketch.push();
        this.sketch.textStyle(this.sketch.ITALIC);
        this.sketch.textSize(32);
        this.sketch.text('Waiting ...', c.screenWidth / 2, c.screenHeight / 2);
        this.sketch.pop();

      }
    }

  }

  return LoadingScreen;

});
