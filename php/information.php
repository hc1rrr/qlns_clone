<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Kết nối CSDL
require "connect.php";

// Kiểm tra kết nối
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Kết nối CSDL thất bại: " . $conn->connect_error]);
    exit;
}

// Nhận dữ liệu từ frontend
$inputData = json_decode(file_get_contents("php://input"), true);
$maNV = $inputData['MaNV'] ?? '';

if (!$maNV) {
    echo json_encode(["success" => false, "message" => "Thiếu MaNV"]);
    exit;
}

// Truy vấn bảng thongtinnhanvien với MaNhanVien cụ thể
$sql = "SELECT MaNhanVien, TenNV, GioiTinh, NgaySinh, DiaChi, SoDienThoai, ChucVu, Phongban, Luong FROM thongtinnhanvien WHERE MaNhanVien = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $maNV);
$stmt->execute();
$result = $stmt->get_result();

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
