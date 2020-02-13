import random

from hangman import Hangman
from player import Player

# Session ID of a guesser when none have been selected
PLAYER_NOT_CHOSEN = 'PLAYER_NOT_CHOSEN'


def _get_random_phrase(level):
    if level not in ('easy', 'hard'):
        level = 'easy'
    phrase = {
        'easy': [
            'LINUX',
            'UBUNTU',
            'PYTHON',
            'JAVASCRIPT',
            'WEBSOCKET',
        ],
        'hard': [
            'HAPPY NEW YEAR',
            'MERRY CHRISTMAS',
            'FINAL PROJECT',
            'GUESS KING',
            'NETWORK PROTOCOL',
        ],
    }
    return random.choice(phrase[level])


# These are the different screens that the users can be seeing
class GameState(object):
    TITLE_SCREEN = 'titlescreen'
    LOADING_SCREEN = 'loadingscreen'
    GAME_SCREEN = 'gamescreen'
    RESULTS_SCREEN = 'resultsscreen'


class Game(object):
    def __init__(self):
        # The session ID of the player who guesses the phrase
        self.guesser = PLAYER_NOT_CHOSEN
        # Hangman game instance
        self.hangman = None
        # Dictionary of [session_id:Player] currently connected
        self.players = {}
        # Screen that the users are on
        self.game_state = GameState.TITLE_SCREEN
        self.letters_guessed = []
        self.phrase_misses = 0

    # Reset the whole state
    def reset(self):
        self.reset_guesser()
        self.hangman = None
        # Don't reset players since people are still connected as spectators
        self.game_state = GameState.TITLE_SCREEN
        self.letters_guessed = []
        self.phrase_misses = 0

    # Keep track of a new player in the game
    def add_player(self, sid):
        assert sid is not None
        assert sid not in self.players
        self.players[sid] = Player(sid)

    # Remove a player from the game when they disconnect
    def remove_player(self, sid):
        assert sid is not None
        assert sid in self.players
        self.players.pop(sid, None)

    # Get the number of players currently connected
    def count_players(self):
        return len(self.players)

    # Return True if the current player is a guesser, False if not
    def is_guesser(self, sid):
        assert sid is not None
        return self.guesser == sid

    # Return True if someone was chosen as a guesser, False if not
    def is_guesser_set(self):
        return self.guesser != PLAYER_NOT_CHOSEN

    # Set the guesser back to PLAYER_NOT_CHOSEN, returns True if there was a
    # guesser previously, False if not
    def reset_guesser(self):
        # Reset roles in players dictionary
        if self.guesser != PLAYER_NOT_CHOSEN:
            assert self.guesser in self.players
            self.players[self.guesser].make_spectator()
            self.guesser = PLAYER_NOT_CHOSEN
            return True
        return False

    # Become the new guesser - assumes guesser was already reset
    def set_guesser(self, sid, name):
        self.guesser = sid
        if (sid == PLAYER_NOT_CHOSEN):
            return
        self.players[sid].make_guesser()
        self.players[sid].set_name(name)

    # Become a spectator on the server
    def set_spectator(self, sid):
        self.players[sid].make_spectator()

    # Get the name of the player
    def get_name(self, sid):
        if (sid == PLAYER_NOT_CHOSEN):
            return PLAYER_NOT_CHOSEN
        assert sid is not None
        assert sid in self.players
        return self.players[sid].get_name()

    # Set a new name for the player
    def set_name(self, sid, name):
        assert sid is not None
        assert sid in self.players
        return self.players[sid].set_name(name)

    # Reset the name of the player
    def reset_name(self, sid):
        assert sid is not None
        assert sid in self.players
        return self.players[sid].reset_name()

    # Set the hangman game
    def set_phrase(self, level, debug):
        if debug:
            phrase = 'HELLO'
        else:
            phrase = _get_random_phrase(level)
        self.hangman = Hangman(phrase)

    # Get the current type of the player as a string
    def get_player_type(self, sid):
        return self.players[sid].get_player_type()

    # Determines if guesser have been confirmed
    def players_ready(self):
        return self.is_guesser_set()

    # Returns the phrase in its currently discovered position
    def guess_letter(self, letter):
        assert self.hangman is not None
        self.hangman.guess(letter)
        self.letters_guessed.append(letter)
        return self.get_currently_discovered_phrase()

    # Returns the phrase with underlines for what hasn't been guessed yet
    def get_currently_discovered_phrase(self):
        if self.hangman is None:
            return None
        return self.hangman.getCurrentlyDiscoveredPhrase()

    # Checks if phrase has been successfully completed
    def is_completed(self):
        if self.hangman is None:
            return False
        return self.hangman.isCompleted()

    def hit_constrain(self, val):
        self.phrase_misses = min(7, max(0, val))
