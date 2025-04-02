fetch("sidebar.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("sidebar").innerHTML = data;
  });

let currentEditRow = null; // Biến lưu hàng đang sửa

function openModal() {
  document.getElementById("position-modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("position-modal").style.display = "none";
  document.getElementById("tenChucVu").value = "";
  currentEditRow = null;
}

window.onclick = function (event) {
  let modal = document.getElementById("position-modal");
  if (event.target === modal) {
    closeModal();
  }
};

function savePosition() {
  const tenChucVu = document.getElementById("tenChucVu").value;

  if (!tenChucVu) {
    alert("Bạn cần nhập đủ thông tin");
    return;
  }

  if (tenChucVu) {
    if (currentEditRow) {
      // Cập nhật hàng hiện tại với dữ liệu mới
      const maChucVu = currentEditRow.cells[0].innerText;
      updatePosition(maChucVu, tenChucVu);
    } else {
      addPosition(tenChucVu);
    }
    closeModal();
    updateIDs();
  }
}

function editPosition(button) {
  currentEditRow = button.closest("tr");
  const tenPhongBan = currentEditRow.cells[1].innerText;

  document.getElementById("tenChucVu").value = tenPhongBan;

  document.getElementById("modal-title").innerText = "Sửa Chức Vụ";
  openModal();
}

function deletePosition(button) {
  const row = button.closest("tr");
  if (row) {
    const maChucVu = row.cells[0].innerText; // Lấy mã chức vụ cần xóa
    deletePositionFromDB(maChucVu); // Gửi yêu cầu xóa từ DB
    row.remove(); // Xóa khỏi giao diện
    updateIDs(); // Cập nhật lại ID
  }
}


function updateIDs(button) {
  // wtf code is this ? 
  const rows = document.querySelectorAll("#positions-body tr");
  rows.forEach((row, index) => {
    row.cells[0].innerText = `CV${String(index + 1).padStart(2, "0")}`;
  });
  const row = button.closest("tr");
  const maChucVu = row.cells[0].innerText;

  row.remove();
}

function fetchPositions() {
  fetch("http://localhost/qlns_clone/php/getposition.php?action=get")
    .then((response) => response.json())
    .then((data) => {
      const positionsBody = document.getElementById("positions-body");
      positionsBody.innerHTML = ""; // Xóa nội dung cũ

      data.forEach((position, index) => {
        const newRow = `<tr>
                            <td>${position.MaChucVu}</td>
                            <td>${position.TenChucVu}</td>
                            <td>
                                <button class="edit-btn" onclick="editPosition(this)">Sửa</button>
                                <button class="delete-btn" onclick="deletePosition(this)">Xóa</button>
                            </td>
                        </tr>`;
        positionsBody.insertAdjacentHTML("beforeend", newRow);
      });
    })
    .catch((error) => {
      console.error("Error fetching positions:", error);
    });
}

function addPosition(tenChucVu) {
  fetch("http://localhost/qlns_clone/php/getposition.php?action=add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tenChucVu: tenChucVu }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        fetchPositions();
      } else {
        console.error("Error adding position:", data.message);
      }
    })
    .catch((error) => {
      console.error("Error adding position:", error);
    });
}

function updatePosition(maChucVu, tenChucVu) {
  fetch("http://localhost/qlns_clone/php/getposition.php?action=update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ maChucVu: maChucVu, tenChucVu: tenChucVu }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        fetchPositions();
      } else {
        console.error("Error updating position:", data.message);
      }
    })
    .catch((error) => {
      console.error("Error updating position:", error);
    });
}

function deletePositionFromDB(maChucVu) {
  fetch("http://localhost/qlns_clone/php/getposition.php?action=delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ maChucVu: maChucVu }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (!data.success) {
        console.error("Error deleting position:", data.message);
      }
    })
    .catch((error) => {
      console.error("Error deleting position:", error);
    });
}

document.addEventListener("DOMContentLoaded", fetchPositions);



// let hienThiChucVu = true;

// function closeModalChucVu() {
//   if (hienThiChucVu) {
//     document.getElementById("chucvu-modal").style.display = "none";
//     hienThiChucVu = !hienThiChucVu;
//   } else {
//     document.getElementById("chucvu-modal").style.display = "block";

//     hienThiChucVu = !hienThiChucVu;
//   }
// }