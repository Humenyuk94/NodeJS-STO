//var Db  = require('./dboperations');
var Auth = require('./auth');
const dboperations = require('./dboperations');

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
var router = express.Router();
const exphbs = require('express-handlebars');

const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs'
})

var isLogged = false;
var isWorker = false;
app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use('/api', router);

//app.set("view engine", "hbs");

router.use((request,response,next)=>{
   console.log('middleware');
   next();
})

router.route('/register').get((req,res)=>{
  res.render('register', {
    title: 'register account',
    isRegister: true,
	isLogged
  })
})

router.route('/create').get((req,res)=>{
	dboperations.getServ().then(result => {
	  res.render('create', {
		title: 'Create todo',
		isCreate: true,
		result,
		isLogged,
		isWorker
	  });
   })
})

router.route('/').get((request,response)=>{
	response.render("index.hbs", {
		title: 'Login list',
		isIndex: true,
		isLogged,
		isWorker
	});
})

router.route('/auths').get((request,response)=>{

    dboperations.getAuths().then(result => {
       //response.send("<h1>" + result[0].Mail + "</h1>");
	   response.render("index2.hbs", {
		title: 'Login list',
		isIndex: true,
		result,
		isLogged
	  });
    })

})

router.route('/auth/:id').get((request,response)=>{

    dboperations.getAuth(request.params.id).then(result => {
       response.json(result[0]);
    })

})

router.route('/register').post((request,response)=>{
	//console.log("hello");
    let auth = {...request.body}
	var auths;
	dboperations.getAuths().then(result => {
		//auths = result;
		//console.log(auths);
	
	
    dboperations.addAuth(auth, result).then(result => {
       response.redirect('/api/register')
	   response.status(201).json(result);
	   
    })
	})
})

router.route('/records').get((req,res)=>{
  if(isWorker){
  dboperations.getRecords().then(result => {
       res.render('logins', {
		title: 'logins list',
		isLogins: true,
		result,
		isLogged,
		isWorker
	  })
    })
  } else {
	  dboperations.getURecords().then(result => {
       res.render('logins', {
		title: 'logins list',
		isLogins: true,
		result,
		isLogged,
		isWorker
	  })
    })
  }
})

router.route('/create').post((request,response)=>{
	if(isLogged){
		let auth = {...request.body}
		
		var auths;
		dboperations.getAuths().then(result => {
			dboperations.addRecord(auth, result).then(result => {
			   response.redirect('/api/auths')
			   response.status(201).json(result);
			   
			})
		})
	} else {
		dboperations.getServ().then(result => {
		res.render('create', {
		title: 'Create todo',
		isCreate: true,
		result,
		isLogged
	  });
   })
	}
})

router.route('/logining').post((request,response)=>{
	//console.log("hello");
    let auth = {...request.body}
	var auths;
	dboperations.getAuths().then(result => {
		dboperations.Authent(auth, result).then(result => {
		   response.redirect('/api/')
		   //console.log(result);
		   isLogged = result[0];
		   isWorker = result[1];
		})
	})
})

var port = process.env.PORT || 8090;
app.listen(port);
console.log('Order API is runnning at ' + port);



