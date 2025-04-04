<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require "connect.php";

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Kết nối CSDL thất bại: " . $conn->connect_error]);
    exit;
}

$sql = "SELECT MaNhanVien, HoTen, GioiTinh, NgaySinh, DiaChi, SDT, MaChucVu, MaPhongban FROM nhanvien"; // Xóa cột Luong

$result = $conn->query($sql);

if (!$result) {
    echo json_encode(["success" => false, "message" => "Lỗi truy vấn: " . $conn->error]);
    $conn->close();
    exit;
}

$employees = [];
while ($row = $result->fetch_assoc()) {
    $employees[] = $row;
}

echo json_encode($employees);

$conn->close();
?>