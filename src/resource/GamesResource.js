const router = require('express').Router()
const GameStateService = require('../service/GameStateService')

router.route('/').get(function (req, res) {
    console.log('Retrieving all players currently in a game')
    var playersInGame = GameStateService.getAllPlayersInGame()
    res.json({
        inGame: playersInGame
    }).status(200).send()
})

router.route('/:gameSessionId').delete(function (req, res) {
    if (!req.params.gameSessionId) {
        res.status(404).send()
    }
    if (GameStateService.closeGame(req.params.gameSessionId)) {
        res.status(200).send()
    } else {
        res.status(404).send()
    }
})

module.exports = router