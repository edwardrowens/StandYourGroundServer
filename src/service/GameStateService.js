const LatLngService = require('./LatLngService')
var UUID = require('uuid/v4')

// All players currently searching for matches
var players = {}

// A map of a player's ID to their opponent
var playersInGame = {}

// Games that are taking place. Maps a game session ID to 2 players
var games = {}

module.exports = {
    findMatch(player) {
        // Scrub players who have not sent a request in the past minute.
        NetworkingService.scrubPlayers(60000, players)

        players[player.id] = player

        for (id in players) {
            if (id != player.id) {
                var matchedPlayer = players[id]
                var match = LatLngService.withinDistance(player, matchedPlayer)
                if (match) {
                    // Remove the players from the list of players searching for a match
                    delete players[id]
                    if (players[player.id]) {
                        delete players[player.id]
                    }

                    // Set the game session ID on the player
                    var gameSessionId = UUID()
                    player.gameSessionId = gameSessionId
                    matchedPlayer.gameSessionId = gameSessionId

                    // Add players to in-game list
                    playersInGame[matchedPlayer.id] = player
                    playersInGame[player.id] = matchedPlayer

                    // Create a game session for the players
                    games[gameSessionId] = {}

                    games[gameSessionId].player1 = player
                    games[gameSessionId].player2 = matchedPlayer

                    console.log("Match found!")
                    console.log("Opponent is " + JSON.stringify(matchedPlayer))

                    return matchedPlayer
                }
            }
        }

        return null
    },

    getAllPlayers() {
        return players
    },

    removePlayer(id) {
        if (id in players) {
            delete players[id]
        }
    },

    getAllPlayersInGame() {
        return playersInGame
    },

    closeGame(gameSessionId) {
        console.log('Removing game ' + gameSessionId)
        if (gameSessionId in games) {
            var player1 = games[gameSessionId].player1
            var player2 = games[gameSessionId].player2
            delete games[gameSessionId]
            if (player1.id in playersInGame) {
                delete playersInGame[player1.id]
            }
            if (player2.id in playersInGame) {
                delete playersInGame[player2.id]
            }
            console.log('Game ' + gameSessionId + ' has been removed.')

            return true
        } else {
            return false
        }
    }
}