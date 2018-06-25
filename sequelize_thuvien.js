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

<script>
  function getSelect1(){
    var temp = "";
    var Sel1 = document.getElementById("list1").value;
    console.log(Sel1);
    if(Sel1 == ""){
      document.getElementById('list2').style.visibility = 'hidden';
      document.getElementById('list3').style.visibility = 'hidden';
    }else if(Sel1 != null) {
      //Xử lý khi chọn select
      const socket = io("https://nttweb.herokuapp.com");
      socket.emit("trangchu_sendData_QH",Sel1);
      socket.on("server_sendData_QH", function(data){
        $('#quanhuyen').html("<option value='"+temp+"'>-- Chọn Quận/Huyện --</option>");
        for(var i = 0; i < data.length; i++){
          console.log(data[i].TEN_QUAN_HUYEN);
          $('#quanhuyen').append("<option value='"+data[i].id+"'>"+data[i].TEN_QUAN_HUYEN+"</option>");
        }
      });
      document.getElementById('list2').style.visibility = 'visible';
    }else {
      document.getElementById('list2').style.visibility = 'hidden';
      document.getElementById('list3').style.visibility = 'hidden';
    }
    return false;
  }
</script>
<script>
function getSelect2(){
  var Sel1 = document.getElementById("quanhuyen").value;
  console.log(Sel1);
  if(Sel1 == ""){
    document.getElementById('list3').style.visibility = 'hidden';
  }else if(Sel1 != null) {
    //Xử lý khi chọn select
    //Khi up ken heruku nho thay doi địc chỉ này
    const socket = io("https://nttweb.herokuapp.com");
    socket.emit("trangchu_sendData_PX",Sel1);
    socket.on("server_sendData_PX", function(data){
      $('#phuongxa').html("<option>-- Chọn Phường/Xã --</option>");
      for(var i = 0; i < data.length; i++){
        console.log(data[i].TEN_PHUONG_XA);
        $('#phuongxa').append("<option value='"+data[i].id+"'>"+data[i].TEN_PHUONG_XA+"</option>");
      }
    });
    document.getElementById('list3').style.visibility = 'visible';
  }else {
    document.getElementById('list3').style.visibility = 'hidden';
  }
  return false;
}
</script>
<h1 id="home">Trang chủ</h1>
<div>
  <label for="tinhthanh">Tỉnh thành </label>
  <select class="" name="tinhthanh" id="list1" onchange="getSelect1();">
    <option value="">-- Chọn Tỉnh thành --</option>
    <% data1.forEach(function(ds){ %>
        <option value='<%= ds.id%>'><%= ds.TEN_TINH%></option>
    <%})%>
  </select>
</div>

<div id="list2" style="visibility: hidden;" onchange="getSelect2();">
  <label for="quanhuyen">Quận/Huyện </label>
  <select class="" name="" id="quanhuyen">
    <option value="">-- Chọn Quận/Huyện --</option>
  </select>
</div>
<div id="list3" style="visibility: hidden;">
  <label for="phuongxa">Quận/Huyện </label>
  <select class="" name="" id="phuongxa">
    <option value="">-- Chọn Phường/Xã --</option>
  </select>
</div>
