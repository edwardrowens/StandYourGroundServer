var https = require('https')

module.exports = {
    nearbySearch: function (payload, callback) {
        console.log("Processing request with payload: " + JSON.stringify(payload))
        var radius = payload.radius
        var location = payload.location
        var type = payload.type
        console.log(JSON.stringify(location))
        var key = process.env.mapsKey

        if (isNaN(radius) || !location) {
            callback(400, "A radius and a location must be provided")
            return
        }

        var options = {
            host: 'maps.googleapis.com',
            path: '/maps/api/place/nearbysearch/json?key=' + key
            + '&location=' + location.latitude + "," + location.longitude
            + '&radius=' + radius
            + '&type=' + type
        }

        https.get(options, function (response) {

            if (response.statusCode != 200) {
                console.log("Failed to retrieve places with status code" + response.statusCode)
                response.resume()
                callback(503, "The places request failed due to a problem in the server. Please try again later")
                return
            }

            var rawData = '';
            response.on('data', function (chunk) {
                rawData += chunk
            })

            response.on('end', function () {
                try {
                    var parsedData = JSON.parse(rawData)
                    callback(200, parsedData)
                } catch (e) {
                    console.log(e.message)
                    response.resume()
                    callback(503, "The places request failed due to a problem in the server. Please try again later")
                    return
                }
            })

        }).on('error', function (e) {
            console.log('ERROR: ' + e.message)
            response.resume()
            callback(503, "The places request failed due to a problem in the server. Please try again later")
            return
        })
    }
}