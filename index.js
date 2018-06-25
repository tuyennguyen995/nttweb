const express = require('express');
const bodyParser = require('body-parser');
const Passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
server.listen(process.env.PORT ||3000);

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(session({ secret: 'secret', name: 'cookie_dangnhap', cookie:{maxAge: 1000*60*5}, proxy: true, resave: true, saveUninitialized: true}));
app.use(Passport.initialize());
app.use(Passport.session());
app.use(express.static("public"));

const sequelize = require('sequelize');
const config = require('./db.js');
//Kiểm tra kết nối
config.authenticate()
.then(() => console.log("Connected!"))
.catch(err => console.log(err.message))
var temp = 0;
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
const PHUONG_XA = config.define('PHUONG_XA',{
  TEN_PHUONG_XA: sequelize.STRING,
  MA_QUAN_HUYEN: sequelize.INTEGER
})
//Đồng bộ với sql
config.sync();

//Trang private
app.get('/admin',(req, res) => {
  if(req.isAuthenticated()){
    USER.findOne({where:{username: req.user}})
    .then(USER => {
      res.render('admin/index_ad', {data: USER});
    })
  }else {
      res.redirect('/login');
  }
});

//Điều hướng route
app.route('/login')
.get((req, res) => res.render('login.ejs'))
.post(Passport.authenticate('local',{failureRedirect: '/login',successRedirect: '/admin'}))

//Kiểm tra chứng thực user
Passport.use(new LocalStrategy((username, password, done) => {
  USER.findOne({where:{username: username}})
  .then(USER => {
    //code
    if(USER.password == password){
      console.log("Password chính xác!");
      return done(null, USER.username);
    }else {
        temp = -1;
        console.log("Password không chính xác!");
        return done(null, false);
    }
  })
  .catch(err => {
    temp = 1;
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

//Lắng nghe kết nối tới Server
io.on("connection", function(socket){
  console.log("Có người kết nối kìa!" + socket.id);
  socket.on("disconnect", function(){
    console.log(socket.id +" ngắt kết nối!!");
  });
  //socket.on("trangchu_sendData_QH", function(data){
    //Gửi về cho tất cả người dùng
    //io.sockets.emit("server_send_data", data+"8989");
    //Gửi về cho tất cả người dùng nhưng k gửi lại người đã gửi
    //io.broadcast.emit("server_send_data", data+"8989");
    //Gửi về cho người đã send
  //   QUAN_HUYEN.findAll({where:{ TINH: data}})
  //   .then(arrQH => {
  //       socket.emit("server_sendData_QH", arrQH);
  //   })
  //   .catch(err=> console.log(err.message))
  // });
  // socket.on("trangchu_sendData_PX", function(data){
  //   PHUONG_XA.findAll({where:{ MA_QUAN_HUYEN: data}})
  //   .then(arrPX => {
  //       socket.emit("server_sendData_PX", arrPX);
  //   })
  //   .catch(err=> console.log(err.message))
  // });
  socket.emit("server_sendData_login", temp);
  temp = 0;
  USER.findAll({raw: true})
  .then(arrUSER => {
    socket.emit("server_sendData_dsUser", arrUSER);
  })
});
