var express = require('express')
var bodyParser = require('body-parser')
var http = require('http')

var RoutesResource = require('./resource/RoutesResource')
var HomeResource = require('./resource/HomeResource')
const MatchmakingResource = require('./resource/MatchmakingResource')
const GamesResource = require('./resource/GamesResource')
const PlacesResource = require('./resource/PlacesResource')

var app = express() 
var httpServer = http.createServer(app)
var io = require('socket.io')(httpServer)

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

io.on('connection', function (socket) {
	socket.on('handshake', function (gameSessionId) {
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

	socket.on('gameEvent', function (exchange) {
		exchange = JSON.parse(exchange);
		console.log('Received exchange ' + exchange.id + " for game session " + exchange.gameSessionId)
		socket.in(exchange.gameSessionId).broadcast.emit(exchange.type, JSON.stringify(exchange))
	})
})

app.use('/', HomeResource)
app.use('/matchmaking', MatchmakingResource)
app.use('/games', GamesResource)
app.use('/places', PlacesResource)
app.use('/routes', RoutesResource)

console.log('Listening on port %d', process.env.PORT || 8000)
httpServer.listen(process.env.PORT || 8000)