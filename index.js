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
  host: "ec2-54-204-23-228.compute-1.amazonaws.com",
  username: "qsazzvvbopiolj",
  password: "23d411af50c296de532da9df874d68d657d9af9108a9607baa3e0d1cde1931ef",
  database: "dauaa88394fkno",
  port:"5432",
  dialect: "postgres",
  operatorsAliases: false,
  dialectOptions: { ssl: true},
  define: {freezeTableName: true}
});

//Kiểm tra kết nối
config.authenticate()
.then(() => console.log("Connected!"))
.catch(err => console.log(err.message))

//Tao bảng trong sql
const USER = config.define('USER',{
  username: sequelize.STRING,
  password: sequelize.STRING
})
const TINH = config.define('TINH',{
  TEN_TINH: sequelize.STRING
})
//Đồng bộ với sql
config.sync()

//Trang private
app.get('/',(req, res) => {
  if(req.isAuthenticated()){
    TINH.findAll({raw: true})
    .then(arrTINH => {
      res.render('index.ejs', {data: arrTINH});
    })
    .catch(err=> console.log(err.message))
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
  USER.findOne({where:{username: username}})
  .then(USER => {
    //code
    if(USER.password == password){
      console.log("Password chính xác!");
      return done(null, USER.username);
    }else {
        console.log("Password không chính xác!");
        return done(null, false);
    }
  })
  .catch(err => {
    console.log('Tài khoản không tồn tại!');
    return done(null, false);
  })
}));

Passport.serializeUser((user, done) =>{
  done(null, user);
})
Passport.deserializeUser(function(name, done) {
  USER.findOne({where:{username: name}})
  .then(USER => {
    //code
    return done(null, USER.username);
  })
  .catch(err => {
    console.log('Tài khoản không tồn tại!');
    return done(null, false);
  })
});
