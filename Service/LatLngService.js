module.exports = {
    deg2rad: function (deg) {
        return deg * (Math.PI / 180)
    },

    withinDistance: function (player1, player2) {
        var R = 3959; // Radius of the earth in miles
        var dLat = deg2rad(player2.lat - player1.lat);  // deg2rad below
        var dLon = deg2rad(player2.lng - player1.lng);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(player1.lat)) * Math.cos(deg2rad(player2.lat)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in miles
        return (d <= player1.radius && d >= 1) && (d <= player2.radius && d >= 1);
    }
};