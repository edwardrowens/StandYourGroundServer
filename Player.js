function Player(id, lat, lng, radius, timestamp) {
	this.id = id;
	this.lat = lat;
	this.lng = lng;
	this.radius = radius;
	this.timestamp = timestamp;
};

module.exports = Player;