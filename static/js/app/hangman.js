// Hack to enable the reset() function from the console
let server;

define(['require', 'p5', 'app/server', 'app/game', 'app/player', 'app/titleScreen', 'app/loadingScreen', 'app/gameScreen', 'app/resultsScreen', 'app/button'], function (require, p5, Server, Game, Player, TitleScreen, LoadingScreen, GameScreen, ResultsScreen, Button) {

  'use strict';

  const screenWidth = 1080;
  const screenHeight = 700;
  const maxLife = 7;
  const player = new Player();
  const game = new Game(maxLife);
  server = new Server();

  const GameStates = { title: 'titlescreen', loading: 'loadingscreen', game: 'gamescreen', results: 'resultsscreen' };
  let gameState = GameStates.title;

  const resetButton = new Button('#reset');
  const submitButton = new Button('#submit');
  const giveupButton = new Button('#giveup');

  // We need to load P5 - the global functions are scoped within 'sketch'
  const loadedP5 = new p5(function (sketch) {
    const titleScreen = new TitleScreen(sketch, server, player);
    const loadingScreen = new LoadingScreen(sketch, player);
    const gameScreen = new GameScreen(sketch, player, game);
    const resultsScreen = new ResultsScreen(sketch, game);

    sketch.setup = () => {
      const canvas = sketch.createCanvas(screenWidth,screenHeight);

      // Put the canvas inside the #sketch-holder div
      canvas.parent('sketch-holder');

      titleScreen.showChooserGuesserButtons(true);
      resetButton.hide();
      submitButton.hide();
      giveupButton.hide();
    };

    //
    // Overall Control Flow
    //

    sketch.draw = () => {
      // Repeatedly updates the screen
      sketch.clear();

      sketch.posReference();

      if (gameState === GameStates.title) {
        titleScreen.draw();
      } else if (gameState === GameStates.loading) {
        loadingScreen.draw();
      } else if (gameState === GameStates.game) {
        gameScreen.draw();
      } else if (gameState === GameStates.results) {
        resultsScreen.draw();
      } else {
        console.error('Trying to display unknown screen: ' + gameState);
      }
    };

    // Development tool used for tracking position
    sketch.posReference = () => {
      sketch.push();
      sketch.stroke(255, 80);
      sketch.fill(255, 180);
      sketch.strokeWeight(1);
      sketch.textSize(12);
      sketch.line(sketch.mouseX, 0, sketch.mouseX, screenHeight);
      sketch.line(0, sketch.mouseY, screenWidth, sketch.mouseY);
      sketch.text(sketch.mouseX + '; ' + sketch.mouseY, 50, screenHeight - 30);
      sketch.pop();
    };

    //
    // Keyboard Input
    //

    sketch.keyPressed = () => {
      if (gameState === GameStates.game && player.isGuesser()) {
        player.letterChosen = textModify(player.letterChosen, 1).toUpperCase();

        // Don't allow spaces or already guessed letters
        if (player.letterChosen === ' ' || game.alreadyGuessed(player.letterChosen)) {
          player.letterChosen = '';
        }
      }
    };

    // Returns whether the character is an alphabet character or a space
    function isAlphaOrSpace(c) {
      console.assert(c.length === 1, 'Attempted to check if a non-character string was alphabet or space', c);

      if (c === ' ') { return true; }

      // Only works for Latin characters, but check if alphabet
      return c.toUpperCase() != c.toLowerCase();
    }

    // General purpose text input function used exclusively in keyPressed()
    function textModify(text, maxStringLength) {
      if (sketch.keyCode === sketch.BACKSPACE && text.length > 0) {
        text = text.substring(0, text.length - 1);
      } else if (sketch.keyCode != sketch.BACKSPACE && text.length < maxStringLength && isAlphaOrSpace(sketch.key)) {
        text += sketch.key.toUpperCase();
      }
      return text;
    }


    //
    // Jquery Events
    //

    resetButton.click(function() {
      server.resetGame();
      resetButton.hide();
    });

    // Submit button for submitting a guessing letter
    submitButton.click(function() {
      if (gameState === GameStates.game && !game.alreadyGuessed(player.letterChosen)) {
        if (player.letterChosen.length === 1) {
          server.guessLetter(player.letterChosen);
          player.letterChosen = '';
        } else {
          alert('Please enter a letter.');
        }
      }
    });

    // Giveup button
    giveupButton.click(function() {
      server.giveupGame();
    });

    // Changes the game's state for this particular client
    function setGameState(state) {
      console.assert(
        gameState === GameStates.title ||
        gameState === GameStates.loading ||
        gameState === GameStates.game ||
        gameState === GameStates.results,
        'Unexpected game state: ' + gameState);
      gameState = state;
    }

    //
    // Socket events
    //

    // Called once upon entering site
    server.onConnect(function() {
      server.joinGame();
    });

    // Changes the game's state for this particular client
    server.onGameStateChanged(function(state) {
      console.assert(state, 'Cannot have a null game state');

      setGameState(state['gamestate']);
      if (gameState === GameStates.title) {
        titleScreen.showChooserGuesserButtons(true);
        resetButton.hide();
        submitButton.hide();
        giveupButton.hide();
      } else if (gameState === GameStates.loading) {
        titleScreen.showChooserGuesserButtons(false);
        resetButton.hide();
        submitButton.hide();
        giveupButton.hide();
      } else if (gameState === GameStates.game) {
        titleScreen.showChooserGuesserButtons(false);
        resetButton.hide();
        submitButton.show();
        submitButton.enable(player.isGuesser());
        giveupButton.show();
        giveupButton.enable(player.isGuesser());
      } else if (gameState === GameStates.results) {
        resetButton.show();
        submitButton.hide();
        giveupButton.hide();
        game.lifeCount = -2;
      } else {
        console.error('Unexpected game state: ' + gameState);
      }
    });

    // Returns the phrase discovered so far, whether the game is completed, and letter just attempted
    server.onDiscoveredPhraseUpdates(function(phrase) {
      console.assert(phrase, 'Cannot have null information on discovered phrase updates');

      game.phrase = phrase['discovered_phrase'];
      if (phrase['phrase_completed']) {
        setGameState(GameStates.results);
        submitButton.hide();
        resetButton.show()
        giveupButton.hide();
      }
      game.lettersList = phrase['letters_used'];
      game.lifeCount = maxLife - phrase['misses'];
      if (game.lifeCount <= 0) {
        game.lifeCount = 0
      }
    });

    // Called when resetting the game for debugging purposes
    server.onResetGameRequest(function() {
      console.log('Resetting game');
      player.reset();
      game.reset(maxLife);
      gameState = GameStates.title;
      titleScreen.showChooserGuesserButtons(true);
      resetButton.show();
      submitButton.hide();
      giveupButton.hide();
    });

  });

});

// Ask the server to kick everyone back to the title screen and reset state
function reset() {
  if (server) {
    server.resetGame();
  } else {
    console.err('Server not initialized yet');
  }
}
