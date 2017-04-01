module.exports = {
    deg2rad: function (deg) {
        return deg * (Math.PI / 180)
    },

    rad2deg: function(rad) {
        return rad * (180 / Math.PI)
    },

    withinDistance: function (player1, player2) {
        var d = this.distanceBetween(player1, player2)
        return (d <= player1.radius && d >= 1) && (d <= player2.radius && d >= 1);
    },

    distanceBetween: function (player1, player2) {
        var R = 3959; // Radius of the earth in miles
        var dLat = this.deg2rad(player2.lat - player1.lat)
        var dLon = this.deg2rad(player2.lng - player1.lng)
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(player1.lat)) * Math.cos(this.deg2rad(player2.lat)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c // Distance in miles
    },

    midpoint: function (location1, location2) {

        dLon = this.deg2rad(location2.lng - location1.lng)

        //convert to radians
        lat1 = this.deg2rad(location1.lat)
        lat2 = this.deg2rad(location2.lat)
        lon1 = this.deg2rad(location1.lng)

        Bx = Math.cos(lat2) * Math.cos(dLon)
        By = Math.cos(lat2) * Math.sin(dLon)
        lat3 = Math.atan2(Math.sin(lat1) + Math.sin(lat2), Math.sqrt((Math.cos(lat1) + Bx) * (Math.cos(lat1) + Bx) + By * By))
        lon3 = lon1 + Math.atan2(By, Math.cos(lat1) + Bx)

        return {lat: this.rad2deg(lat3), lng: this.rad2deg(lon3)}
    }
}