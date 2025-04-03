fetch("sidebar2.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("sidebar").innerHTML = data;
  });

function openModalIn() {
  document.getElementById("myModalIn").style.display = "flex";
}

function openModalOut() {
  document.getElementById("myModalOut").style.display = "flex";
}

function closeModal() {
  document.getElementById("myModalIn").style.display = "none";
  document.getElementById("myModalOut").style.display = "none";
}

function calculateWorkingHours(thoiGianVao, thoiGianRa, date) {
  const morningStart = new Date(`${date} 08:00`);
  const morningDeadline = new Date(`${date} 09:00`);
  const morningEnd = new Date(`${date} 12:00`);

  const afternoonStart = new Date(`${date} 13:00`);
  const afternoonDeadline = new Date(`${date} 14:00`);
  const afternoonEnd = new Date(`${date} 17:00`);
  const overtimeStart = new Date(`${date} 17:00`);

  const timeIn = new Date(`${date} ${thoiGianVao}`);
  const timeOut = new Date(`${date} ${thoiGianRa}`);

  let workingHours = 0;
  let overtimeHours = 0;

  if (timeIn <= morningDeadline && timeOut >= morningEnd) {
    workingHours += 4;
  }

  if (timeIn <= afternoonDeadline && timeOut >= afternoonEnd) {
    workingHours += 4;
  }

  if (timeOut > overtimeStart) {
    overtimeHours = (timeOut - overtimeStart) / (1000 * 60 * 60);
    overtimeHours = Math.max(0, overtimeHours.toFixed(0));
  }

  return { workingHours, overtimeHours };
}

function addAttendance(thoiGian, date, isIn) {
  const tbody = document.getElementById("attendances-body");
  if (!tbody) {
    console.error("Không tìm thấy bảng chấm công!");
    return;
  }

  const rows = tbody.getElementsByTagName("tr");

  if (isIn) {
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td>NV01</td>
        <td>Nguyễn Văn A</td>
        <td>${thoiGian}</td>
        <td></td>
        <td>${date}</td>
        <td>0 giờ</td>
        <td>0 giờ</td>
      `;
    tbody.appendChild(newRow);
  } else {
    let found = false;
    for (let row of rows) {
      const dateCell = row.cells[4].textContent;
      if (dateCell === date && row.cells[3].textContent === "") {
        const thoiGianVao = row.cells[2].textContent;
        const { workingHours, overtimeHours } = calculateWorkingHours(
          thoiGianVao,
          thoiGian,
          date
        );

        row.cells[3].textContent = thoiGian;
        row.cells[5].textContent = `${workingHours} giờ`;
        row.cells[6].textContent = `${overtimeHours} giờ`;

        found = true;
        break;
      }
    }
    if (!found) {
      alert("Không tìm thấy chấm công vào cho ngày này hoặc đã chấm công ra rồi.");
    }
  }
}

// Gửi dữ liệu chấm công vào
// Gửi dữ liệu chấm công vào
// Gửi dữ liệu chấm công vào
function chamCongIn() {
  const thoiGianVao = document.getElementById("thoiGianVao").value;
  const dateIn = document.getElementById("dateIn").value;
  const maNV = localStorage.getItem("MaNV");
  
  // Kiểm tra nếu không có MaNV thì dừng
  if (!maNV) {
    alert("Không tìm thấy mã nhân viên!");
    return;
  }

  const data = {
    action: "chamCongIn",
    MaNV: maNV, // Chỉ gửi MaNV
    ThoiGianVao: thoiGianVao,
    Ngay: dateIn
  };

  fetch("http://localhost/qlns_clone/php/getTimekeeping.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      alert("Chấm công vào thành công!");
      closeModal();
      fetchTimekeeping(); // Lấy lại dữ liệu chấm công
    } else {
      alert("Chấm công vào không thành công!");
    }
  })
  .catch(error => console.error("Lỗi khi gửi dữ liệu:", error));
}



// Gửi dữ liệu chấm công ra
function chamCongOut() {
  const thoiGianRa = document.getElementById("thoiGianRa").value;
  const dateOut = document.getElementById("dateOut").value;
  const maNV = localStorage.getItem("MaNV");
  const tenNV = localStorage.getItem("TenNV");

  if (!maNV || !tenNV) {
    alert("Không có thông tin nhân viên!");
    return;
  }

  const thoiGianVao = document.querySelector(`#attendances-body tr[data-ma-nv="${maNV}"] td:nth-child(3)`).textContent;
  const { workingHours, overtimeHours } = calculateWorkingHours(thoiGianVao, thoiGianRa, dateOut);

  const data = {
    action: "chamCongOut",
    MaNV: maNV,
    TenNV: tenNV,
    ThoiGianRa: thoiGianRa,
    Ngay: dateOut,
    GioCong: workingHours,
    TangCa: overtimeHours
  };

  fetch("http://localhost/qlns_clone/php/getTimekeeping.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      alert("Chấm công ra thành công!");
      closeModal();
      fetchTimekeeping();
    } else {
      alert("Chấm công ra không thành công!");
    }
  })
  .catch(error => console.error("Lỗi khi gửi dữ liệu:", error));
}

// Hàm fetch dữ liệu chấm công
function fetchTimekeeping() {
  const maNV = localStorage.getItem("MaNV");
  if (!maNV) {
    console.error("Không tìm thấy MaNV trong localStorage!");
    return;
  }

  fetch(`http://localhost/qlns_clone/php/getTimekeeping.php?MaNV=${maNV}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
    const timekeepingBody = document.getElementById("attendances-body");
    timekeepingBody.innerHTML = ""; // Xóa nội dung cũ
    data.forEach((record) => {
      const gioVao = new Date(`1970-01-01T${record.GioVao}Z`);
      const gioRa = new Date(`1970-01-01T${record.GioRa}Z`);
      const gioCong = (gioRa - gioVao) / (1000 * 60 * 60);
      const tangCa = record.TangCa + " giờ";
      const newRow = `<tr>
                        <td>${record.MaNhanVien}</td>
                        <td>${record.TenNhanVien}</td>
                        <td>${record.GioVao}</td>
                        <td>${record.GioRa}</td>
                        <td>${record.Ngay}</td>
                        <td>${gioCong.toFixed(2)} giờ</td>
                        <td>${tangCa}</td>
                      </tr>`;
      timekeepingBody.insertAdjacentHTML("beforeend", newRow);
    });
  })
  .catch((error) => {
    console.error("Lỗi khi lấy dữ liệu chấm công:", error);
  });
}

// Gọi hàm khi trang web được tải
document.addEventListener("DOMContentLoaded", fetchTimekeeping);
