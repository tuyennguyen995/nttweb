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


$('#group_honnhan').append('<hr/>'+
                    '<div class="row">'+
                    '<div class="form-group col-md-4" style="margin-left: 5px;">'+
                      '<label>Họ tên Vợ/Chồng*</label>'+
                      '<input required class="form-control" value = "'+"<%= data_vc[0][0].HOTEN%>"+'" name="hoten_vc" type="text" autofocus autocomplete="off">'+
                    '</div>'+
                    '<div class="form-group col-md-4" style="margin-left: 5px;">'+
                      '<label>Ngày sinh *</label>'+
                      '<input required class="form-control" value = "'+"<%= ns_vc[0][0].to_char%>"+'"  name="ngaysinh_vc" type="date" autofocus autocomplete="off">'+
                    '</div>'+
                    '<div class="form-group col-md-4" style="margin-left: 5px;">'+
                      '<label>Số CMND *</label>'+
                      '<input required class="form-control" value = "'+"<%= data_vc[0][0].CMND%>"+'" name="cmnd_vc" type="text" autofocus autocomplete="off">'+
                    '</div>'+
                    '<div class="form-group col-md-4" style="margin-left: 5px;">'+
                      '<label>Ngày cấp *</label>'+
                      '<input required class="form-control" value = "'+"<%= nc_vc[0][0].to_char%>"+'" name="ngaycap_vc" type="date" autofocus autocomplete="off">'+
                    '</div>'+
                    '<div class="form-group col-md-4" style="margin-left: 5px;">'+
                      '<label>Nơi cấp *</label>'+
                      '<input required class="form-control" value = "'+"<%= data_vc[0][0].NOICAP%>"+'" name="noicap_vc" type="rext" autofocus autocomplete="off">'+
                    '</div>'+
                    '<div class="form-group col-md-4" style="margin-left: 5px;">'+
                      '<label>Quốc Tịch*</label>'+
                      '<input required class="form-control" value = "'+"<%= data_vc[0][0].QUOCTICH%>"+'" name="quoctich_vc" type="text" autofocus autocomplete="off">'+
                    '</div>'+
                    '<div class="form-group col-md-4" style="margin-left: 5px;">'+
                      '<label>Ghi chú</label>'+
                      '<input  class="form-control" value = "'+"<%= data_vc[0][0].GHICHU%>"+'" name="ghichu_vc" type="text" autofocus autocomplete="off">'+
                    '</div>'+
                  '</div>'+
                  '<hr/>'+
                  '<div class="row">'+
                    '<div class="form-group col-md-4" style="margin-left: 5px;">'+
                      '<label>Địa chỉ *</label>'+
                      '<select class="form-control" name="dia_chi" id="dia_chi" onchange="getSelect6();">'+
                                '<option value="1">Cùng địa chỉ</option>'+
                                '<option value="2">Khác</option>'+
                              '</select>'+
                    '</div>'+
                  '</div>'+
                  '<div class="row" id="diachi_vc">'+
                  '</div>'+
                  '<hr/>'+
                  '<div class="row">'+
                    '<div class="form-group col-md-4" style="margin-left: 5px;">'+
                      '<label>Số đăng ký kết hôn*</label>'+
                      '<input required class="form-control" value = "'+"<%= data1[0][0].SO_DK%>"+'" name="so_dk" type="text" autofocus autocomplete="off">'+
                    '</div>'+
                    '<div class="form-group col-md-4" style="margin-left: 5px;">'+
                      '<label>Quyển số*</label>'+
                      '<input required class="form-control" value = "'+"<%= data1[0][0].QUYENSO%>"+'" name="so_quyen" type="text" autofocus autocomplete="off">'+
                    '</div>'+
                    '<div class="form-group col-md-4" style="margin-left: 5px;">'+
                      '<label>Ngày cấp *</label>'+
                      '<input required class="form-control" value = "'+"<%= nc_gcn[0][0].to_char%>"+'" name="ngaycap_gcn" type="date" autofocus autocomplete="off">'+
                    '</div>'+
                    '<div class="form-group col-md-4" style="margin-left: 5px;">'+
                      '<label>Nơi cấp*</label>'+
                      '<input required class="form-control" value = "'+"<%= data1[0][0].NOICAP_GCN%>"+'" name="noicap_gcn" type="text" autofocus autocomplete="off">'+
                    '</div>'+
                  '</div>'
                );
                // var ma_dc = "<%= data1[0][0].ma_diachi%>"
                // var ma_dc_vc = "<%= data_vc[0][0].ma_diachi%>"
                // var dc_so = "<%= data1[0][0].DIACHI_SO%>"
                // var dc_so_vc = "<%= data_vc[0][0].DIACHI_SO%>"
                // if (ma_dc != ma_dc_vc && dc_so != dc_so_vc) {
                //   $('#dia_chi').html("");
                //   $('#dia_chi').append('<option value="2">Khác</option>'+ '<option value="1">Cùng địa chỉ</option>');
                //   $('#diachi_vc').append('<div class="form-group col-md-4" style="margin-left: 5px;">'+
                //     '<label for="tinhthanh">Tỉnh thành </label>'+
                //     '<select class="form-control" name="tinhthanh_vc" id="tinhthanh_vc" onchange="getSelect4();">'+
                //                 '<option value="'+<%=data_vc[0][0].ma_tinh%>+'">'+"<%=data_vc[0][0].TEN_TINH%>"+'</option>'+
                //                 '<% data4_vc.forEach(function(ds){ %>'+
                //                     '<option value="<%= ds.id%>"><%= ds.TEN_TINH%></option>'+
                //                 '<%})%>'+
                //               '</select>'+
                //   '</div>'+
                //   '<div class="form-group col-md-4" style="margin-left: 5px;">'+
                //     '<div id="quanhuyen_vc" onchange="getSelect5();">'+
                //       '<label for="quanhuyen">Quận/Huyện </label>'+
                //       '<select class="form-control" name="" id="quanhuyen1">'+
                //                   '<option value="'+<%=data_vc[0][0].ma_quan_huyen%>+'">'+"<%=data_vc[0][0].TEN_QUAN_HUYEN%>"+'</option>'+
                //                   '<% data2_vc.forEach(function(ds){ %>'+
                //                       '<option value="<%= ds.id%>"><%= ds.TEN_QUAN_HUYEN%></option>'+
                //                   '<%})%>'+
                //                 '</select>'+
                //     '</div>'+
                //   '</div>'+
                //   '<div class="form-group col-md-4" style="margin-left: 5px;">'+
                //     '<div id="phuongxa_vc">'+
                //       '<label for="phuongxa">Phường/Xã </label>'+
                //       '<select class="form-control" name="phuongxa1" id="phuongxa1">'+
                //                   '<option value="'+<%=data_vc[0][0].ma_diachi%>+'">'+"<%=data_vc[0][0].TEN_PHUONG_XA%>"+'</option>'+
                //                   '<% data3_vc.forEach(function(ds){ %>'+
                //                       '<option value="<%= ds.id%>"><%= ds.TEN_PHUONG_XA%></option>'+
                //                   '<%})%>'+
                //                 '</select>'+
                //     '</div>'+
                //   '</div>'+
                //   '<div class="form-group col-md-4" style="margin-left: 5px;">'+
                //     '<label>Địa chỉ (Số/Đường/Khóm/Ấp) *</label>'+
                //     '<input required class="form-control" value="'+"<%=data_vc[0][0].DIACHI_SO%>"+'" name="diachi_vc" type="text" autofocus autocomplete="off">'+
                //   '</div>'+
                //   '<div class="form-group col-md-4" style="margin-left: 5px;">'+
                //     '<label>Số điện thoại</label>'+
                //     '<input class="form-control" value="'+"<%=data_vc[0][0].SDT%>"+'" name="sdt_vc" type="text" autofocus autocomplete="off">'+
                //   '</div>'
                //                   );
                $('#diachi_vc').append('<div class="form-group col-md-4" style="margin-left: 5px;">'+
                  '<label for="tinhthanh">Tỉnh thành </label>'+
                  '<select class="form-control" name="tinhthanh_vc" id="tinhthanh_vc" onchange="getSelect4();">'+
                              '<option value="'+<%=data_vc[0][0].ma_tinh%>+'">'+"<%=data_vc[0][0].TEN_TINH%>"+'</option>'+
                              '<% data4_vc.forEach(function(ds){ %>'+
                                  '<option value="<%= ds.id%>"><%= ds.TEN_TINH%></option>'+
                              '<%})%>'+
                            '</select>'+
                '</div>'+
                '<div class="form-group col-md-4" style="margin-left: 5px;">'+
                  '<div id="quanhuyen_vc" onchange="getSelect5();">'+
                    '<label for="quanhuyen">Quận/Huyện </label>'+
                    '<select class="form-control" name="" id="quanhuyen1">'+
                                '<option value="'+<%=data_vc[0][0].ma_quan_huyen%>+'">'+"<%=data_vc[0][0].TEN_QUAN_HUYEN%>"+'</option>'+
                                '<% data2_vc.forEach(function(ds){ %>'+
                                    '<option value="<%= ds.id%>"><%= ds.TEN_QUAN_HUYEN%></option>'+
                                '<%})%>'+
                              '</select>'+
                  '</div>'+
                '</div>'+
                '<div class="form-group col-md-4" style="margin-left: 5px;">'+
                  '<div id="phuongxa_vc">'+
                    '<label for="phuongxa">Phường/Xã </label>'+
                    '<select class="form-control" name="phuongxa1" id="phuongxa1">'+
                                '<option value="'+<%=data_vc[0][0].ma_diachi%>+'">'+"<%=data_vc[0][0].TEN_PHUONG_XA%>"+'</option>'+
                                '<% data3_vc.forEach(function(ds){ %>'+
                                    '<option value="<%= ds.id%>"><%= ds.TEN_PHUONG_XA%></option>'+
                                '<%})%>'+
                              '</select>'+
                  '</div>'+
                '</div>'+
                '<div class="form-group col-md-4" style="margin-left: 5px;">'+
                  '<label>Địa chỉ (Số/Đường/Khóm/Ấp) *</label>'+
                  '<input required class="form-control" value="'+"<%=data_vc[0][0].DIACHI_SO%>"+'" name="diachi_vc" type="text" autofocus autocomplete="off">'+
                '</div>'+
                '<div class="form-group col-md-4" style="margin-left: 5px;">'+
                  '<label>Số điện thoại</label>'+
                  '<input class="form-control" value="'+"<%=data_vc[0][0].SDT%>"+'" name="sdt_vc" type="text" autofocus autocomplete="off">'+
                '</div>'
                                );
