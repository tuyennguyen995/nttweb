const express = require('express');
const bodyParser = require('body-parser');
const Passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
server.listen(process.env.PORT || 3000);

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(session({ secret: 'secret', name: 'cookie_dangnhap', cookie:{maxAge: 1000*60*3}, proxy: true, resave: true, saveUninitialized: true}));
app.use(Passport.initialize());
app.use(Passport.session());
app.use(express.static("public"));

const sequelize = require('sequelize');
const config = require('./db.js');
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

const QUAN_HUYEN = config.define('QUAN_HUYEN',{
  TEN_QUAN_HUYEN: sequelize.STRING,
  TINH: sequelize.INTEGER
})
//Đồng bộ với sql
config.sync();

//Lắng nghe kết nối tới Server
io.on("connection", function(socket){
  console.log("Có người kết nối kìa!" + socket.id);
  socket.on("disconnect", function(){
    console.log(socket.id +" ngắt kết nối!!");
  });
  socket.on("trangchu_send_data", function(data){
    console.log(data);
  })
});

//Trang private
app.get('/',(req, res) => {
  if(req.isAuthenticated()){
    TINH.findAll({raw: true})
    .then(arrTINH => {
      QUAN_HUYEN.findAll({raw: true})
      .then(arrQH => {
        res.render('index.ejs', {data1: arrTINH, data2: arrQH});
      })
      .catch(err=> console.log(err.message))
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
