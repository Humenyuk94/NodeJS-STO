var sql = require('mssql');
const config = {
    user :'UserTest123',
    password :'Frostmorn23@',
    server:'mssql-66932-0.cloudclusters.net',
    database:'STO',
    options:{
        encrypt: true, // for azure
        trustServerCertificate: true,
        instancename :'mssql-66932-0.cloudclusters.net'
    },
    Port : 18209
}

module.exports = config; 