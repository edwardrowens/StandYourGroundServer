var https = require('follow-redirects').https

module.exports = {
    nearbySearch: function (placesData, callback, onError) {
        var options = {
            host: 'maps.googleapis.com',
            path: '/maps/api/place/nearbysearch/json?key=' + placesData.key
            + '&location=' + placesData.location.latitude + "," + placesData.location.longitude
            + '&radius=' + placesData.radius
            + '&type=' + placesData.type
        }

        https.get(options, function (response) {
            callback(response)
        }).on('error', onError)
    },

    getPhoto(photoReference, maxWidth, key, callback) {
        console.log("Request for photo")
        var options = {
            host: 'maps.googleapis.com',
            path: '/maps/api/place/photo?'
            + 'maxwidth=' + maxWidth
            + '&photoreference=' + photoReference
            + '&key=' + key
        }

        var photoRequest = https.request(options, function (response) {
            callback(response)
        })
        photoRequest.end()
    }
}