<?php
header("Content-Type: application/json");
require "connect.php"; // Kết nối CSDL

$action = $_GET['action'] ?? '';

if ($action === 'get') {
    getSalaries($conn);
}

$conn->close();

function getSalaries($conn) {
    $sql = "SELECT 
                luong.MaLuong, 
                luong.MaNhanVien, 
                nhanvien.HoTen AS TenNhanVien,
                luong.NgayCong, 
                luong.TangCa, 
                luong.KhauTru, 
                luong.LuongThucLanh,
                luong.KyTraLuong
            FROM luong 
            LEFT JOIN nhanvien ON luong.MaNhanVien = nhanvien.MaNhanVien";
    $result = $conn->query($sql);

    $salaries = [];

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $salaries[] = $row;
        }
    }

    echo json_encode($salaries);
}
?>