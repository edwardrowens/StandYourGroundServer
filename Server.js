var express = require('express');
var bodyParser = require('body-parser');
var googleMapsClient = require('@google/maps').createClient({
	key: process.env.mapsKey
});

var app = express();

function Player(lat, lng, radius) {
	this.lat = lat;
	this.lng = lng;
	this.radius = radius;
};

var players = [];

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function withinDistance(player1, player2) {
  var R = 3959; // Radius of the earth in miles
  var dLat = deg2rad(player2.lat-player1.lat);  // deg2rad below
  var dLon = deg2rad(player2.lng-player1.lng); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(player1.lat)) * Math.cos(deg2rad(player2.lat)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in miles
  
  return (d <= player1.radius) && (d <= player2.radius);
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('Hello world');
});

app.post('/routes', function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	var startLat = req.body.startLat;
	var endLat = req.body.endLat;
	var startLng = req.body.startLng;
	var endLng = req.body.endLng;
	var waypoints = req.body.waypoints;
	
	console.log(`Requesting routes with start position {Lat: ${startLat}, Lng: ${startLng}}, end position {Lat: ${endLat}, Lng: ${endLng}}, and way points ${waypoints}`);
	
	if (isNaN(startLat) || isNaN(endLat) || isNaN(startLng) || isNaN(endLng)) {
		console.log('Request failed. Invalid longitudes/latitudes');
		res.status(400).send('Invalid longitudes/latitudes');
		return;
	}
	var start = {
		lat: startLat,
		lng: startLng
	};
	
	var end = {
		lat: endLat, 
		lng: endLng
	};
	
	var query = {
		origin : start,
		destination : end,
		mode : 'walking',
		waypoints : waypoints
	}
	
	googleMapsClient.directions(query, function(err, response) {
		if (!err) {
			console.log('Routes retrieved.');
			console.log(response);
			res.setHeader('Content-Type', 'application/json');
			res.json({
				routes : response.json.routes,
				status : response.json.status,
				error_message : response.json.error_message
			});
			res.send();
		} else {
			console.log("Routing failed. %s", response);
			res.status = status;
			res.send("Routing failed");
		}
	});
});

app.post('/findMatch', function(req, res) {
	console.log("Searching for match!")
	res.setHeader('Content-Type', 'application/json');
	var p = new Player(req.body.lat, req.body.lng, req.body.radius);
	
	for (i = 0; i < players.length; ++i) {
		var match = withinDistance(p, players[i]);
		if (match) {
			console.log(players)
			players = players.splice(i, 1);
			console.log("Match found!")
			res.json({
				player: players[i]
			});
			res.status = 200;
			res.send();
			return;
		}
	}
	players.push(p);
	console.log("No match found")
	res.sendStatus(204);
});

console.log('Listening on port %d', process.env.PORT || 8000);
var server = app.listen(process.env.PORT || 8000);