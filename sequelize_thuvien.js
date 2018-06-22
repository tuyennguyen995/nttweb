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

//Tao bảng trong sql
const USER = config.define('USER',{
  username: sequelize.STRING,
  password: sequelize.STRING
})
//Đồng bộ với sql
config.sync()

//Tạo bảng dữ liệu
USER.create({
  username: 'admin',
  password: 'admin'
}).then(USER => console.log(USER.get({plain: true})))

//update dữ liệu
USER.update({
  username: 'mng',
  password: 'mng'
},{
  where: {id: 2}
}).then(row => console.log(row))

//Xóa dữ liệu
USER.destroy({
  where: {
    id: 2
  }
})
.then(row => console.log(row))
//Tìm 1 hàng dữ liệu
USER.findOne({raw: true})
.then(USER => console.log(USER))

//Tìm nhiều hàng
USER.findAll({raw: true})
.then(arrUSER => arrUSER.forEach(USER => console.log(USER)))

//Tìm theo ID
USER.findById(1,{raw: true})
.then(USER => console.log(USER))
