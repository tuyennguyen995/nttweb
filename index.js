const express = require('express');
const bodyParser = require('body-parser');
const Passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const app = express();
const expressLayouts = require('express-ejs-layouts');
const server = require('http').Server(app);
const io = require('socket.io')(server);
server.listen(process.env.PORT || 3000);

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(session({
  secret: 'secret',
  name: 'cookie_dangnhap',
  cookie: {
    maxAge: 1001 * 60 * 30
  },
  proxy: true,
  resave: true,
  saveUninitialized: true
}));
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
var urlencodedParser = bodyParser.urlencoded({
  extended: false
});
//Tao bảng trong sql
const USER = config.define('USER', {
  username: sequelize.STRING,
  password: sequelize.STRING,
  trangthai: sequelize.INTEGER,
  info_user: sequelize.INTEGER,
  coquan: sequelize.INTEGER,
})
const TRANGTHAI = config.define('TRANGTHAI', {
  TEN_TRANGTHAI: sequelize.STRING,
  APDUNG: sequelize.STRING
})
const TINH = config.define('TINH', {
  TEN_TINH: sequelize.STRING
})
const QUAN_HUYEN = config.define('QUAN_HUYEN', {
  TEN_QUAN_HUYEN: sequelize.STRING,
  ma_tinh: sequelize.INTEGER
})
const PHUONG_XA = config.define('PHUONG_XA', {
  TEN_PHUONG_XA: sequelize.STRING,
  ma_quan_huyen: sequelize.INTEGER
})
const INFO_USER = config.define('INFO_USER', {
  HOTEN: sequelize.STRING,
  GIOITINH: sequelize.STRING,
  NGAYSINH: sequelize.DATE,
  CMND: sequelize.STRING,
  SDT: sequelize.STRING,
  MAIL: sequelize.STRING,
  NGAYCAP: sequelize.DATE,
  NOICAP: sequelize.STRING
})
const COQUAN = config.define('COQUAN', {
  MA_COQUAN: sequelize.STRING,
  TEN_COQUAN: sequelize.STRING,
  BOPHAN: sequelize.STRING,
  DIACHI_SO: sequelize.STRING,
  ma_diachi: sequelize.INTEGER
})
const DUONGSU_CANHAN = config.define('DUONGSU_CANHAN', {
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
  TINHTRANG: sequelize.STRING,
  tt_honnhan: sequelize.INTEGER,
  vo_chong: sequelize.INTEGER,
  GHICHU: sequelize.STRING,
  trang_thai: sequelize.INTEGER,
  danh_muc: sequelize.INTEGER
})
const HONNHAN = config.define('HONNHAN', {
  SO_DK: sequelize.STRING,
  QUYENSO: sequelize.STRING,
  NGAYCAP_GCN: sequelize.DATE,
  NOICAP_GCN: sequelize.STRING
})
const TINHTRANG_HONNHAN = config.define('TINHTRANG_HONNHAN',{
  TEN_TT_HONNHAN: sequelize.STRING
})
//Đồng bộ với sql
config.sync();

app.get('/', function(req, res){
  res.render('index',{layout: false});
})

//Điều hướng route login
app.route('/login')
  .get((req, res) => res.render('login.ejs', {
    layout: false
  }))
  .post(Passport.authenticate('local', {
    failureRedirect: '/login',
    successRedirect: '/admin'
  }))
//Kiểm tra chứng thực user
Passport.use(new LocalStrategy((username, password, done) => {
  USER.findOne({
      where: {
        username: username
      }
    })
    .then(USER => {
      //code
      if (USER.trangthai == 1) {
        if (USER.password == password) {
          console.log("Password chính xác!");
          return done(null, USER.username);
        } else {
          temp = -1; //Lỗi mật khẩu không chính xác
          console.log("Password không chính xác!");
          return done(null, false);
        }
      } else {
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
Passport.serializeUser((user, done) => {
  done(null, user);
})
Passport.deserializeUser(function(name, done) {
  USER.findOne({
      where: {
        username: name
      }
    })
    .then(USER => {
      //code
      return done(null, USER.username);
    })
    .catch(err => {
      console.log('Tài khoản không tồn tại!');
      return done(null, false);
    })
});

//Trang private admin
app.get('/admin', (req, res) => {
  if (req.isAuthenticated()) {
    config.query('SELECT * FROM public."INFO_USER" as a, public."USER" as b WHERE b.info_user = a.id and b.username =' + "'" + req.user + "'")
      .then(title => {
        res.render('admin/index', {
          data: title,
          layout: 'layouts/admin/layout_ad'
        });
      })
  } else {
    res.redirect('/login');
  }
});

//Trang private admin tài khoản
app.get('/admin/taikhoan', (req, res) => {
  if (req.isAuthenticated()) {
    config.query('SELECT * FROM public."INFO_USER" as a, public."USER" as b WHERE b.info_user = a.id and b.username =' + "'" + req.user + "'")
      .then(title => {
        res.render('admin/taikhoan/index', {
          data: title,
          layout: 'layouts/admin/layout_ad'
        });
      })
  } else {
    res.redirect('/login');
  }
});
//Cap nhat tai khoan
app.get('/admin/taikhoan/edit/:id', function(req, res) {
  var gioitinhs = "";
  if (req.isAuthenticated()) {
    var i = req.params.id;
    config.query('SELECT * FROM public."INFO_USER" as b, public."TRANGTHAI" as c, public."COQUAN" as d, public."PHUONG_XA" as e, public."QUAN_HUYEN" as f, public."TINH" as g, public."USER" as a where a.info_user = b.id and a.trangthai = c.id and a.coquan = d.id and d.ma_diachi = e.id and e.ma_quan_huyen = f.id and f.ma_tinh = g.id and a.id =' + i)
      .then(arr => {
        TINH.findAll({
            where: {
              id: {
                [Op.ne]: arr[0][0].ma_tinh
              }
            }
          })
          .then(arrTinh => {
            QUAN_HUYEN.findAll({
                where: {
                  [Op.and]: [{
                    id: {
                      [Op.ne]: arr[0][0].ma_quan_huyen
                    }
                  }, {
                    ma_tinh: arr[0][0].ma_tinh
                  }]
                }
              })
              .then(arrqh => {
                PHUONG_XA.findAll({
                    where: {
                      [Op.and]: [{
                        id: {
                          [Op.ne]: arr[0][0].ma_diachi
                        }
                      }, {
                        ma_quan_huyen: arr[0][0].ma_quan_huyen
                      }]
                    }
                  })
                  .then(arrpx => {
                    if (arr[0][0].GIOITINH == "Nam") {
                      gioitinhs = "Nữ";
                    } else {
                      gioitinhs = "Nam";
                    }
                    config.query('SELECT to_char("NGAYCAP",' + "'yyyy-MM-dd'" + ') FROM public."INFO_USER" where id =' + arr[0][0].info_user)
                      .then(ncap => {
                        config.query('SELECT to_char("NGAYSINH",' + "'yyyy-MM-dd'" + ') FROM public."INFO_USER" where id =' + arr[0][0].info_user)
                          .then(nsinh => {
                            TRANGTHAI.findAll({
                                where: {
                                  [Op.and]: [{
                                    id: {
                                      [Op.ne]: arr[0][0].trangthai
                                    }
                                  }, {
                                    APDUNG: "USER"
                                  }]
                                }
                              })
                              .then(tthai => {
                                config.query('SELECT * FROM public."INFO_USER" as a, public."USER" as b WHERE b.info_user = a.id and b.username =' + "'" + req.user + "'")
                                  .then(title => {
                                    res.render("admin/taikhoan/edit.ejs", {
                                      data1: arr,
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
  } else {
    res.redirect('/login');
  }
})
app.post('/admin/taikhoan/edit/:id', urlencodedParser, function(req, res) {
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
  USER.findOne({
      where: {
        id: i
      }
    })
    .then(sUSER => {
      if (user != sUSER.username) { //Kiểm ten username đã có thay đổi không
        USER.findAll({
            where: {
              username: user
            }
          }) //Kiểm tra thay username có tồn tại chưa
          .then(sUSER => {
            if (sUSER.length > 0) {
              us = 1
            } else {
              us = 0;
              temp = -2; //Lỗi tên user đã tồn tại
            }
          })
        if (us == 1) {
          res.redirect('/admin/taikhoan/edit/' + i);
        } else {
          USER.update({
            username: user,
            password: pass,
            trangthai: tthai
          }, {
            where: {
              id: i
            }
          });
          COQUAN.update({
            MA_COQUAN: macoquan,
            TEN_COQUAN: coquan,
            BOPHAN: bophan,
            DIACHI_SO: diachi,
            ma_diachi: phuong
          }, {
            where: {
              id: sUSER.coquan
            }
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
          }, {
            where: {
              id: sUSER.info_user
            }
          });
          res.redirect('/admin/taikhoan');
        }
      } else {
        USER.update({
          username: user,
          password: pass,
          trangthai: tthai
        }, {
          where: {
            id: i
          }
        });
        COQUAN.update({
          MA_COQUAN: macoquan,
          TEN_COQUAN: coquan,
          BOPHAN: bophan,
          DIACHI_SO: diachi,
          ma_diachi: phuong
        }, {
          where: {
            id: sUSER.coquan
          }
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
        }, {
          where: {
            id: sUSER.info_user
          }
        });
        res.redirect('/admin');
      }
    })
})
//Xoa tai khoan
app.get('/admin/taikhoan/delete/:id', function(req, res) {
  if (req.isAuthenticated()) {
    var i = req.params.id;
    USER.findOne({
        where: {
          id: i
        }
      })
      .then(user => {
        COQUAN.destroy({
          where: {
            id: user.coquan
          }
        });
        INFO_USER.destroy({
          where: {
            id: user.info_user
          }
        });
      })
    USER.destroy({
      where: {
        id: i
      }
    });
    res.redirect('/admin/taikhoan');
  } else {
    res.redirect('/login');
  }
})
//Tao tai khoan
app.get('/admin/taikhoan/create', function(req, res) {
  if (req.isAuthenticated()) {
    TINH.findAll({
        raw: true
      })
      .then(arrTinh => {
        config.query('SELECT * FROM public."INFO_USER" as a, public."USER" as b WHERE b.info_user = a.id and b.username =' + "'" + req.user + "'")
          .then(title => {
            res.render("admin/taikhoan/create", {
              data: title,
              data1: arrTinh,
              layout: 'layouts/admin/layout_ad'
            });
          })
      })
  } else {
    res.redirect('/login');
  }
})
app.post('/admin/taikhoan/create', urlencodedParser, function(req, res) {
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
  USER.findOne({
      where: {
        username: user
      }
    })
    .then(sUSER => {
      if (sUSER != "") {
        us = 1;

      } else {
        us = 0;
        temp = -2; //Lỗi tên user đã tồn tại
      }
    })
  if (us == 0) {
    res.redirect('/admin/taikhoan/create');
  } else {
    COQUAN.create({
        MA_COQUAN: macoquan,
        TEN_COQUAN: coquan,
        BOPHAN: bophan,
        DIACHI_SO: diachi,
        ma_diachi: phuong
      })
      .then(cq => {
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
          .then(info => {
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
//Xem tai khoan
app.get('/admin/taikhoan/view/:id', function(req, res) {
  var gioitinhs = "";
  if (req.isAuthenticated()) {
    var i = req.params.id;
    config.query('SELECT * FROM public."INFO_USER" as b, public."TRANGTHAI" as c, public."COQUAN" as d, public."PHUONG_XA" as e, public."QUAN_HUYEN" as f, public."TINH" as g, public."USER" as a where a.info_user = b.id and a.trangthai = c.id and a.coquan = d.id and d.ma_diachi = e.id and e.ma_quan_huyen = f.id and f.ma_tinh = g.id and a.id =' + i)
      .then(arr => {
        config.query('SELECT * FROM public."INFO_USER" as a, public."USER" as b WHERE b.info_user = a.id and b.username =' + "'" + req.user + "'")
          .then(title => {
            config.query('SELECT to_char("NGAYCAP",' + "'yyyy-MM-dd'" + ') FROM public."INFO_USER" where id =' + arr[0][0].info_user)
              .then(ncap => {
                config.query('SELECT to_char("NGAYSINH",' + "'yyyy-MM-dd'" + ') FROM public."INFO_USER" where id =' + arr[0][0].info_user)
                  .then(nsinh => {
                    res.render("admin/taikhoan/view.ejs", {
                      data1: arr,
                      data: title,
                      nc: ncap,
                      ns: nsinh,
                      layout: 'layouts/admin/layout_ad'
                    })
                  })
              })
          })
      })
  } else {
    res.redirect('/login');
  }
})

//Trang DUONGSU_CANHAN
app.get('/admin/duongsu_cn/', function(req, res){
  if (req.isAuthenticated()) {
    config.query('SELECT * FROM public."INFO_USER" as a, public."USER" as b WHERE b.info_user = a.id and b.username =' + "'" + req.user + "'")
      .then(title => {
        res.render('admin/duongsu/index_cn', {
          data: title,
          layout: 'layouts/admin/layout_ad'
        })
      })
  } else {
    res.redirect('/login');
  }
});
app.get('/admin/duongsu_cn/create',function(req, res){
  if (req.isAuthenticated()) {
    TINH.findAll({
        raw: true
      })
      .then(arrTinh => {
        config.query('SELECT * FROM public."INFO_USER" as a, public."USER" as b WHERE b.info_user = a.id and b.username =' + "'" + req.user + "'")
          .then(title => {
            res.render("admin/duongsu/create_cn.ejs", {
              data: title,
              data1: arrTinh,
              layout: 'layouts/admin/layout_ad'
            });
          })
      })
  } else {
    res.redirect('/login');
  }
})
app.post('/admin/duongsu_cn/create', urlencodedParser, function(req, res) {
  //Bảng duongsu
  var danhmuc = 1;
  var trangthai = 5;
  honnhan = req.body.hon_nhan;
  ghichu = req.body.ghichu;
  tinhtrang = req.body.tinhtrang;
  quoctich = req.body.quoctich;
  diachi = req.body.diachi;
  phuong = req.body.phuongxa;
  sdt = req.body.sdt;
  noicap = req.body.noicap;
  ngaycap = req.body.ngaycap;
  cmnd = req.body.cmnd;
  ngaysinh = req.body.ngaysinh;
  gioitinh = req.body.gioitinh;
  hoten = req.body.hoten;
  cmnd_vc = req.body.cmnd_vc;

  var us = -1;
  DUONGSU_CANHAN.findOne({
      where: {
        CMND: cmnd
      }
    })
    .then(DS => {
      if (DS != "") {
        us = 1;

      } else {
        us = 0;
        temp = -4; //Lỗi đương sự đã tồn tại
      }
    })
  if (us == 0) {
    res.redirect('/admin/duongsu_cn/create');
  } else if (cmnd == cmnd_vc) {
    temp = -5;
    res.redirect('/admin/duongsu_cn/create');
  }else {
      if(honnhan == "2"){
        //bảng hôn nhân
        so_dk = req.body.so_dk;
        so_quyen = req.body.so_quyen;
        ngaycap_gcn = req.body.ngaycap_gcn;
        noicap_gcn = req.body.noicap_gcn;

        HONNHAN.create({
          SO_DK: so_dk,
          QUYENSO: so_quyen,
          NGAYCAP_GCN: ngaycap_gcn,
          NOICAP_GCN: noicap_gcn
        })
        .then(hn => {
          //bảng duongsu_cn vợ/chồng
          var vochong_vc = hn.id;
          var danhmuc_vc = 1;
          var trangthai_vc = 5;
          honnhan_vc = 2;
          ghichu_vc = req.body.ghichu_vc;
          tinhtrang_vc = "Sống";
          quoctich_vc = req.body.quoctich_vc;
          diachi_vc = "";
          phuongxa_vc = "";
          sdt_vc = "";
          noicap_vc = req.body.noicap_vc;
          ngaycap_vc = req.body.ngaycap_vc;
          cmnd_vc = req.body.cmnd_vc;
          ngaysinh_vc = req.body.ngaysinh_vc;
          gioitinh_vc ="",
          hoten_vc = req.body.hoten_vc;
          //Sử lý đương sự v/c
          DUONGSU_CANHAN.findOne({
              where: {
                CMND: cmnd_vc
              }
            })
            .then(DSs => {
              if (DSs != null) {
                //Nếu tồn tại duong su v/c
                DUONGSU_CANHAN.update({
                  TT_HONNHAN: honnhan_vc,
                  vo_chong: vochong_vc
                }, {
                  where: {
                    id: DSs.id
                  }
                });
              } else {
                //nếu không tồn tại duong su v/c
                if(gioitinh == "Nam"){
                  gioitinh_vc = "Nữ";
                }else {
                  gioitinh_vc = "Nam";
                };
                dia_chi = req.body.dia_chi;
                if(dia_chi =="1"){
                   diachi_vc = diachi;
                   phuongxa_vc = phuong;
                }else {
                   diachi_vc = req.body.diachi_vc;
                   phuongxa_vc = req.body.phuongxa1;
                   sdt_vc = req.body.sdt_vc;
                };

                DUONGSU_CANHAN.create({
                  HOTEN: hoten_vc,
                  GIOITINH: gioitinh_vc,
                  NGAYSINH: ngaysinh_vc,
                  CMND: cmnd_vc,
                  SDT: sdt_vc,
                  NGAYCAP: ngaycap_vc,
                  NOICAP: noicap_vc,
                  QUOCTICH: quoctich_vc,
                  ma_diachi: phuongxa_vc,
                  DIACHI_SO: diachi_vc,
                  TINHTRANG: tinhtrang_vc,
                  tt_honnhan: honnhan_vc,
                  vo_chong: vochong_vc,
                  GHICHU: ghichu_vc,
                  trang_thai: trangthai_vc,
                  danh_muc: danhmuc_vc
                })
              }
            })
        //Lưu đương sự
        DUONGSU_CANHAN.create({
          HOTEN: hoten,
          GIOITINH: gioitinh,
          NGAYSINH: ngaysinh,
          CMND: cmnd,
          SDT: sdt,
          NGAYCAP: ngaycap,
          NOICAP: noicap,
          QUOCTICH: quoctich,
          ma_diachi: phuong,
          DIACHI_SO: diachi,
          TINHTRANG: tinhtrang,
          tt_honnhan: honnhan_vc,
          vo_chong: hn.id,
          GHICHU: ghichu,
          trang_thai: trangthai,
          danh_muc: danhmuc
        })
      })
      res.redirect('/admin/duongsu_cn')
    }else {
      //Sử lý nếu chưa kết hôn
      HONNHAN.create({
      })
      .then(hn => {
        DUONGSU_CANHAN.create({
          HOTEN: hoten,
          GIOITINH: gioitinh,
          NGAYSINH: ngaysinh,
          CMND: cmnd,
          SDT: sdt,
          NGAYCAP: ngaycap,
          NOICAP: noicap,
          QUOCTICH: quoctich,
          ma_diachi: phuong,
          DIACHI_SO: diachi,
          TINHTRANG: tinhtrang,
          tt_honnhan: honnhan,
          vo_chong: hn.id,
          GHICHU: ghichu,
          trang_thai: trangthai,
          danh_muc: danhmuc
        })
      })
        res.redirect('/admin/duongsu_cn')
    }
  }//Đóng diều kiện kiểm tra đương sự
})
app.get('/admin/duongsu_cn/edit/:id', function(req, res) {
  var gioitinhs = "";
  if (req.isAuthenticated()) {
    var i = req.params.id;
    config.query('SELECT * FROM public."TRANGTHAI" as g, public."TINHTRANG_HONNHAN" as f, public."HONNHAN" as e, public."TINH" as d, public."QUAN_HUYEN" as c, public."PHUONG_XA" as b , public."DUONGSU_CANHAN" as a where b.id = a.ma_diachi and c.id = b.ma_quan_huyen and d.id = c.ma_tinh and e.id = a.vo_chong and f.id = a.tt_honnhan and g.id = a.trang_thai and a.id =' + i)
      .then(arr => {
        TINH.findAll({
            where: {
              id: {
                [Op.ne]: arr[0][0].ma_tinh
              }
            }
          })
          .then(arrTinh => {
            QUAN_HUYEN.findAll({
                where: {
                  [Op.and]: [{
                    id: {
                      [Op.ne]: arr[0][0].ma_quan_huyen
                    }
                  }, {
                    ma_tinh: arr[0][0].ma_tinh
                  }]
                }
              })
              .then(arrqh => {
                PHUONG_XA.findAll({
                    where: {
                      [Op.and]: [{
                        id: {
                          [Op.ne]: arr[0][0].ma_diachi
                        }
                      }, {
                        ma_quan_huyen: arr[0][0].ma_quan_huyen
                      }]
                    }
                  })
                  .then(arrpx => {
                    if (arr[0][0].GIOITINH == "Nam") {
                      gioitinhs = "Nữ";
                    } else {
                      gioitinhs = "Nam";
                    }
                    config.query('SELECT to_char("NGAYCAP",' + "'yyyy-MM-dd'" + ') FROM public."DUONGSU_CANHAN" where id =' + arr[0][0].id)
                      .then(ncap => {
                        config.query('SELECT to_char("NGAYSINH",' + "'yyyy-MM-dd'" + ') FROM public."DUONGSU_CANHAN" where id =' + arr[0][0].id)
                          .then(nsinh => {
                            TRANGTHAI.findAll({
                                where: {
                                  [Op.and]: [{
                                    id: {
                                      [Op.ne]: arr[0][0].trang_thai
                                    }
                                  }, {
                                    APDUNG: "DUONGSU"
                                  }]
                                }
                              })
                              .then(tthai => {
                                //sử lý đương sự vợ chồng
                                config.query('SELECT * FROM public."INFO_USER" as a, public."USER" as b WHERE b.info_user = a.id and b.username =' + "'" + req.user + "'")
                                  .then(title => {
                                    TINHTRANG_HONNHAN.findAll({
                                        where: {
                                          TEN_TT_HONNHAN: {
                                            [Op.ne]: arr[0][0].TEN_TT_HONNHAN
                                          }
                                        }
                                      })
                                      .then(tt_hn => {
                                        config.query('SELECT * FROM public."TRANGTHAI" as g, public."TINHTRANG_HONNHAN" as f, public."HONNHAN" as e, public."TINH" as d, public."QUAN_HUYEN" as c, public."PHUONG_XA" as b , public."DUONGSU_CANHAN" as a where b.id = a.ma_diachi and c.id = b.ma_quan_huyen and d.id = c.ma_tinh and e.id = a.vo_chong and f.id = a.tt_honnhan and g.id = a.trang_thai and a.id !=' + i+' and a.vo_chong = '+arr[0][0].vo_chong)
                                          .then(arr_vc => {
                                            config.query('SELECT to_char("NGAYCAP_GCN",' + "'yyyy-MM-dd'" + ') FROM public."HONNHAN" where id =' + arr[0][0].vo_chong)
                                              .then(ncap_gcn => {
                                                config.query('SELECT to_char("NGAYCAP",' + "'yyyy-MM-dd'" + ') FROM public."DUONGSU_CANHAN" where id !=' + arr[0][0].id+'and vo_chong = '+  arr[0][0].vo_chong)
                                                  .then(ncap_vc => {
                                                    config.query('SELECT to_char("NGAYSINH",' + "'yyyy-MM-dd'" + ') FROM public."DUONGSU_CANHAN" where id !=' + arr[0][0].id+'and vo_chong = '+  arr[0][0].vo_chong)
                                                      .then(nsinh_vc => {
                                                        TINH.findAll({
                                                            where: {
                                                              id: {
                                                                [Op.ne]: arr_vc[0][0].ma_tinh
                                                              }
                                                            }
                                                          })
                                                          .then(arrTinh_vc => {
                                                            QUAN_HUYEN.findAll({
                                                                where: {
                                                                  [Op.and]: [{
                                                                    id: {
                                                                      [Op.ne]: arr_vc[0][0].ma_quan_huyen
                                                                    }
                                                                  }, {
                                                                    ma_tinh: arr_vc[0][0].ma_tinh
                                                                  }]
                                                                }
                                                              })
                                                              .then(arrqh_vc => {
                                                                PHUONG_XA.findAll({
                                                                    where: {
                                                                      [Op.and]: [{
                                                                        id: {
                                                                          [Op.ne]: arr_vc[0][0].ma_diachi
                                                                        }
                                                                      }, {
                                                                        ma_quan_huyen: arr_vc[0][0].ma_quan_huyen
                                                                      }]
                                                                    }
                                                                  })
                                                                  .then(arrpx_vc => {
                                                                    res.render("admin/duongsu/edit_cn.ejs", {
                                                                      data1: arr,
                                                                      data2: arrqh,
                                                                      data3: arrpx,
                                                                      data4: arrTinh,
                                                                      data: title,
                                                                      gt: gioitinhs,
                                                                      nc: ncap,
                                                                      ns: nsinh,
                                                                      tt: tthai,
                                                                      hn: tt_hn,
                                                                      data_vc: arr_vc,
                                                                      nc_gcn: ncap_gcn,
                                                                      nc_vc: ncap_vc,
                                                                      ns_vc: nsinh_vc,
                                                                      data2_vc: arrqh_vc,
                                                                      data3_vc: arrpx_vc,
                                                                      data4_vc: arrTinh_vc,
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
                                  })
                              })
                          })
                      })
                  })
              })
          })
      })
  } else {
    res.redirect('/login');
  }
})
app.post('/admin/duongsu_cn/edit/:id', urlencodedParser, function(req, res) {
  var i = req.params.id;
  //Bảng duongsu
  var danhmuc = 1;
  var trangthai = 5;
  honnhan = req.body.hon_nhan;
  ghichu = req.body.ghichu;
  tinhtrang = req.body.tinhtrang;
  quoctich = req.body.quoctich;
  diachi = req.body.diachi;
  phuong = req.body.phuongxa;
  sdt = req.body.sdt;
  noicap = req.body.noicap;
  ngaycap = req.body.ngaycap;
  cmnd = req.body.cmnd;
  ngaysinh = req.body.ngaysinh;
  gioitinh = req.body.gioitinh;
  hoten = req.body.hoten;
  cmnd_vc = req.body.cmnd_vc;

  var us = -1;
  DUONGSU_CANHAN.findOne({
      where: {
        CMND: cmnd
      }
    })
    .then(DS => {
      if (DS != "") {
        us = 1;

      } else {
        us = 0;
        temp = -4; //Lỗi đương sự đã tồn tại
      }
    })
  if (us == 0) {
    res.redirect('/admin/duongsu_cn/create');
  } else if (cmnd == cmnd_vc) {
    temp = -5;
    res.redirect('/admin/duongsu_cn/create');
  }else {
      if(honnhan == "2"){
        //bảng hôn nhân
        so_dk = req.body.so_dk;
        so_quyen = req.body.so_quyen;
        ngaycap_gcn = req.body.ngaycap_gcn;
        noicap_gcn = req.body.noicap_gcn;

        HONNHAN.create({
          SO_DK: so_dk,
          QUYENSO: so_quyen,
          NGAYCAP_GCN: ngaycap_gcn,
          NOICAP_GCN: noicap_gcn
        })
        .then(hn => {
          //bảng duongsu_cn vợ/chồng
          var vochong_vc = hn.id;
          var danhmuc_vc = 1;
          var trangthai_vc = 5;
          honnhan_vc = 2;
          ghichu_vc = req.body.ghichu_vc;
          tinhtrang_vc = "Sống";
          quoctich_vc = req.body.quoctich_vc;
          diachi_vc = "";
          phuongxa_vc = "";
          sdt_vc = "";
          noicap_vc = req.body.noicap_vc;
          ngaycap_vc = req.body.ngaycap_vc;
          cmnd_vc = req.body.cmnd_vc;
          ngaysinh_vc = req.body.ngaysinh_vc;
          gioitinh_vc ="",
          hoten_vc = req.body.hoten_vc;
          //Sử lý đương sự v/c
          DUONGSU_CANHAN.findOne({
              where: {
                CMND: cmnd_vc
              }
            })
            .then(DSs => {
              if (DSs != null) {
                //Nếu tồn tại duong su v/c
                DUONGSU_CANHAN.update({
                  TT_HONNHAN: honnhan_vc,
                  vo_chong: vochong_vc
                }, {
                  where: {
                    id: DSs.id
                  }
                });
              } else {
                //nếu không tồn tại duong su v/c
                if(gioitinh == "Nam"){
                  gioitinh_vc = "Nữ";
                }else {
                  gioitinh_vc = "Nam";
                };
                dia_chi = req.body.dia_chi;
                if(dia_chi =="1"){
                   diachi_vc = diachi;
                   phuongxa_vc = phuong;
                }else {
                   diachi_vc = req.body.diachi_vc;
                   phuongxa_vc = req.body.phuongxa1;
                   sdt_vc = req.body.sdt_vc;
                };

                DUONGSU_CANHAN.create({
                  HOTEN: hoten_vc,
                  GIOITINH: gioitinh_vc,
                  NGAYSINH: ngaysinh_vc,
                  CMND: cmnd_vc,
                  SDT: sdt_vc,
                  NGAYCAP: ngaycap_vc,
                  NOICAP: noicap_vc,
                  QUOCTICH: quoctich_vc,
                  ma_diachi: phuongxa_vc,
                  DIACHI_SO: diachi_vc,
                  TINHTRANG: tinhtrang_vc,
                  tt_honnhan: honnhan_vc,
                  vo_chong: vochong_vc,
                  GHICHU: ghichu_vc,
                  trang_thai: trangthai_vc,
                  danh_muc: danhmuc_vc
                })
              }
            })
        //Lưu đương sự
        DUONGSU_CANHAN.create({
          HOTEN: hoten,
          GIOITINH: gioitinh,
          NGAYSINH: ngaysinh,
          CMND: cmnd,
          SDT: sdt,
          NGAYCAP: ngaycap,
          NOICAP: noicap,
          QUOCTICH: quoctich,
          ma_diachi: phuong,
          DIACHI_SO: diachi,
          TINHTRANG: tinhtrang,
          tt_honnhan: honnhan_vc,
          vo_chong: hn.id,
          GHICHU: ghichu,
          trang_thai: trangthai,
          danh_muc: danhmuc
        })
      })
      res.redirect('/admin/duongsu_cn')
    }else {
      //Sử lý nếu chưa kết hôn
      HONNHAN.create({
      })
      .then(hn => {
        DUONGSU_CANHAN.create({
          HOTEN: hoten,
          GIOITINH: gioitinh,
          NGAYSINH: ngaysinh,
          CMND: cmnd,
          SDT: sdt,
          NGAYCAP: ngaycap,
          NOICAP: noicap,
          QUOCTICH: quoctich,
          ma_diachi: phuong,
          DIACHI_SO: diachi,
          TINHTRANG: tinhtrang,
          tt_honnhan: honnhan,
          vo_chong: hn.id,
          GHICHU: ghichu,
          trang_thai: trangthai,
          danh_muc: danhmuc
        })
      })
        res.redirect('/admin/duongsu_cn')
    }
  }//Đóng diều kiện kiểm tra đương sự
})

//Lắng nghe kết nối tới Server
io.on("connection", function(socket) {
  console.log("Có người kết nối kìa!" + socket.id);
  socket.on("disconnect", function() {
    console.log(socket.id + " ngắt kết nối!!");
  });
  socket.on("trangchu_sendData_QH", function(data) {
    // Gửi về cho tất cả người dùng
    // io.sockets.emit("server_send_data", data+"8989");
    // Gửi về cho tất cả người dùng nhưng k gửi lại người đã gửi
    // io.broadcast.emit("server_send_data", data+"8989");
    // Gửi về cho người đã send
    QUAN_HUYEN.findAll({
        where: {
          ma_tinh: data
        }
      })
      .then(arrQH => {
        socket.emit("server_sendData_QH", arrQH);
      })
      .catch(err => console.log(err.message))
  });
  socket.on("trangchu_sendData_PX", function(data) {
    PHUONG_XA.findAll({
        where: {
          ma_quan_huyen: data
        }
      })
      .then(arrPX => {
        socket.emit("server_sendData_PX", arrPX);
      })
      .catch(err => console.log(err.message))
  });
  socket.emit("server_sendData_info", temp);
  temp = 0;
  config.query('SELECT * FROM public."INFO_USER" as b, public."TRANGTHAI" as c, public."COQUAN" as d, public."PHUONG_XA" as e, public."QUAN_HUYEN" as f, public."TINH" as g,  public."USER" as a where a.info_user = b.id and a.trangthai = c.id and a.coquan = d.id and d.ma_diachi = e.id and e.ma_quan_huyen = f.id and f.ma_tinh = g.id')
    .then(arr => {
      socket.emit("server_sendData_dsUser", arr);
    });
  config.query('SELECT * FROM  public."TINHTRANG_HONNHAN" as b, public."PHUONG_XA" as e, public."QUAN_HUYEN" as f, public."TINH" as g, public."DUONGSU_CANHAN" as a where a.ma_diachi = e.id and e.ma_quan_huyen = f.id and f.ma_tinh = g.id and b.id  = a.tt_honnhan')
    .then(arr => {
      socket.emit("server_sendData_dsDSCN", arr);
    });
  config.query('SELECT to_char("NGAYSINH",' + "'dd/MM/yyyy'" + '), id FROM public."DUONGSU_CANHAN"')
    .then(nsinh => {
      socket.emit("server_sendData_dsDSCN_ns", nsinh);
    })
})
