var GooglePlacesService = require('./GooglePlacesService')
var LatLngService = require('./LatLngService')

module.exports = {
    retrieveAllNeutrals: function(location1, location2, callback) {
        var location = LatLngService.midpoint(location1, location2) 
        var radius = LatLngService.distanceBetween(location1, location2) / 2
        pharmacyPayload = {
            location: location,
            radius: radius,
            type: 'pharmacy'
        }
        hospitalPayload = {
            location: location,
            radius: radius,
            type: 'hospital'
        }
        bankPayload = {
            location: location,
            radius: radius,
            type: 'bank'
        }
        GooglePlacesService.nearbySearch(pharmacyPayload, callback)
    }
}