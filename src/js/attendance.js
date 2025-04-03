fetch("sidebar.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("sidebar").innerHTML = data;
  });

let currentEditRow = null;

function openModal() {
  document.getElementById("attendance-modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("attendance-modal").style.display = "none";
  document.getElementById("tenPhongBan").value = "";
  document.getElementById("thoiGianVao").value = "";
  document.getElementById("thoiGianRa").value = "";
  document.getElementById("date").value = "";
  currentEditRow = null;
}

window.onclick = function (event) {
  let modal = document.getElementById("attendance-modal");
  if (event.target === modal) {
    closeModal();
  }
};

function saveAttendance() {
  const tenPhongBan = document.getElementById("tenPhongBan").value;
  const thoiGianVao = document.getElementById("thoiGianVao").value;
  const thoiGianRa = document.getElementById("thoiGianRa").value;
  const date = document.getElementById("date").value;

  if (!tenPhongBan || !thoiGianVao || !thoiGianRa || !date) {
    alert("Bạn cần nhập đủ thông tin");
    return;
  }

  if (currentEditRow) {
    const maChamCong = currentEditRow.getAttribute("data-maChamCong");  // Lấy MaChamCong từ data attribute
    updateAttendance(maChamCong, tenPhongBan, thoiGianVao, thoiGianRa, date);
  } else {
    addAttendance(tenPhongBan, thoiGianVao, thoiGianRa, date);
  }

  closeModal();
}

function editAttendance(button) {
  currentEditRow = button.closest("tr");
  const cells = currentEditRow.cells;

  document.getElementById("tenPhongBan").value = cells[1].innerText;
  document.getElementById("thoiGianVao").value = cells[2].innerText;
  document.getElementById("thoiGianRa").value = cells[3].innerText;
  document.getElementById("date").value = cells[4].innerText;

  // Lấy MaChamCong từ thuộc tính data-maChamCong của thẻ tr
  const maChamCong = currentEditRow.getAttribute("data-maChamCong");

  // Gửi MaChamCong để cập nhật
  openModal();
}

function deleteAttendance(button) {
  const row = button.closest("tr");
  // Lấy MaChamCong từ thuộc tính data-maChamCong của thẻ tr
  const maChamCong = row.getAttribute("data-maChamCong");

  if (confirm("Bạn có chắc chắn muốn xóa?")) {
    deleteAttendanceFromDB(maChamCong);
    row.remove();
  }
}

function calculateWorkHours(vao, ra) {
  if (!vao || !ra) {
    return "N/A";
  }

  const timeIn = new Date(`1970-01-01T${vao}Z`);
  const timeOut = new Date(`1970-01-01T${ra}Z`);

  if (isNaN(timeIn) || isNaN(timeOut)) {
    return "N/A";
  }

  const diff = (timeOut - timeIn) / 1000 / 60 / 60;

  if (diff < 0) {
    return "N/A";
  }

  return diff.toFixed(2);
}

function loadAttendances() {
  fetch("http://localhost/qlns_clone/php/getAttendance.php?action=get")
    .then((response) => response.json())
    .then((data) => {
      const tbody = document.getElementById("attendances-body");
      tbody.innerHTML = ""; // Xóa các dòng cũ

      data.forEach((attendance) => {
        const workHours = calculateWorkHours(attendance.GioVao, attendance.GioRa);

        // Thêm MaChamCong vào thuộc tính data-maChamCong của thẻ tr
        const row = `<tr data-maChamCong="${attendance.MaChamCong}">
                        <td>${attendance.MaNhanVien}</td> <!-- Hiển thị Mã NV -->
                        <td>${attendance.TenNhanVien}</td> <!-- Hiển thị Tên NV -->
                        <td>${attendance.GioVao}</td>
                        <td>${attendance.GioRa}</td>
                        <td>${attendance.Ngay}</td>
                        <td>${workHours} giờ</td>
                        <td>${attendance.TangCa}</td>
                        <td>
                            <button class="edit-btn" onclick="editAttendance(this)">Sửa</button>
                            <button class="delete-btn" onclick="deleteAttendance(this)">Xóa</button>
                        </td>
                    </tr>`;
        tbody.insertAdjacentHTML("beforeend", row);
      });
    })
    .catch((error) => console.error("Lỗi khi tải dữ liệu chấm công:", error));
}

function updateAttendance(maChamCong, tenPhongBan, thoiGianVao, thoiGianRa, date) {
  fetch("http://localhost/qlns_clone/php/getAttendance.php?action=update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      maChamCong: maChamCong,
      tenPhongBan: tenPhongBan,
      thoiGianVao: thoiGianVao,
      thoiGianRa: thoiGianRa,
      date: date,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        loadAttendances();
      } else {
        console.error("Lỗi khi cập nhật chấm công:", data.message);
      }
    })
    .catch((error) => console.error("Lỗi khi cập nhật chấm công:", error));
}

function deleteAttendanceFromDB(maChamCong) {
  fetch("http://localhost/qlns_clone/php/getAttendance.php?action=delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ maChamCong: maChamCong }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (!data.success) {
        console.error("Lỗi khi xóa chấm công:", data.message);
      }
    })
    .catch((error) => console.error("Lỗi khi xóa chấm công:", error));
}

document.addEventListener("DOMContentLoaded", loadAttendances);
