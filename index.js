const express = require('express');
const bodyParser = require('body-parser');
const Passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const app = express();
app.listen(process.env.PORT || 3000);

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(session({ secret: 'secret', name: 'cookie_dangnhap', cookie:{maxAge: 1000*60*30}, proxy: true, resave: true, saveUninitialized: true}));
app.use(Passport.initialize());
app.use(Passport.session());

var mysql = require('mysql'); //Ket noi module
var connection = mysql.createConnection({  //Bien connect
  host: 'localhost',  //Sai Xampp mac dinh là localhost
  user: 'root',       //Mac dinh root
  password: 'admin@123',       //Mat khau mat dinh trong
  database: 'datantt'  //Ten csdl
});
connection.connect(function(error){
  if(!!error){
    console.log('Error connect!');
  }
  else{
  console.log('Connected!');
  }
})

//Trang private
app.get('/',(req, res) => {
  if(req.isAuthenticated()){
    res.render('index')
  }else {
    res.redirect('/login');
  }
});

app.route('/login')
.get((req, res) => res.render('login'))
.post(Passport.authenticate('local',{failureRedirect: '/login', successRedirect: '/'}))

Passport.use(new LocalStrategy((username, password, done) => {
  connection.query("SELECT * FROM 	USERS where TEN_USER='"+username+"'", function(error, rows){
      if(rows == ""){
          return done(null, false);
      }
      else if(rows[0].PASS_USER == password){
        console.log("OK");
        return done(null, rows[0].TEN_USER);
      }else {
          console.log("False");
          return done(null, false);
      }
  })
}))

Passport.serializeUser((user, done) =>{
  done(null, user);
})
Passport.deserializeUser(function(name, done) {
  connection.query("SELECT * FROM 	USERS where TEN_USER='"+name+"'", function(error, rows){
      if(rows == ""){
          return done(null, false);
      }else {
          return done(null, rows[0].TEN_USER);
      }
  })
});
