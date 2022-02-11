var config = require('./dbconfig');
const sql = require('mysql');
var Auth = require('./auth')
const response = require('./response')
var currentUser = null;
var currentId = 0;
const db = require('./settings/db')
const jwt = require('jsonwebtoken')

//var Db  = require('./dboperations');
var Auth = require('./auth');
const dboperations = require('./dboperations');

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
var router = express.Router();
const exphbs = require('express-handlebars');
async function  getAuths (){
	try {
		let auths = await db.query("SELECT * from Auth");
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
	db.query("Select r.RecordId, s.Name, r.CreateDate, c.Name+' '+c.Surname+' '+c.Patronymic as 'Customer', r.PaymentType, w.Surname+' '+w.Name as 'Worker', r.RecordState from Record r join Serv s on s.ServId = r.ServId join Customer c on c.CustomerId = r.CustomerId join Worker w on w.WorkerId = r.WorkerId",(error, rows, fields)=>{
		if(error) {
			response.status(400, error, res)
		} else {
			response.status(200, rows, res)
		}
	})
	console.log(records.recordset)
	return records.recordset;

}

async function getURecords() {
	try {
		let pool = await sql.createConnection(config);
		//console.log("curr "+currentId);
		db.query("")
		let customer = await pool
			.input('authId', sql.Int, currentId)
			.query("SELECT * from Customer where AuthId = @authId");
		let customerId = customer.recordset[0].CustomerId;
		let records = await pool
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
	db.query("SELECT * from Serv", (error, rows, fields)=>{
		if(error) {
			response.status(400, error, res)
		} else {
			response.status(200, rows, res)
		}
	})
	return serv.recordset;
}


signin =(req, res) => {
	db.query("SELECT * from Auth where Mail = '" + req.body.Mail + "' ",(error, rows, fields)=>{
		if(error) {
			response.status(400, error, res)
		}
		else if(rows.length <= 0) {
			response.status(401, {message: `Пользователь с email - ${rw.body.Mail} не найден. Пройдите регистрацию.`}, res)
		}
		else {
			const row = JSON.parse(JSON.stringify(rows))
			row.map(rw => {
				const Pass = (req.body.Pass , rw.Pass)
				if (Pass) {
					const token = jwt.sign({

						userId: rw.AuthId,
						email: rw.Mail
					}, config.jwt, {expiresIn: 120 * 120})
					response.status(200, {token: `Bearer ${token}`}, res)
				}
				else {
					//Выкидываем ошибку что пароль не верный
					response.status(401, {message: `Пароль не верный.`}, res)
				}
				return true
			})
		}
	})
}



async function addRecord(auth, auths) {
	try {
		let pool = await sql.createConnection(config);
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


		var insertAuth = await pool
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

signup = (req, res)=> {

	db.query("SELECT `AuthId`, `Mail`, `Pass` FROM `Auth` WHERE `Mail` = '" + req.body.Mail + "'", (error, rows, fields) => {
		if(error) {
			response.status(400, error, res)
		} else if(typeof rows !== 'undefined' && rows.length > 0) {
			const row = JSON.parse(JSON.stringify(rows))
			row.map(rw => {
				response.status(302, {message: `Пользователь с таким email - ${rw.Mail} уже зарегстрирован!`}, res)
				return true
			})
		} else {
			const sql ="Insert into `Auth`(`Mail`, `Pass`) values ('"+ req.body.Mail +"','"+ req.body.Pass +"')";
			db.query(sql, (error, results) => {
				if(error) {
					response.status(400, error, res)
				} else {
					return res.redirect('/api/register')
					return response.status(200,{message: `Регистрация прошла успешно.`, results},res)
					;

				}
			})

		}
	})

}


//}
/**
async function signin(auth, auths) {
	try {
		var Mail = auth.Mail;
		var Pass = auth.Pass;
		var canLogin = false;
		var isWorker = false;
		for(i=0;i<auths.length;i++){
			if(auths[i].Mail==auth.Mail && auths[i].Pass == auth.Pass){
				let customer = await db
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
 */







module.exports = {
	getAuths: getAuths,
	signup : signup,
	signin : signin,
	getServ : getServ,
	addRecord : addRecord,
	getURecords : getURecords,
	getRecords : getRecords,
	login : login
}