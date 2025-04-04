<?php
header("Content-Type: application/json");
require "connect.php"; // Kết nối CSDL

$logFile = "debug3.txt"; // File debug

// Nhận dữ liệu từ JSON nếu là POST
$inputData = json_decode(file_get_contents("php://input"), true);
file_put_contents($logFile, "Raw input:\n" . print_r($inputData, true) . "\n", FILE_APPEND);

// Xác định method GET hoặc POST
$method = $_SERVER['REQUEST_METHOD'];

if ($method === "POST") {
    $action = $inputData['action'] ?? '';
    $maNV = $inputData['MaNV'] ?? '';
} else {
    $action = $_GET['action'] ?? '';
    $maNV = $_GET['MaNV'] ?? '';
}

if (!$maNV) {
    file_put_contents($logFile, "Lỗi: MaNV không được cung cấp\n", FILE_APPEND);
    echo json_encode(["success" => false, "message" => "MaNV không được cung cấp"]);
    exit;
}

if ($action == 'chamCongIn') {
    // Lấy dữ liệu từ frontend
    $gioVao = $inputData['ThoiGianVao'] ?? '';
    $ngay = $inputData['Ngay'] ?? '';
    $maNV = $inputData['MaNV'] ?? '';

    file_put_contents($logFile, "==== [Chấm công vào] ====\n", FILE_APPEND);
    file_put_contents($logFile, "Dữ liệu từ frontend: " . json_encode($inputData) . "\n", FILE_APPEND);

    // Kiểm tra dữ liệu hợp lệ
    if (!$gioVao || !$ngay || !$maNV) {
        file_put_contents($logFile, "❌ Thiếu dữ liệu giờ vào, ngày hoặc mã nhân viên\n", FILE_APPEND);
        echo json_encode(["success" => false, "message" => "Dữ liệu không đầy đủ cho chấm công vào"]);
        exit;
    }

    // 1. Truy vấn tên nhân viên từ MaNV
    $sqlGetTenNV = "SELECT TenNhanVien FROM chamcong WHERE MaNhanVien = '$maNV' LIMIT 1";
    file_put_contents($logFile, "SQL get TenNhanVien: $sqlGetTenNV\n", FILE_APPEND);
    $resultTenNV = $conn->query($sqlGetTenNV);
    if (!$resultTenNV || $resultTenNV->num_rows == 0) {
        file_put_contents($logFile, "❌ Không tìm thấy tên nhân viên cho MaNV = $maNV\n", FILE_APPEND);
        echo json_encode(["success" => false, "message" => "Không tìm thấy nhân viên"]);
        exit;
    }
    $tenNV = $resultTenNV->fetch_assoc()['TenNhanVien'];

    // 2. Lấy mã chấm công cuối cùng và tạo mã mới
    $sqlLastCode = "SELECT MaChamCong FROM chamcong ORDER BY MaChamCong DESC LIMIT 1";
    file_put_contents($logFile, "SQL get last MaChamCong: $sqlLastCode\n", FILE_APPEND);
    $resultLastCode = $conn->query($sqlLastCode);
    $lastCode = "CC00"; // Nếu chưa có mã chấm công nào
    if ($resultLastCode && $row = $resultLastCode->fetch_assoc()) {
        $lastCode = $row['MaChamCong'];
    }

    $number = intval(substr($lastCode, 2)) + 1;
    $newCode = 'CC' . str_pad($number, 2, '0', STR_PAD_LEFT);
    file_put_contents($logFile, "Mã chấm công mới: $newCode\n", FILE_APPEND);

    // 3. Câu lệnh INSERT vào bảng chamcong
    $sqlInsert = "INSERT INTO chamcong (MaChamCong, MaNhanVien, TenNhanVien, Ngay, GioVao)
                  VALUES ('$newCode', '$maNV', '$tenNV', '$ngay', '$gioVao')";
    file_put_contents($logFile, "SQL INSERT: $sqlInsert\n", FILE_APPEND);

    if ($conn->query($sqlInsert) === TRUE) {
        file_put_contents($logFile, "✅ Thành công: Đã chấm công vào\n", FILE_APPEND);
        echo json_encode(["success" => true, "message" => "Chấm công vào thành công"]);
    } else {
        file_put_contents($logFile, "❌ Lỗi khi insert: " . $conn->error . "\n", FILE_APPEND);
        echo json_encode(["success" => false, "message" => "Lỗi khi chấm công vào: " . $conn->error]);
    }
    exit;
}





if ($action == 'chamCongOut') {
    // Lấy dữ liệu từ frontend
    $gioRa = $inputData['ThoiGianRa'] ?? '';
    $ngay = $inputData['Ngay'] ?? '';
    $maNV = $inputData['MaNV'] ?? '';

    file_put_contents($logFile, "==== [Chấm công ra] ====\n", FILE_APPEND);
    file_put_contents($logFile, "Dữ liệu từ frontend: " . json_encode($inputData) . "\n", FILE_APPEND);

    // Kiểm tra dữ liệu hợp lệ
    if (!$gioRa || !$ngay || !$maNV) {
        file_put_contents($logFile, "❌ Thiếu dữ liệu giờ ra, ngày hoặc mã nhân viên\n", FILE_APPEND);
        echo json_encode(["success" => false, "message" => "Dữ liệu không đầy đủ cho chấm công ra"]);
        exit;
    }

    // Truy vấn bản ghi có cùng MaNhanVien và Ngay
    $sqlGetChamCong = "SELECT * FROM chamcong WHERE MaNhanVien = '$maNV' AND Ngay = '$ngay' LIMIT 1";
    file_put_contents($logFile, "SQL get cham cong: $sqlGetChamCong\n", FILE_APPEND);
    $resultGetChamCong = $conn->query($sqlGetChamCong);

    if (!$resultGetChamCong || $resultGetChamCong->num_rows == 0) {
        file_put_contents($logFile, "❌ Không tìm thấy bản ghi chấm công cho MaNV = $maNV và Ngày = $ngay\n", FILE_APPEND);
        echo json_encode(["success" => false, "message" => "Không tìm thấy bản ghi chấm công"]);
        exit;
    }

    // Cập nhật giờ ra vào bản ghi chấm công
    $sqlUpdate = "UPDATE chamcong SET GioRa='$gioRa' WHERE MaNhanVien='$maNV' AND Ngay='$ngay'";
    file_put_contents($logFile, "SQL UPDATE: $sqlUpdate\n", FILE_APPEND);

    if ($conn->query($sqlUpdate) === TRUE) {
        file_put_contents($logFile, "✅ Thành công: Đã cập nhật giờ ra\n", FILE_APPEND);
        echo json_encode(["success" => true, "message" => "Chấm công ra thành công"]);
    } else {
        file_put_contents($logFile, "❌ Lỗi khi cập nhật giờ ra: " . $conn->error . "\n", FILE_APPEND);
        echo json_encode(["success" => false, "message" => "Lỗi khi cập nhật giờ ra"]);
    }
    exit;
}



// Nếu không có action -> Lấy danh sách chấm công của nhân viên
$sql = "SELECT * FROM chamcong WHERE MaNhanVien = '$maNV'";
file_put_contents($logFile, "SQL Lấy danh sách chấm công:\n$sql\n", FILE_APPEND);

$result = $conn->query($sql);

$timekeepingData = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $timekeepingData[] = $row;
    }
    file_put_contents($logFile, "Đã trả về " . count($timekeepingData) . " bản ghi\n", FILE_APPEND);
} else {
    file_put_contents($logFile, "Không có bản ghi nào được tìm thấy\n", FILE_APPEND);
}

echo json_encode($timekeepingData);
$conn->close();
?>
