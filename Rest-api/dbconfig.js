var sql = require('mssql');
var config = {  
        server: 'mssql-66932-0.cloudclusters.net',  //update me
        authentication: {
            type: 'default',
            options: {
                userName: 'UserTest123', //update me
                password: 'Frostmorn23@'  //update me
            }
        },
        options: {
            // If you are on Microsoft Azure, you need encryption:
            encrypt: true,
            database: 'STO'  //update me
			 encrypt: true, // for azure
        trustServerCertificate: true,
        instancename :'mssql-66932-0.cloudclusters.net'
        }
module.exports = config; 