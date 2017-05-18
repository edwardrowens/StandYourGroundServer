const router = require('express').Router()

const Player = require('../model/Player')
const GameStateService = require('../service/GameStateService')

router.route('/').post(function (req, res) {

    res.setHeader('Content-Type', 'application/json')

    // Validation
    if (req.body.radius < 1 || !req.body.radius) {
        res.status(400).send("The radius must be greater than or equal to 1 mile")
        return
    }
    if (!req.body.id) {
        res.status(400).send("A valid ID is required")
        return
    }
    if (isNaN(req.body.lat) || isNaN(req.body.lng)) {
        res.status(400).send("The latitude and longitude must be valid numbers")
        return
    }

    // Find a match for the player
    var playerMatch = GameStateService.findMatch(new Player(req.body.id, req.body.lat, req.body.lng, req.body.radius, Date.now()))

    if (playerMatch) {
        res.json({
            lat: playerMatch.lat,
            lng: playerMatch.lng,
            gameSessionId: playerMatch.gameSessionId
        }).status(200).send()
    } else {
        // No matching player was found
        res.sendStatus(204)
    }
})

router.route('/matchmaking/players/').get(function (req, res) {
    console.log('Retrieving all players searching for a match')
    var players = GameStateService.getAllPlayers()
    res.json({
        players: players
    }).status(200).send()
})

router.route('/players/:playerId').delete(function (req, res) {
    console.log("Deleting " + req.params.playerId + " from list of players to be matched")
    if (!req.params.playerId) {
        res.status(404).send()
    } else {
        GameStateService.removePlayer(req.params.playerId)
        res.status(200).send()
    }
})

module.exports = router