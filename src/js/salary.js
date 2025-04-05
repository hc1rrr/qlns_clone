// Tải sidebar
fetch("../html/sidebar.html")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Không thể tải sidebar");
    }
    return response.text();
  })
  .then((data) => {
    document.getElementById("sidebar").innerHTML = data;
  })
  .catch((error) => {
    console.error("Lỗi khi tải sidebar:", error);
  });

// Lấy danh sách lương từ API và hiển thị trong bảng
function fetchSalaries() {
  fetch("http://localhost/qlns_clone/php/getSalary.php?action=get")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu lương");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Dữ liệu trả về từ API:", data); // Kiểm tra dữ liệu trả về từ API
      const salaryBody = document.getElementById("salary-body");
      salaryBody.innerHTML = ""; // Xóa nội dung cũ

      data.forEach((salary) => {
        const newRow = `<tr>
                          <td>${salary.MaLuong}</td>
                          <td>${salary.MaNhanVien}</td>
                          <td>${salary.TenNhanVien}</td>
                          <td>${salary.NgayCong}</td>
                          <td>${salary.TangCa}</td>
                          <td>${parseFloat(salary.KhauTru).toLocaleString()} VND</td>
                          <td>${parseFloat(salary.LuongThucLanh).toLocaleString()} VND</td>
                          <td>${salary.KyTraLuong ? new Date(salary.KyTraLuong).toLocaleDateString("vi-VN") : "Chưa cập nhật"}</td>
                        </tr>`;
        salaryBody.insertAdjacentHTML("beforeend", newRow);
      });
    })
    .catch((error) => {
      console.error("Lỗi khi tải dữ liệu lương:", error);
      alert("Đã xảy ra lỗi khi tải dữ liệu lương.");
    });
}

// Gọi hàm fetchSalaries khi trang được tải
document.addEventListener("DOMContentLoaded", fetchSalaries);