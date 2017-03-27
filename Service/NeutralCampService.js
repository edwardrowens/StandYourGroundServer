var GooglePlacesService = require('./GooglePlacesService')
var LatLngService = require('./LatLngService')

module.exports = {
    retrieveAllNeutrals: function(location1, location2, callback) {
        payload = {
            location: LatLngService.midpoint(location1, location2),
            radius: LatLngService.distanceBetween(location1, location2) / 2,
            type: 'pharmacy'
        }
        GooglePlacesService.nearbySearch(payload, callback)
    }
}