const cassandra = require('cassandra-driver');
const hostDatabase = process.env.IP_HOST || 'localhost';
const portDatabase = process.env.PORT_DATABASE || '9042';

//user debug
// const client = new cassandra.Client({ contactPoints: ['172.24.16.22:9042'], localDataCenter: 'datacenter1', keyspace: 'polaris_core' });
const client = new cassandra.Client({ contactPoints: [`${hostDatabase}:${portDatabase}`], localDataCenter: 'datacenter1', keyspace: 'agenda' });
//user production
//const client = new cassandra.Client({ contactPoints: ['localhost'], localDataCenter: 'datacenter1', keyspace: 'polaris_core' });
//database conection
client.connect(function (err, result) {
    console.log(hostDatabase);
    console.log("cassandrac connet:" + "result=" + result + ",error=" + err);
});

module.exports = client;