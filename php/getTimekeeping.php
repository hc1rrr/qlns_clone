<?php
header("Content-Type: application/json");
require "connect.php"; // Kết nối CSDL

$action = $_GET['action'] ?? ''; // Lấy action từ yêu cầu GET, mặc định là rỗng nếu không có action
$maNV = $_GET['MaNV'] ?? ''; // Lấy MaNV từ yêu cầu GET

if (!$maNV) {
    echo json_encode(["success" => false, "message" => "MaNV không được cung cấp"]);
    exit;
}

if ($action == 'chamCongIn') {
    // Xử lý chấm công vào
    $gioVao = $_GET['ThoiGianVao'] ?? ''; // Lấy giờ vào
    $ngay = $_GET['Ngay'] ?? ''; // Lấy ngày

    if (!$gioVao || !$ngay) {
        echo json_encode(["success" => false, "message" => "Dữ liệu không đầy đủ cho chấm công vào"]);
        exit;
    }

    // Thêm dữ liệu vào cơ sở dữ liệu
    $sql = "INSERT INTO chamcong (MaNhanVien, Ngay, GioVao) VALUES ('$maNV', '$ngay', '$gioVao')";
    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => true, "message" => "Chấm công vào thành công"]);
    } else {
        echo json_encode(["success" => false, "message" => "Lỗi khi chấm công vào: " . $conn->error]);
    }
    exit;
} 

if ($action == 'chamCongOut') {
    // Xử lý chấm công ra
    $gioRa = $_GET['ThoiGianRa'] ?? ''; // Lấy giờ ra
    $ngayRa = $_GET['Ngay'] ?? ''; // Lấy ngày ra

    if (!$gioRa || !$ngayRa) {
        echo json_encode(["success" => false, "message" => "Dữ liệu không đầy đủ cho chấm công ra"]);
        exit;
    }

    // Tính giờ công và tăng ca
    $sql = "SELECT GioVao FROM chamcong WHERE MaNhanVien = '$maNV' AND GioRa IS NULL AND Ngay = '$ngayRa' LIMIT 1";
    $result = $conn->query($sql);
    
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $gioVao = $row['GioVao'];

        // Tính giờ công và tăng ca
        $gioVaoTime = strtotime($gioVao);
        $gioRaTime = strtotime($gioRa);

        $gioCong = round(($gioRaTime - $gioVaoTime) / 3600, 2); // Tính giờ công (số giờ)
        $tangCa = $gioCong - 8; // Tính tăng ca (giờ công - 8)

        // Cập nhật thông tin chấm công ra và giờ công, tăng ca vào cơ sở dữ liệu
        $sqlUpdate = "UPDATE chamcong SET GioRa = '$gioRa', GioCong = '$gioCong', TangCa = '$tangCa' WHERE MaNhanVien = '$maNV' AND GioRa IS NULL AND Ngay = '$ngayRa'";
        if ($conn->query($sqlUpdate) === TRUE) {
            echo json_encode(["success" => true, "message" => "Chấm công ra thành công"]);
        } else {
            echo json_encode(["success" => false, "message" => "Lỗi khi chấm công ra: " . $conn->error]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Không tìm thấy chấm công vào tương ứng"]);
    }
    exit;
}

// Nếu không có action, trả về dữ liệu chấm công của nhân viên
$sql = "SELECT * FROM chamcong WHERE MaNhanVien = '$maNV'"; // Truy vấn các bản ghi chấm công của MaNV
$result = $conn->query($sql);

$timekeepingData = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $timekeepingData[] = $row; // Thêm từng bản ghi vào mảng
    }
}

echo json_encode($timekeepingData); // Trả dữ liệu về frontend
$conn->close();
?>
