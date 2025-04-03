<?php
session_start();
require "connect.php"; 

header("Content-Type: application/json"); 

file_put_contents("debug.txt", "=== BẮT ĐẦU DEBUG MỚI ===\n", FILE_APPEND);

if ($_SERVER["REQUEST_METHOD"] != "POST") {
    file_put_contents("debug.txt", "❌ Không phải request POST\n", FILE_APPEND);
    echo json_encode(["status" => "error", "message" => "Không phải request POST"]);
    exit;
}

$email = $_POST["email"] ?? "";
$password = $_POST["password"] ?? "";

file_put_contents("debug.txt", "🔹 Dữ liệu nhận được từ HTML:\n" . print_r($_POST, true) . "\n", FILE_APPEND);

// Sửa truy vấn để lấy thêm MaNV
$sql = "SELECT MaNV, Email, VaiTro FROM nguoidung WHERE Email = '$email' AND MatKhau = '$password'";
$result = $conn->query($sql);

file_put_contents("debug.txt", "🔹 Truy vấn SQL: $sql\n", FILE_APPEND);
file_put_contents("debug.txt", "🔹 Số dòng tìm thấy: " . $result->num_rows . "\n", FILE_APPEND);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $_SESSION["user"] = $email;
    $_SESSION["VaiTro"] = $row["VaiTro"];
    $_SESSION["MaNV"] = $row["MaNV"]; // Lưu MaNV vào session

    $role = (strtolower(trim($row["VaiTro"])) === "quản trị viên") ? "admin" : "not admin";

    file_put_contents("debug.txt", "✅ Đăng nhập thành công! Vai trò: " . $role . " | MaNV: " . $row["MaNV"] . "\n", FILE_APPEND);

    // Trả về phản hồi JSON bao gồm MaNV
    echo json_encode([
        "status" => "success",
        "message" => "Đăng nhập thành công!",
        "role" => $role,
        "MaNV" => $row["MaNV"]
    ]);
} else {
    file_put_contents("debug.txt", "❌ Đăng nhập thất bại: Email hoặc mật khẩu không đúng!\n", FILE_APPEND);
    echo json_encode(["status" => "error", "message" => "Email hoặc mật khẩu không đúng!"]);
}

$conn->close();
?>
