var express = require('express')
var bodyParser = require('body-parser')
var googleMapsClient = require('@google/maps').createClient({
	key: 'AIzaSyCfZo9GE10ZJBbY5x5WR1n6vc_DAjQjxI0'
})
var UUID = require('uuid/v4')
var Player = require('./Player')
var LatLngService = require('./Service/LatLngService')
var NetworkingService = require('./Service/NetworkingService')

var app = express()
var http = require('http').createServer(app)
var io = require('socket.io')(http)

io.on('connection', function (socket) {
	socket.on('handshake', function(gameSessionId) {
		if (gameSessionId) {
			var rooms = io.sockets.adapter.rooms[gameSessionId]
			if (!rooms) {
				console.log("Created room " + gameSessionId);
				socket.join(gameSessionId);
			} else if (rooms.length == 1) {
				console.log("Joining room " + gameSessionId + " and starting game");
				socket.join(gameSessionId);
				io.sockets.in(gameSessionId).emit('StartGame');
			} else {
				socket.emit("error", "Invalid gameSessionId");
			}
		}
	})

	socket.on('gameEvent', function(exchange) {
		exchange = JSON.parse(exchange);
		console.log('Received exchange ' + exchange.id + " for game session " + exchange.gameSessionId)
		io.sockets.in(exchange.gameSessionId).emit(exchange.type, JSON.stringify(exchange))
	})
})

var players = {}
var playersInGame = {}
var games = {}

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get('/', function (req, res) {
	res.send('Hello world')
})

app.post('/routes', function (req, res) {
	res.setHeader('Content-Type', 'application/json')
	var startLat = req.body.startLat
	var endLat = req.body.endLat
	var startLng = req.body.startLng
	var endLng = req.body.endLng
	var waypoints = req.body.waypoints

	console.log(`Requesting routes with start position {Lat: ${startLat}, Lng: ${startLng}}, end position {Lat: ${endLat}, Lng: ${endLng}}, and way points ${waypoints}`)

	if (isNaN(startLat) || isNaN(endLat) || isNaN(startLng) || isNaN(endLng)) {
		console.log('Request failed. Invalid longitudes/latitudes')
		res.status(400).send('Invalid longitudes/latitudes')
		return
	}
	var start = {
		lat: startLat,
		lng: startLng
	}

	var end = {
		lat: endLat,
		lng: endLng
	}

	var query = {
		origin: start,
		destination: end,
		mode: 'walking',
		waypoints: waypoints
	}

	googleMapsClient.directions(query, function (err, response) {
		if (!err) {
			console.log('Routes retrieved.')
			res.setHeader('Content-Type', 'application/json')
			res.json({
				routes: response.json.routes,
				status: response.json.status,
				error_message: response.json.error_message
			})
			res.send()
		} else {
			console.log("Routing failed. %s", response)
			res.status = status
			res.send("Routing failed")
		}
	})
})

app.post('/matchmaking', function (req, res) {
	console.log(req.body.id + " is searching for match")
	res.setHeader('Content-Type', 'application/json')
	if (req.body.radius < 1) {
		res.status = 400
		res.send("The radius must be greater than or equal to 1 mile")
	}

	NetworkingService.scrubPlayers(60000, players) // Scrub players who have not sent a request in the past minute.

	var p = new Player(req.body.id, req.body.lat, req.body.lng, req.body.radius, Date.now())
	if (p.id in playersInGame) {
		console.log(p.id + " is already in a game with " + playersInGame[p.id].id)
		res.json({
			lat: playersInGame[p.id].lat,
			lng: playersInGame[p.id].lng,
			gameSessionId: playersInGame[p.id].gameSessionId
		})
		res.status = 200
		res.send()
		return
	}

	players[p.id] = p

	for (id in players) {
		if (id != p.id) {
			var match = LatLngService.withinDistance(p, players[id])
			if (match) {
				var gameSessionId = UUID()
				p.gameSessionId = gameSessionId
				players[id].gameSessionId = gameSessionId

				playersInGame[id] = p
				playersInGame[p.id] = players[id]

				games[gameSessionId] = {}

				games[gameSessionId].player1 = p
				games[gameSessionId].player2 = players[id]

				delete players[id]
				if (players[p.id]) {
					delete players[p.id]
				}
				console.log("Match found!")
				console.log("Opponent is " + JSON.stringify(playersInGame[p.id]))
				res.json({
					lat: playersInGame[p.id].lat,
					lng: playersInGame[p.id].lng,
					gameSessionId: gameSessionId
				})
				res.status = 200
				res.send()
				return
			}
		}
	}
	console.log("No match found")
	res.sendStatus(204)
})

app.get('/ip', function (req, res) {
	console.log('X-forward: ' + req.headers['x-forwarded-for'])
	console.log('Connection remote address: ' + req.connection.remoteAddress)
	console.log('Socket remote address: ' + req.socket.remoteAddress)
	if ('socket' in req.connection) {
		console.log('Socket connection remote address: ' + req.connection.socket.remoteAddress)
	}
	res.json({ ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress })
	res.status(200)
	res.send()
})

app.delete('/matchmaking/players/:playerId', function (req, res) {
	console.log("Deleting " + req.params.playerId + " from list of players to be matched")
	if (req.params.playerId in players) {
		delete players[req.params.playerId]
	}
	res.sendStatus(200)
})

app.get('/matchmaking/players/', function (req, res) {
	console.log('Retrieving all players searching for a match')
	res.json({
		players: players
	})
	res.status(200)
	res.send()
})

app.get('/games', function (req, res) {
	console.log('Retrieving all players currently in a game')
	res.json({
		inGame: playersInGame
	})
	res.status(200)
	res.send()
})

app.delete('/games/:gameSessionId', function (req, res) {
	console.log('Removing game ' + req.params.gameSessionId)
	if (req.params.gameSessionId in games) {
		var player1 = games[req.params.gameSessionId].player1
		var player2 = games[req.params.gameSessionId].player2
		delete games[req.params.gameSessionId]
		if (player1.id in playersInGame) {
			delete playersInGame[player1.id]
		}
		if (player2.id in playersInGame) {
			delete playersInGame[player2.id]
		}
		console.log('Game ' + req.params.gameSessionId + ' has been removed.')
		res.sendStatus(200)
	} else {
		res.status(404)
		res.send("Game session not found")
	}
})

console.log('Listening on port %d', process.env.PORT || 8000)
http.listen(process.env.PORT || 8000)