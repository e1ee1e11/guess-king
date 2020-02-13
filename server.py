import logging
import sys

from flask import Flask, request, render_template
from flask_socketio import SocketIO, emit

from game import Game, GameState

app = Flask(__name__)
socketio = SocketIO(app)
game = Game()

DEBUG = True if '--debug' in sys.argv else False


#
# Messages sent from server to client
#

# Change the users' screen
def change_game_state(game_state=None, broadcast=False):
    if game_state is not None:
        game.game_state = game_state
    emit(
        'change_gamestate',
        {'gamestate': game.game_state},
        broadcast=broadcast
    )


# Update the hangman game's game state after a guess
def discovered_phrase(broadcast=False):
    emit(
        'discovered_phrase',
        {
            'discovered_phrase': game.get_currently_discovered_phrase(),
            'phrase_completed': game.is_completed(),
            'letters_used': game.letters_guessed,
            'misses': game.phrase_misses
        },
        broadcast=broadcast
    )

#
# Socket events
#


@socketio.on('connection')
def handle_client_connection(json):
    logging.debug('Received connection from client (' +
                  request.sid + ') with data: ' + json['data'])

    # Add the player to the players list
    assert request.sid is not None
    game.add_player(request.sid)
    # Set the player as spectator by default
    game.set_spectator(request.sid)

    # Send the state information required for a connecting client
    # to first render the page
    change_game_state()
    discovered_phrase()


@socketio.on('disconnect')
def handle_client_disconnection():
    logging.debug('Received disconnection from client (' + request.sid + ')')

    # Delete the player from the players list
    assert request.sid is not None
    game.remove_player(request.sid)

    # Tell the other clients that the player left
    change_game_state(broadcast=True)


@socketio.on('start_game')
def start_game(data):
    # Set the new guesser
    assert request.sid is not None
    game.set_guesser(request.sid, 'Guesser')

    logging.info('The new guesser is: ' + game.get_name(request.sid)
                 + ' (' + request.sid + ')')

    if game.players_ready():
        change_game_state(GameState.LOADING_SCREEN, broadcast=True)
        logging.info('The game is now in its loading phase')

        game.set_phrase(data.get('level', 'easy'), DEBUG)

        change_game_state(GameState.GAME_SCREEN, broadcast=True)
        discovered_phrase(broadcast=True)

        logging.info('Secret phrase has been chosen')


@socketio.on('guess_letter')
def current_phrase(phrase):
    assert phrase is not None
    assert 'letter' in phrase

    if game.hangman.inPhrase(phrase['letter']) is False:
        game.phrase_misses += 1
    game.hit_constrain(game.phrase_misses)
    game.guess_letter(phrase['letter'])
    discovered_phrase(broadcast=True)

    logging.info('A letter has been guessed: ' + phrase['letter'])


@socketio.on('giveup_game')
def giveup(json):
    change_game_state(GameState.RESULTS_SCREEN, broadcast=True)


@socketio.on('reset_game')
def reset(json):
    game.reset()
    emit('reset_game', None, broadcast=True)
    change_game_state(GameState.TITLE_SCREEN, broadcast=True)


@app.route('/')
def display_page():
    return render_template('index.html', debug=DEBUG)


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', debug=DEBUG)
