document.addEventListener("DOMContentLoaded", function () {
    const salaryInput = document.getElementById("employee-salary");
  
    fetch("sidebar.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("sidebar").innerHTML = data;
        })
        .catch(error => console.error("Lỗi tải sidebar:", error));
  
    loadEmployees();
  });
  
  function formatDate(dateString) {
      if (!dateString) return "N/A"; // Nếu không có ngày sinh
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
  }
  
  function formatDateDisplay(dateString) {
      if (!dateString) return "Chưa cập nhật";
      const parts = dateString.split("-");
      if (parts.length === 3) {
          return `${parts[2]}/${parts[1]}/${parts[0]}`; // Chuyển từ yyyy-mm-dd sang dd/mm/yyyy
      }
      return dateString;
  }
  
  function loadEmployees() {
    fetch("http://localhost/qlns_clone/php/getEmployee.php?action=get")
        .then(response => response.json())
        .then(data => {
            if (data.success && Array.isArray(data.data)) {
                const employeeBody = document.getElementById("employee-body");
                employeeBody.innerHTML = "";
                data.data.forEach(employee => {
                    let row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${employee.MaNhanVien}</td>
                        <td>${employee.HoTen}</td>
                        <td>${employee.GioiTinh}</td>
                       <td>${formatDateDisplay(employee.NgaySinh)}</td>  <!-- Cập nhật ở đây -->
                        <td>${employee.DiaChi}</td>
                        <td>${employee.Email ?? "N/A"}</td>
                        <td>${employee.SDT}</td>
                        <td>${employee.MaChucVu}</td>
                        <td>${employee.MaPhongban}</td>
                        <td>${employee.Luong }</td>
                        <td>
                            <button class="edit-btn" onclick="editEmployee('${employee.MaNhanVien}')">Sửa</button>
                            <button class="delete-btn" onclick="deleteEmployee('${employee.MaNhanVien}')">Xóa</button>
                        </td>
                    `;
                    employeeBody.appendChild(row);
                });
            } else {
                console.error("Lỗi từ server:", data.message);
            }
        })
        .catch(error => console.error("Lỗi khi tải dữ liệu nhân viên:", error));
  }
  
  function openEmployeeModal(employee = null) {
    const modalHtml = `
        <div class="modal" id="employee-modal">
            <div class="modal-content">
                <span class="close-btn" onclick="closeEmployeeModal()">&times;</span>
                <h3>${employee ? "Chỉnh sửa nhân viên" : "Thêm nhân viên"}</h3>
                <input type="text" id="employee-id" placeholder="Mã nhân viên" value="${employee ? employee.MaNhanVien : ""}">
                <input type="text" id="employee-name" placeholder="Tên nhân viên" value="${employee ? employee.HoTen : ""}">
                <div>
                    <label>Giới tính:</label>
                    <label><input type="radio" name="gender" value="Nam" ${employee && employee.GioiTinh === 'Nam' ? 'checked' : ''}> Nam</label>
                    <label><input type="radio" name="gender" value="Nữ" ${employee && employee.GioiTinh === 'Nữ' ? 'checked' : ''}> Nữ</label>
                </div>
                <input type="date" id="employee-dob" value="${employee ? employee.NgaySinh : ""}">
                <input type="text" id="employee-address" placeholder="Địa chỉ" value="${employee ? employee.DiaChi : ""}">
                <input type="email" id="employee-email" placeholder="Email" value="${employee ? employee.Email : ""}">
                <input type="text" id="employee-phone" placeholder="Số điện thoại" value="${employee ? employee.SDT : ""}">
                <input type="text" id="employee-position" placeholder="Chức vụ" value="${employee ? employee.MaChucVu : ""}">
                <input type="text" id="employee-department" placeholder="Phòng ban" value="${employee ? employee.MaPhongban : ""}">
                <input type="text" id="employee-salary" placeholder="Lương" value="${employee ? employee.Luong : ""}">
                <button class="save-btn" onclick="${employee ? `updateEmployee('${employee.MaNhanVien}')` : "saveEmployee()"}">${employee ? "Cập nhật" : "Lưu"}</button>
            </div>
        </div>`;
    document.body.insertAdjacentHTML("beforeend", modalHtml);
  }
  
  function closeEmployeeModal() {
    document.getElementById("employee-modal")?.remove();
  }
  
  function formatDateDisplay(dateString) {
      if (!dateString) return "Chưa cập nhật";
      const parts = dateString.split("-");
      return `${parts[2]}/${parts[1]}/${parts[0]}`; // Chuyển YYYY-MM-DD thành DD/MM/YYYY
  }
  
  function saveEmployee() {
      const newEmployee = {
          MaNhanVien: document.getElementById("employee-id").value,
          HoTen: document.getElementById("employee-name").value,
          GioiTinh: document.querySelector('input[name="gender"]:checked')?.value,
          NgaySinh: document.getElementById("employee-dob").value,
          DiaChi: document.getElementById("employee-address").value,
          Email: document.getElementById("employee-email").value,
          SDT: document.getElementById("employee-phone").value,
          MaChucVu: document.getElementById("employee-position").value,
          MaPhongban: document.getElementById("employee-department").value,
          Luong: document.getElementById("employee-salary").value.replace(/[^0-9]/g, "")
      };
    
      if (!newEmployee.MaNhanVien || !newEmployee.HoTen || !newEmployee.GioiTinh) {
          alert("Vui lòng nhập đầy đủ thông tin cần thiết!");
          return;
      }
    
      fetch("http://localhost/qlns_clone/php/getEmployee.php?action=add", {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify(newEmployee)
      })
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              alert("Thêm nhân viên thành công!");
              loadEmployees();  // Load lại danh sách nhân viên từ server
              closeEmployeeModal();
          } else {
              alert("Lỗi khi thêm nhân viên: " + data.message);
          }
      })
      .catch(error => console.error("Lỗi khi gửi yêu cầu thêm nhân viên:", error));
    }
    
  
  function deleteEmployee(maNhanVien) {
      if (!confirm("Bạn có chắc muốn xóa nhân viên này?")) return;
  
      fetch("http://localhost/qlns_clone/php/getEmployee.php?action=delete", {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify({ MaNhanVien: maNhanVien })
      })
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              alert("Xóa thành công!");
              loadEmployees(); // Cập nhật lại danh sách nhân viên
          } else {
              alert("Lỗi khi xóa: " + data.message);
          }
      })
      .catch(error => console.error("Lỗi khi gửi yêu cầu xóa:", error));
  }
  
  function editEmployee(maNhanVien) {
    document.querySelectorAll("#employee-body tr").forEach(row => {
        if (row.cells[0].textContent === maNhanVien) {
            const employee = {
                MaNhanVien: row.cells[0].textContent,
                HoTen: row.cells[1].textContent,
                GioiTinh: row.cells[2].textContent,
                NgaySinh: row.cells[3].textContent,
                DiaChi: row.cells[4].textContent,
                Email: row.cells[5].textContent,
                SDT: row.cells[6].textContent,
                MaChucVu: row.cells[7].textContent,
                MaPhong: row.cells[8].textContent,
                Luong: row.cells[9].textContent.replace(/[^0-9]/g, "")
            };
            openEmployeeModal(employee);
        }
    });
  }
  function updateEmployee(maNhanVien) {
      const updatedEmployee = {
          MaNhanVien: maNhanVien,
          HoTen: document.getElementById("employee-name").value,
          GioiTinh: document.querySelector('input[name="gender"]:checked')?.value,
          NgaySinh: document.getElementById("employee-dob").value,
          DiaChi: document.getElementById("employee-address").value,
          Email: document.getElementById("employee-email").value,
          SDT: document.getElementById("employee-phone").value,
          MaChucVu: document.getElementById("employee-position").value,
          MaPhongban: document.getElementById("employee-department").value,
          Luong: document.getElementById("employee-salary").value.replace(/[^0-9]/g, "")
      };
  
      fetch("http://localhost/qlns_clone/php/getEmployee.php?action=update", {
          method: "POST",  // Hoặc "PUT" nếu API hỗ trợ
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify(updatedEmployee)
      })
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              alert("Cập nhật thành công!");
              loadEmployees();  // Tải lại danh sách nhân viên từ server
              closeEmployeeModal();
          } else {
              alert("Lỗi khi cập nhật: " + data.message);
          }
      })
      .catch(error => console.error("Lỗi khi gửi yêu cầu cập nhật:", error));
  }
  
  
  
  