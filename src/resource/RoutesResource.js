var router = require('express').Router()
var RoutesResourceService = require('../service/RoutesResourceService')

router.route('/').post(function (req, res) {
    res.setHeader('Content-Type', 'application/json')
    var startLat = req.body.startLat
    var endLat = req.body.endLat
    var startLng = req.body.startLng
    var endLng = req.body.endLng
    var waypoints = req.body.waypoints

    if (isNaN(startLat) || isNaN(endLat) || isNaN(startLng) || isNaN(endLng)) {
        console.log('Request failed. Invalid longitudes/latitudes')
        res.status(400).send('Invalid longitudes/latitudes')
        return
    }

    console.log(`Requesting routes with start position {Lat: ${startLat}, Lng: ${startLng}}, end position {Lat: ${endLat}, Lng: ${endLng}}, and way points ${waypoints}`)
    RoutesResourceService.createRoute(startLat, endLat, startLng, endLng, waypoints, function (err, response) {
        if (!err) {
            console.log('Routes retrieved.')
            res.json({
                routes: response.json.routes,
                status: response.json.status,
                error_message: response.json.error_message
            }).send()
        } else {
            console.log("Routing failed. %s", response)
            res.status(503).send("Routing failed")
        }
    })
})

module.exports = router