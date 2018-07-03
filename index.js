const express = require('express');
const bodyParser = require('body-parser');
const Passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const app = express();
const expressLayouts = require('express-ejs-layouts');
const server = require('http').Server(app);
const io = require('socket.io')(server);
server.listen(process.env.PORT ||3000);

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(session({ secret: 'secret', name: 'cookie_dangnhap', cookie:{maxAge: 1000*60*5}, proxy: true, resave: true, saveUninitialized: true}));
app.use(Passport.initialize());
app.use(Passport.session());
app.use(express.static('public'));
app.use(expressLayouts);

const sequelize = require('sequelize');
const Op = sequelize.Op;
const config = require('./db.js');
//Kiểm tra kết nối
config.authenticate()
.then(() => console.log("Connected!"))
.catch(err => console.log(err.message))

var temp = 0;
var urlencodedParser = bodyParser.urlencoded({extended: false});
//Tao bảng trong sql
const USER = config.define('USER',{
  username: sequelize.STRING,
  password: sequelize.STRING,
  trangthai: sequelize.INTEGER,
  info_user: sequelize.INTEGER,
  coquan: sequelize.INTEGER,
})

const TRANGTHAI = config.define('TRANGTHAI',{
  TEN_TRANGTHAI: sequelize.STRING,
  APDUNG: sequelize.STRING
})

const TINH = config.define('TINH',{
  TEN_TINH: sequelize.STRING
})

const QUAN_HUYEN = config.define('QUAN_HUYEN',{
  TEN_QUAN_HUYEN: sequelize.STRING,
  ma_tinh: sequelize.INTEGER
})
const PHUONG_XA = config.define('PHUONG_XA',{
  TEN_PHUONG_XA: sequelize.STRING,
  ma_quan_huyen: sequelize.INTEGER
})

const INFO_USER = config.define('INFO_USER',{
  HOTEN: sequelize.STRING,
  GIOITINH: sequelize.STRING,
  NGAYSINH: sequelize.DATE,
  CMND: sequelize.STRING,
  SDT: sequelize.STRING,
  MAIL: sequelize.STRING,
  NGAYCAP: sequelize.DATE,
  NOICAP: sequelize.STRING
})

const COQUAN = config.define('COQUAN',{
  MA_COQUAN: sequelize.STRING,
  TEN_COQUAN: sequelize.STRING,
  BOPHAN: sequelize.STRING,
  DIACHI_SO: sequelize.STRING,
  ma_diachi: sequelize.INTEGER
})

const DUONGSU = config.define('DUONGSU',{
  HOTEN: sequelize.STRING,
  GIOITINH: sequelize.STRING,
  NGAYSINH: sequelize.DATE,
  CMND: sequelize.STRING,
  SDT: sequelize.STRING,
  NGAYCAP: sequelize.DATE,
  NOICAP: sequelize.STRING,
  QUOCTICH: sequelize.STRING,
  ma_diachi: sequelize.INTEGER,
  DIACHI_SO: sequelize.STRING,
  TINHTRANG: 

})
//Đồng bộ với sql
config.sync();

//Điều hướng route login
app.route('/login')
.get((req, res) => res.render('login.ejs',{layout: false}))
.post(Passport.authenticate('local',{failureRedirect: '/login',successRedirect: '/admin'}))

//Trang private admin
app.get('/admin',(req, res) => {
  if(req.isAuthenticated()){
    config.query('SELECT * FROM public."INFO_USER" as a, public."USER" as b WHERE b.info_user = a.id and b.username ='+"'"+req.user+"'")
    .then(title => {
      res.render('admin/index', {data: title, layout: 'layouts/admin/layout_ad'});
    })
  }else {
      res.redirect('/login');
  }
});

//Trang private admin tài khoản
app.get('/admin/taikhoan',(req, res) => {
  if(req.isAuthenticated()){
    config.query('SELECT * FROM public."INFO_USER" as a, public."USER" as b WHERE b.info_user = a.id and b.username ='+"'"+req.user+"'")
    .then(title => {
      res.render('admin/taikhoan/index', {data: title, layout: 'layouts/admin/layout_ad'});
    })
  }else {
      res.redirect('/login');
  }
});


//Điều hướng route edit user
app.get('/admin/taikhoan/edit/:id',function(req, res){
  var gioitinhs = "";
     if(req.isAuthenticated()){
      var i = req.params.id;
      config.query('SELECT * FROM public."INFO_USER" as b, public."TRANGTHAI" as c, public."COQUAN" as d, public."PHUONG_XA" as e, public."QUAN_HUYEN" as f, public."TINH" as g, public."USER" as a where a.info_user = b.id and a.trangthai = c.id and a.coquan = d.id and d.ma_diachi = e.id and e.ma_quan_huyen = f.id and f.ma_tinh = g.id and a.id ='+ i)
      .then(arr => {
        TINH.findAll({where:{id: {[Op.ne]:  arr[0][0].ma_tinh}}})
        .then(arrTinh =>{
          QUAN_HUYEN.findAll({where:{[Op.and]: [{id: {[Op.ne]:  arr[0][0].ma_quan_huyen}},{ma_tinh: arr[0][0].ma_tinh}]}})
          .then(arrqh =>{
            PHUONG_XA.findAll({where:{[Op.and]: [{id: {[Op.ne]:  arr[0][0].ma_diachi}},{ma_quan_huyen: arr[0][0].ma_quan_huyen}]}})
            .then(arrpx =>{
              if(arr[0][0].GIOITINH == "Nam"){
                gioitinhs = "Nữ";
              }else {
                gioitinhs = "Nam";
              }
              config.query('SELECT to_char("NGAYCAP",'+ "'yyyy-MM-dd'"+') FROM public."INFO_USER" where id ='+arr[0][0].info_user)
              .then(ncap =>{
                config.query('SELECT to_char("NGAYSINH",'+ "'yyyy-MM-dd'"+') FROM public."INFO_USER" where id ='+arr[0][0].info_user)
                .then(nsinh =>{
                  TRANGTHAI.findAll({where:{[Op.and]: [{id: {[Op.ne]:  arr[0][0].trangthai}},{APDUNG: "USER"}]}})
                  .then(tthai =>{
                        config.query('SELECT * FROM public."INFO_USER" as a, public."USER" as b WHERE b.info_user = a.id and b.username ='+"'"+req.user+"'")
                    .then(title => {
                      res.render("admin/taikhoan/edit.ejs",{data1: arr,
                        data2: arrqh,
                        data3: arrpx,
                        data4: arrTinh,
                        data: title,
                        gt: gioitinhs,
                        nc: ncap,
                        ns: nsinh,
                        tt: tthai,
                        layout: 'layouts/admin/layout_ad'
                      });
                    })
                  })
                })
              })
            })
          })
        })
      })
    }else {
      res.redirect('/login');
    }
})
app.post('/admin/taikhoan/edit/:id',urlencodedParser, function(req, res){
  var i = req.params.id;
  var user = req.body.us;
  var pass = req.body.pw;
  //Bảng cơ quan
  diachi = req.body.diachi;
  phuong = req.body.phuongxa;
  bophan = req.body.bophan;
  coquan = req.body.tencoquan;
  macoquan = req.body.macoquan;
  //BẢng info_user
  mail = req.body.mail;
  sdt = req.body.sdt;
  noicap = req.body.noicap;
  ngaycap = req.body.ngaycap;
  cmnd = req.body.cmnd;
  ngaysinh = req.body.ngaysinh;
  gioitinh = req.body.gioitinh;
  hoten = req.body.hoten;
  tthai = req.body.tthai;

  var us = -1;
  USER.findOne({where:{id: i}})
  .then(sUSER => {
    if(user != sUSER.username){ //Kiểm ten username đã có thay đổi không
      USER.findAll({where:{username: user}})  //Kiểm tra thay username có tồn tại chưa
      .then(sUSER => {
        if(sUSER.length > 0){
          us = 1
        }else {
          us = 0;
          temp = -2;  //Lỗi tên user đã tồn tại
        }
      })
      if(us == 1){
        res.redirect('/admin/taikhoan/edit/'+i);
      }else {
        USER.update({
          username: user,
          password: pass,
          trangthai: tthai
        },{
          where: {id: i}
        });
        COQUAN.update({
          MA_COQUAN: macoquan,
          TEN_COQUAN: coquan,
          BOPHAN: bophan,
          DIACHI_SO: diachi,
          ma_diachi: phuong
        },{
          where: {id: sUSER.coquan}
        });
        INFO_USER.update({
          HOTEN: hoten,
          GIOITINH: gioitinh,
          NGAYSINH: ngaysinh,
          CMND: cmnd,
          SDT: sdt,
          MAIL: mail,
          NGAYCAP: ngaycap,
          NOICAP: noicap
        },{
          where: {id: sUSER.info_user}
        });
        res.redirect('/admin/taikhoan');
      }
    }else {
      USER.update({
        username: user,
        password: pass,
        trangthai: tthai
      },{
        where: {id: i}
      });
      COQUAN.update({
        MA_COQUAN: macoquan,
        TEN_COQUAN: coquan,
        BOPHAN: bophan,
        DIACHI_SO: diachi,
        ma_diachi: phuong
      },{
        where: {id: sUSER.coquan}
      });
      INFO_USER.update({
        HOTEN: hoten,
        GIOITINH: gioitinh,
        NGAYSINH: ngaysinh,
        CMND: cmnd,
        SDT: sdt,
        MAIL: mail,
        NGAYCAP: ngaycap,
        NOICAP: noicap
      },{
        where: {id: sUSER.info_user}
      });
      res.redirect('/admin');
      }
  })
})

app.get('/admin/taikhoan/delete/:id',function(req, res){
    if(req.isAuthenticated()){
      var i = req.params.id;
      USER.findOne({where: {id: i}})
      .then(user =>{
        COQUAN.destroy({where: {id: user.coquan}});
        INFO_USER.destroy({where: {id: user.info_user}});
      })
      USER.destroy({where: {id: i}});
      res.redirect('/admin/taikhoan');
    }else {
      res.redirect('/login');
    }
  })

app.get('/admin/taikhoan/create',function(req, res){
      if(req.isAuthenticated()){
        TINH.findAll({raw: true})
        .then(arrTinh =>{
          config.query('SELECT * FROM public."INFO_USER" as a, public."USER" as b WHERE b.info_user = a.id and b.username ='+"'"+req.user+"'")
          .then(title => {
            res.render("admin/taikhoan/create",{
              data: title,
              data1: arrTinh,
              layout: 'layouts/admin/layout_ad'
            });
          })
        })
      }else {
        res.redirect('/login');
      }
})

app.post('/admin/taikhoan/create',urlencodedParser, function(req, res){
  //Bảng user
  var user = req.body.us;
  var pass = req.body.pw;
  //Bảng cơ quan
  diachi = req.body.diachi;
  phuong = req.body.phuongxa;
  bophan = req.body.bophan;
  coquan = req.body.tencoquan;
  macoquan = req.body.macoquan;
  //BẢng info_user
  mail = req.body.mail;
  sdt = req.body.sdt;
  noicap = req.body.noicap;
  ngaycap = req.body.ngaycap;
  cmnd = req.body.cmnd;
  ngaysinh = req.body.ngaysinh;
  gioitinh = req.body.gioitinh;
  hoten = req.body.hoten;

  var us = -1;
  USER.findOne({where:{username: user}})
  .then(sUSER => {
    if(sUSER != ""){
      us = 1;

    }else{
      us = 0;
      temp = -2;  //Lỗi tên user đã tồn tại
    }
  })
  if(us == 0){
    res.redirect('/admin/taikhoan/create');
  }else {
    COQUAN.create({
      MA_COQUAN: macoquan,
      TEN_COQUAN: coquan,
      BOPHAN: bophan,
      DIACHI_SO: diachi,
      ma_diachi: phuong
    })
    .then(cq =>{
      INFO_USER.create({
        HOTEN: hoten,
        GIOITINH: gioitinh,
        NGAYSINH: ngaysinh,
        CMND: cmnd,
        SDT: sdt,
        MAIL: mail,
        NGAYCAP: ngaycap,
        NOICAP: noicap
      })
      .then(info =>{
        USER.create({
          username: user,
          password: pass,
          info_user: info.id,
          coquan: cq.id,
          trangthai: 2
        })
        .then(row => {
          res.redirect('/admin/taikhoan')
        })
      })
    })
  }
})
app.get('/admin/taikhoan/view/:id', function(req, res){
  var gioitinhs = "";
     if(req.isAuthenticated()){
      var i = req.params.id;
      config.query('SELECT * FROM public."INFO_USER" as b, public."TRANGTHAI" as c, public."COQUAN" as d, public."PHUONG_XA" as e, public."QUAN_HUYEN" as f, public."TINH" as g, public."USER" as a where a.info_user = b.id and a.trangthai = c.id and a.coquan = d.id and d.ma_diachi = e.id and e.ma_quan_huyen = f.id and f.ma_tinh = g.id and a.id ='+ i)
      .then(arr => {
        config.query('SELECT * FROM public."INFO_USER" as a, public."USER" as b WHERE b.info_user = a.id and b.username ='+"'"+req.user+"'")
        .then(title => {
          config.query('SELECT to_char("NGAYCAP",'+ "'yyyy-MM-dd'"+') FROM public."INFO_USER" where id ='+arr[0][0].info_user)
          .then(ncap =>{
            config.query('SELECT to_char("NGAYSINH",'+ "'yyyy-MM-dd'"+') FROM public."INFO_USER" where id ='+arr[0][0].info_user)
            .then(nsinh =>{
              res.render("admin/taikhoan/view.ejs",{data1: arr,
                data: title,
                nc: ncap,
                ns: nsinh,
                layout: 'layouts/admin/layout_ad'
              })
            })
          })
        })
      })
    }else {
      res.redirect('/login');
    }
})

//Kiểm tra chứng thực user
Passport.use(new LocalStrategy((username, password, done) => {
  USER.findOne({where:{username: username}})
  .then(USER => {
    //code
    if(USER.trangthai == 1){
      if(USER.password == password){
        console.log("Password chính xác!");
        return done(null, USER.username);
      }else {
          temp = -1; //Lỗi mật khẩu không chính xác
          console.log("Password không chính xác!");
          return done(null, false);
      }
    }else {
      temp = -3; //Lỗi tài khoản bị khóa
      console.log("Tài khoản đã bị khóa!");
      return done(null, false);
    }
  })
  .catch(err => {
    temp = 1; //Lỗi tài khoản không tồn tại
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
  socket.on("trangchu_sendData_QH", function(data){
    // Gửi về cho tất cả người dùng
    // io.sockets.emit("server_send_data", data+"8989");
    // Gửi về cho tất cả người dùng nhưng k gửi lại người đã gửi
    // io.broadcast.emit("server_send_data", data+"8989");
    // Gửi về cho người đã send
    QUAN_HUYEN.findAll({where:{ ma_tinh: data}})
    .then(arrQH => {
        socket.emit("server_sendData_QH", arrQH);
    })
    .catch(err=> console.log(err.message))
  });
  socket.on("trangchu_sendData_PX", function(data){
    PHUONG_XA.findAll({where:{ ma_quan_huyen: data}})
    .then(arrPX => {
        socket.emit("server_sendData_PX", arrPX);
    })
    .catch(err=> console.log(err.message))
  });
  socket.emit("server_sendData_info", temp);
  temp = 0;
  config.query('SELECT * FROM public."INFO_USER" as b, public."TRANGTHAI" as c, public."COQUAN" as d, public."PHUONG_XA" as e, public."QUAN_HUYEN" as f, public."TINH" as g,  public."USER" as a where a.info_user = b.id and a.trangthai = c.id and a.coquan = d.id and d.ma_diachi = e.id and e.ma_quan_huyen = f.id and f.ma_tinh = g.id')
  .then(arr => {
    socket.emit("server_sendData_dsUser", arr);
  })
});
