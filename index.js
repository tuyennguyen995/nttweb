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
app.use(session({ secret: 'secret', name: 'cookie_dangnhap', cookie:{maxAge: 1000*60*3}, proxy: true, resave: true, saveUninitialized: true}));
app.use(Passport.initialize());
app.use(Passport.session());

//Kết nối database
const sequelize = require('sequelize');
const config = new sequelize ({
  host: "localhost",
  username: "postgres",
  password: "admin@123",
  database: "DataNTT",
  port:"5432",
  dialect: "postgres",
  operatorsAliases: false,
  dialectOptions: { ssl: false},
  define: {freezeTableName: true}
});

//Kiểm tra kết nối
config.authenticate()
.then(() => console.log("Connected!"))
.catch(err => console.log(err.message))

//Trang private
app.get('/',(req, res) => {
  if(req.isAuthenticated()){
    res.render('index')
  }else {
    res.redirect('/login');
  }
});

//Điều hướng route
app.route('/login')
.get((req, res) => res.render('login'))
.post(Passport.authenticate('local',{failureRedirect: '/login', successRedirect: '/'}))

//Kiểm tra chứng thực user
Passport.use(new LocalStrategy((username, password, done) => {
  pool.connect(function(err, client, done){
    if(err){
      console.log("Connect database login error!");
    }else {
      client.query("SELECT * FROM 	USER where TEN_USER='"+username+"'", function(error, result){
          if(rows == ""){
              console.log('Tài khoản không tồn tại!');
              return done(null, false);
          }
          else if(rows[0].PASS_USER == password){
            console.log("Password chính xác!");
            return done(null, result[0].TEN_USER);
          }else {
              console.log("Password không chính xác!");
              return done(null, false);
          }
      })
    }
  })
}));

Passport.serializeUser((user, done) =>{
  done(null, user);
})
Passport.deserializeUser(function(name, done) {
  pool.connect(function(err, client, done){
    if(err){
      console.log("Connect database login error!");
    }else {
      client.query("SELECT * FROM 	USER where TEN_USER='"+name+"'", function(error, result){
          if(rows == ""){
              console.log('Tài khoản không tồn tại!');
              return done(null, false);
          }else {
              return done(null, result[0].TEN_USER);
          }
      })
    }
  })
});
