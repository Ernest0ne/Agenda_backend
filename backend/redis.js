var redis = require("redis");
var client = redis.createClient({host: '10.39.151.125'});

client.on('error', function (err) {
    console.log('could not establish a connection with redis. ' + err);
});

client.on('connect', function (err) {
    console.log('connected to redis successfully');
});

module.exports = client;