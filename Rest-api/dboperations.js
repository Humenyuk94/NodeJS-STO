var config = require('./dbconfig');
const sql = require('mssql/msnodesqlv8');
var Auth = require('./auth')
var currentUser = null;
var currentId = 0;

async function getAuths() {
    try {
        let pool = await sql.connect(config);
        let auths = await pool.request().query("SELECT * from Auth");
		/*var auth = new Auth({
			AuthId: auths[0].authId,
			Mail: auths[0].Mail,
			Pass: auths[0].Pass
		})
		console.log(auth)*/
		//console.log(auths.recordset[0].AuthId)
        return auths.recordset;
    }
    catch (error) {
        console.log(error);
    }
}

async function getRecords() {
    try {
        let pool = await sql.connect(config);
        let records = await pool.request().query("Select r.RecordId, s.Name, r.CreateDate, c.Name+' '+c.Surname+' '+c.Patronymic as 'Customer', r.PaymentType, w.Surname+' '+w.Name as 'Worker', r.RecordState from Record r join Serv s on s.ServId = r.ServId join Customer c on c.CustomerId = r.CustomerId join Worker w on w.WorkerId = r.WorkerId");
        console.log(records.recordset)
		return records.recordset;
    }
    catch (error) {
        console.log(error);
    }
}

async function getURecords() {
    try {
        let pool = await sql.connect(config);
		//console.log("curr "+currentId);
		let customer = await pool.request()
			.input('authId', sql.Int, currentId)
			.query("SELECT * from Customer where AuthId = @authId");
		let customerId = customer.recordset[0].CustomerId;
        let records = await pool.request()
		.input('customerId', sql.Int, customerId)
		.query("Select r.RecordId, s.Name, r.CreateDate, c.Name+' '+c.Surname+' '+c.Patronymic as 'Customer', r.PaymentType, w.Surname+' '+w.Name as 'Worker', r.RecordState from Record r join Serv s on s.ServId = r.ServId join Customer c on c.CustomerId = r.CustomerId join Worker w on w.WorkerId = r.WorkerId where c.CustomerId = @customerId");
		//console.log(records)
        return records.recordset;
    }
    catch (error) {
        console.log(error);
    }
}

async function getServ() {
    try {
        let pool = await sql.connect(config);
        let serv = await pool.request().query("SELECT * from Serv");
        return serv.recordset;
    }
    catch (error) {
        console.log(error);
    }
}

async function getAuth(authId) {
    try {
        let pool = await sql.connect(config);
        let auth = await pool.request()
            .input('input_parameter', sql.Int, authId)
            .query("SELECT * from Auth where Id = @input_parameter");
        return auth.recordsets;

    }
    catch (error) {
        console.log(error);
    }
}

async function addRecord(auth, auths) {
    try {
        let pool = await sql.connect(config);
			var today = new Date();
			var Serv = await pool.request().query("SELECT * from Serv");
			var date = today.getFullYear()+'-'+today.getMonth()+'-'+today.getDate();
			var ServId = auth.ServId;
			//console.log(ServId)
			var PaymentType = auth.PaymentType;
			var CustomerId;
			//console.log(auths);
			for(i=0;i<auths.length;i++){
				
				if(auths[i].Mail==currentUser){
					CustomerId = auths[i].AuthId;
					//console.log(auths[i].AuthId);
					break;
				}
			}
			
			
		var insertAuth = await pool.request()
            .input('ServId', sql.Int, ServId)
            .input('CreateDate', sql.Date, date)
			.input('CustomerId', sql.Int, CustomerId)
			.input('PaymentType', sql.NVarChar, PaymentType)
			.query("Insert into Record(ServId, CreateDate, CustomerId, PaymentType, WorkerId, RecordState) values (@ServId, @CreateDate, @CustomerId, @PaymentType, 1, 'Рассматривается')");
			return insertAuth.recordset;
        
    }
    catch (err) {
        console.log(err);
    }

}


async function addAuth(auth, auths) {
    try {
        let pool = await sql.connect(config);
        
			var Mail = auth.Mail;
			var Pass = auth.Pass;
			var isInDB = false;
			for(i=0;i<auths.length;i++){
				if(auths[i].Mail==auth.Mail){
					isInDB = true;
					break;
				}
			}
		var insertAuth;	
		if(!isInDB){
		insertAuth = await pool.request()
            //.input('AuthId', sql.Int, auth.AuthId)
            .input('Mail', sql.NVarChar, auth.Mail)
            .input('Pass', sql.NVarChar, auth.Pass)
            //.execute('InsertAuths');
			//
			
				.query("Insert into Auth (Mail, Pass) values (@Mail,@Pass)");
			//}
			return insertAuth.recordset;
		} else {
			return insertAuth.recordset;
		}
        
    }
    catch (err) {
        console.log(err);
    }

}

async function Authent(auth, auths) {
    try {
		let pool = await sql.connect(config);
		
			var Mail = auth.Mail;
			var Pass = auth.Pass;
			var canLogin = false;
			var isWorker = false;
			for(i=0;i<auths.length;i++){
				if(auths[i].Mail==auth.Mail && auths[i].Pass == auth.Pass){
					let customer = await pool.request()
					.input('authId', sql.Int, auths[i].AuthId)
					.query("SELECT * from Customer where AuthId = @authId");
					if(customer.recordset[0].TypeAccess == 'Worker'){
						console.log(customer.recordset[0].TypeAccess)
						isWorker = true;
					}
					canLogin = true;
					currentUser = auth.Mail;
					currentId = customer.recordset[0].AuthId;
					break;
				}
			}
			return [canLogin, isWorker];
    }
    catch (err) {
        console.log(err);
    }

}






module.exports = {
    getAuths: getAuths,
    getAuth : getAuth,
    addAuth : addAuth,
	Authent : Authent,
	getServ : getServ,
	addRecord : addRecord,
	getURecords : getURecords,
	getRecords : getRecords
}