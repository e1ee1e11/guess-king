define(['require', 'app/constants', 'app/button'], function (require, c, Button) {

  'use strict';

  class TitleScreen {

    constructor(sketch, server, player) {
      this.sketch = sketch; // Reference to the p5 library
      this.server = server; // Reference to the server socket connection
      this.player = player; // Instantiated Player object

      // Control buttons in title screen
      this.startButton = new Button('#start-game');
      this.resetButton = new Button('#reset');
      this.levelButton = new Button('#level');

      // Setup UI event handlers
      this.setupUIEventHandlers();

      this.myFont = sketch.loadFont('static/css/assets/MYoungHKS-Xbold.otf');
    }

    draw() {
      this.sketch.textFont(this.myFont)
      this.sketch.textAlign(this.sketch.CENTER);
      this.sketch.stroke(255);
      this.sketch.fill(255);

      // Title of titlescreen
      this.sketch.textSize(28);
      this.sketch.text('FINAL PROJECT:', c.screenWidth / 2, c.screenHeight / 4 - 20);
      this.sketch.textSize(88);
      this.sketch.text('GUESS KING', c.screenWidth/2, c.screenHeight/3);
    }

    // Hide or show the chooser buttons
    showChooserGuesserButtons(shouldShow) {
      if (shouldShow) {
        this.startButton.show();
        this.levelButton.show();
        this.resetButton.hide();
      } else {
        this.levelButton.hide();
        this.startButton.hide();
      }
    }

    // Toggle status of whether the guesser button is enabled
    enableSelectingGuesser(shouldEnable) {
      this.startButton.enable(shouldEnable);
      this.levelButton.enable(shouldEnable);
      this.resetButton.hide();
    }

    // Setup event handlers for UI (jQuery) events
    setupUIEventHandlers() {
      const self = this;

      this.startButton.click(function() {
        self.player.level = $('input[name=options]:checked' ,'#level').val()
        self.server.becomeGuesser(self.player.level);
        self.player.becomeGuesser();
        self.player.userConfirmed = true;
        console.log(self.player.level);
      });
    }
  }

  return TitleScreen;

});
