fetch("sidebar.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("sidebar").innerHTML = data;
  });

function fetchDepartments() {
  console.log("Gọi API lấy danh sách phòng ban...");
  
  fetch("http://localhost/qlns_clone/php/getDepartment.php?action=get")
    .then((response) => response.json())
    .then((data) => {
      console.log("Dữ liệu nhận được:", data);

      const departmentsBody = document.getElementById("departments-body");
      departmentsBody.innerHTML = ""; 
      data.forEach((department) => {
        const newRow = `
          <tr>
            <td>${department.MaPhongBan}</td>
            <td>${department.TenPhongBan}</td>
            <td>${department.MoTa}</td>
            <td>
              <button class="edit-btn" onclick="editDepartment('${department.MaPhongBan}', '${department.TenPhongBan}', '${department.MoTa}')">Sửa</button>
              <button class="delete-btn" onclick="deleteDepartment('${department.MaPhongBan}')">Xóa</button>
            </td>
          </tr>
        `;
        departmentsBody.insertAdjacentHTML("beforeend", newRow);
      });
    })
    .catch((error) => {
      console.error("Lỗi khi fetch dữ liệu phòng ban:", error);
    });
}

function openModal() {
  document.getElementById("department-modal").style.display = "flex";
  document.getElementById("modal-title").innerText = "Thêm Phòng Ban";
  document.getElementById("tenPhongBan").value = "";
  document.getElementById("moTa").value = "";
  document.getElementById("save-btn").setAttribute("onclick", "saveDepartment()");
}

function closeModal() {
  document.getElementById("department-modal").style.display = "none";
}

function saveDepartment(maPhongBan = null) {
  const tenPhongBan = document.getElementById("tenPhongBan").value;
  const moTa = document.getElementById("moTa").value;

  if (!tenPhongBan) {
    alert("Bạn cần nhập tên phòng ban");
    return;
  }

  let url = "http://localhost/qlns_clone/php/getDepartment.php?action=" + (maPhongBan ? "update" : "add");
  let method = maPhongBan ? "PUT" : "POST";
  let data = { tenPhongBan, moTa };

  if (maPhongBan) data.maPhongBan = maPhongBan;

  fetch(url, {
    method: method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((result) => {
      alert(result.message);
      if (result.success) {
        closeModal();
        fetchDepartments();
      }
    })
    .catch((error) => console.error("Lỗi:", error));
}

function editDepartment(maPhongBan, tenPhongBan, moTa) {
  openModal();
  document.getElementById("modal-title").innerText = "Sửa Phòng Ban";
  document.getElementById("tenPhongBan").value = tenPhongBan;
  document.getElementById("moTa").value = moTa;
  document.getElementById("save-btn").setAttribute("onclick", `saveDepartment('${maPhongBan}')`);
}

function deleteDepartment(maPhongBan) {
  if (!confirm("Bạn có chắc muốn xóa phòng ban này?")) return;

  fetch("http://localhost/qlns_clone/php/getDepartment.php?action=delete", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ maPhongBan }),
  })
    .then((response) => response.json())
    .then((result) => {
      alert(result.message);
      if (result.success) {
        fetchDepartments();
      }
    })
    .catch((error) => console.error("Lỗi:", error));
}

document.addEventListener("DOMContentLoaded", fetchDepartments);