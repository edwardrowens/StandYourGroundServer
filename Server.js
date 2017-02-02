var express = require('express');
var bodyParser = require('body-parser');
var googleMapsClient = require('@google/maps').createClient({
	key: 'AIzaSyCWGCg6zrA7JSonQLrysZXGEKwa9AsEayY'
});

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('Hello world');
});

app.post('/routes', function(req, res) {
	console.log(req.body);
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
			res.setHeader('Content-Type', 'application/json');
			res.json({
				routes : response.json.routes
			});
			res.send();
		} else {
			console.log("Routing failed. %s", response);
			res.status = status;
			res.send("Routing failed");
		}
	});
});

console.log('Listening on port %d', process.env.PORT || 8000);
var server = app.listen(process.env.PORT || 8000);