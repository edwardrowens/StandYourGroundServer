var googleMapsClient = require('@google/maps').createClient({
    key: process.env.mapsKey
})

module.exports = {
    createRoute(startLat, endLat, startLng, endLng, waypoints, callback) {
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
            callback(err, response)
        })
    }
}