// Tải sidebar
fetch("sidebar2.html")
.then(response => response.text())
.then(data => {
    document.getElementById("sidebar").innerHTML = data;
})
.catch(error => console.error("Lỗi tải sidebar:", error));

// Tải dữ liệu nhân viên
document.addEventListener("DOMContentLoaded", function () {
fetch("http://localhost/qlns_clone/php/information.php?action=get")
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Dữ liệu trả về từ API:", data); // Kiểm tra dữ liệu

        let tableBody = document.getElementById("nhanvien-table");
        tableBody.innerHTML = ""; // Xóa dữ liệu tĩnh ban đầu

        if (Array.isArray(data)) {
            data.forEach(nv => {
                // Định dạng lại ngày sinh
                const ngaySinh = nv.NgaySinh.split('-');
                const ngaySinhFormatted = `${ngaySinh[2]}-${ngaySinh[1]}-${ngaySinh[0]}`;

                let row = document.createElement("tr");
                row.innerHTML = `
                    <td>${nv.MaNhanVien}</td>
                    <td>${nv.HoTen}</td>
                    <td>${nv.GioiTinh}</td>
                    <td>${ngaySinhFormatted}</td>
                    <td>${nv.DiaChi}</td>
                    <td>${nv.SDT}</td>
                    <td>${nv.MaChucVu}</td>
                    <td>${nv.MaPhongban}</td>
                    <td>${nv.Luong || ''}</td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            console.error("Dữ liệu trả về không phải là mảng:", data);
            alert("Lỗi: Dữ liệu trả về không đúng định dạng.");
        }
    })
    .catch(error => {
        console.error("Lỗi kết nối CSDL:", error);
        alert("Đã xảy ra lỗi khi kết nối với server.");
    });
});