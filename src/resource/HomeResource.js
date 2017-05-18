var router = require('express').Router()
var HomeResourceService = require('../service/HomeResourceService')

router.route('/').get(HomeResourceService.getHome)

module.exports = router