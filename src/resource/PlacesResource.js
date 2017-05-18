const router = require('express').Router()
const GooglePlacesService = require('../service/GooglePlacesService')

router.route('/nearbysearch').post(function (req, res) {
    console.log("Processing request with payload: " + JSON.stringify(req.body))
    if (isNaN(req.body.radius) || !req.body.location || !req.body.type) {
        res.status(400).send("A radius, location, and type must be provided")
        return
    }

    var placesData = {
        radius: req.body.radius,
        location: req.body.location,
        type: req.body.type,
        key: process.env.mapsKey
    }

    GooglePlacesService.nearbySearch(placesData, function (googlePlacesResponse) {
        if (googlePlacesResponse.statusCode != 200) {
            console.log("Failed to retrieve places with status code" + googlePlacesResponse.statusCode)
            response.resume()
            res.status(503).send("The places request failed due to a problem in the server. Please try again later")
            return
        }

        var rawData = '';
        googlePlacesResponse.on('data', function (chunk) {
            rawData += chunk
        })

        googlePlacesResponse.on('end', function () {
            try {
                var parsedData = JSON.parse(rawData)
                res.status(200).send(parsedData)
            } catch (e) {
                console.log(e.message)
                googlePlacesResponse.resume()
                res.status(503).send("The places request failed due to a problem in the server. Please try again later")
                return
            }
        })

    }).on('error', function (e) {
        console.log('ERROR: ' + e.message)
        googlePlacesResponse.resume()
        res.status(503).send("The places request failed due to a problem in the server. Please try again later")
        return
    })
})

router.route('/photo/:photoReference').get(function (req, res) {
    console.log("Request for photo")
    var photoReference = req.params.photoReference
    var maxWidth = req.query.maxwidth
    var key = process.env.mapsKey

    if (isNaN(maxWidth) || !photoReference) {
        res.status(400).send("A max width and a photoReference must be provided")
        return
    }

    if (maxWidth > 1600 && maxWidth < 1) {
        res.status(400).send("The max width must be an integer between [1, 1600]")
        return
    }

    GooglePlacesService.getPhoto(photoReference, maxWidth, key, function (response) {
        res.setHeader("content-type", "image/jpeg");
        response.pipe(res)
    })
})

module.exports = router