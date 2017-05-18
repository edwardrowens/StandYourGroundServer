module.exports = {
    scrubPlayers: function (scrubTime, players) {
        for (id in players) {
            var inactive = Date.now() - players[id].timestamp;
            if (inactive > scrubTime) {
                console.log("removing player " + id + " for being inactive for " + inactive + "ms");
                delete players[id];
            }
        }
    },
    getPublicIp: function (req) {
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;
        if (!ip && 'socket' in req.connection) {
            ip = req.connection.socket.remoteAddress
        }

        return ip;
    }
}