// Tải sidebar
fetch("sidebar.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("sidebar").innerHTML = data;
  });

// Lấy danh sách lương từ API và hiển thị trong bảng
function fetchSalaries() {
  fetch("http://localhost/qlns_clone/php/getSalary.php?action=get")
    .then((response) => response.json())
    .then((data) => {
      const salaryBody = document.getElementById("salary-body");
      salaryBody.innerHTML = ""; // Xóa nội dung cũ

      data.forEach((salary) => {
        const newRow = `<tr>
                          <td>${salary.MaLuong}</td>
                          <td>${salary.MaNhanVien}</td>
                          <td>${salary.LuongCoBan.toLocaleString()} VND</td>
                          <td>${salary.PhuCap.toLocaleString()} VND</td>
                          <td>${salary.Thuong.toLocaleString()} VND</td>
                          <td>${salary.KhauTru.toLocaleString()} VND</td>
                          <td>${salary.LuongThucLanh.toLocaleString()} VND</td>
                        </tr>`;
        salaryBody.insertAdjacentHTML("beforeend", newRow);
      });
    })
    .catch((error) => {
      console.error("Lỗi khi tải dữ liệu lương:", error);
    });
}

// Gọi hàm fetchSalaries khi trang được tải
document.addEventListener("DOMContentLoaded", fetchSalaries);