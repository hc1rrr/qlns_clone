<?php
header("Content-Type: application/json");
require "connect.php"; // Kết nối CSDL

$action = $_GET['action'];

// Ghi log dữ liệu nhận từ yêu cầu
file_put_contents('request_log.txt', "Action: " . $action . "\n", FILE_APPEND);
file_put_contents('request_log.txt', "Request Data: " . file_get_contents("php://input") . "\n", FILE_APPEND);

switch ($action) {
    case 'get':
        getAttendances($conn);
        break;
    case 'add':
        addAttendance($conn);
        break;
    case 'update':
        updateAttendance($conn);
        break;
    case 'delete':
        deleteAttendance($conn);
        break;
    default:
        echo json_encode(["success" => false, "message" => "Invalid action"]);
        break;
}

$conn->close();

/**
 * Lấy danh sách chấm công
 */
function getAttendances($conn) {
    // Truy vấn lấy đầy đủ các trường từ bảng chamcong
    $sql = "SELECT MaChamCong, MaNhanVien, TenNhanVien, Ngay, GioVao, GioRa, TangCa FROM chamcong";
    $result = $conn->query($sql);

    $attendances = [];

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $attendances[] = $row;
        }
    }

    // Ghi log dữ liệu trả về
    file_put_contents('response_log.txt', "Response Data: " . json_encode($attendances) . "\n", FILE_APPEND);

    echo json_encode($attendances);
}


/**
 * Thêm dữ liệu chấm công
 */
function addAttendance($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    $maNhanVien = $data['maNhanVien'];
    $ngay = $data['ngay'];
    $gioVao = $data['gioVao'];
    $gioRa = $data['gioRa'];
    $tangCa = $data['tangCa'];

    // Ghi log dữ liệu yêu cầu
    file_put_contents('request_log.txt', "Add Attendance Data: " . json_encode($data) . "\n", FILE_APPEND);

    // Tạo MaChamCong tự động
    $sql = "SELECT MaChamCong FROM chamcong ORDER BY MaChamCong DESC LIMIT 1";
    $result = $conn->query($sql);
    $lastMaChamCong = $result->fetch_assoc()['MaChamCong'];
    $newMaChamCong = 'CC' . str_pad((int)substr($lastMaChamCong, 2) + 1, 2, '0', STR_PAD_LEFT);

    $sql = "INSERT INTO chamcong (MaChamCong, MaNhanVien, Ngay, GioVao, GioRa, TangCa) 
            VALUES ('$newMaChamCong', '$maNhanVien', '$ngay', '$gioVao', '$gioRa', '$tangCa')";

    if ($conn->query($sql) === TRUE) {
        $response = ["success" => true];
    } else {
        $response = ["success" => false, "message" => $conn->error];
    }

    // Ghi log dữ liệu trả về
    file_put_contents('response_log.txt', "Response Data: " . json_encode($response) . "\n", FILE_APPEND);

    echo json_encode($response);
}

/**
 * Cập nhật dữ liệu chấm công
 */
function updateAttendance($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    $maChamCong = $data['maChamCong'];  // Lấy MaChamCong từ frontend
    $tenPhongBan = $data['tenPhongBan'];  // Sửa tên trường từ 'tenNhanVien' thành 'tenPhongBan'
    $thoiGianVao = $data['thoiGianVao'];
    $thoiGianRa = $data['thoiGianRa'];
    $date = $data['date'];

    // Ghi log dữ liệu yêu cầu
    file_put_contents('request_log.txt', "Update Attendance Data: " . json_encode($data) . "\n", FILE_APPEND);

    // Cập nhật thông tin chấm công dựa trên MaChamCong
    $sqlUpdate = "UPDATE chamcong 
                  SET TenNhanVien='$tenPhongBan', Ngay='$date', GioVao='$thoiGianVao', GioRa='$thoiGianRa' 
                  WHERE MaChamCong='$maChamCong'";

    if ($conn->query($sqlUpdate) === TRUE) {
        $response = ["success" => true];
    } else {
        $response = ["success" => false, "message" => $conn->error];
    }

    // Ghi log dữ liệu trả về
    file_put_contents('response_log.txt', "Response Data: " . json_encode($response) . "\n", FILE_APPEND);

    echo json_encode($response);
}




/**
 * Xóa dữ liệu chấm công
 */
function deleteAttendance($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    $maChamCong = $data['maChamCong'];  // Lấy MaChamCong từ frontend

    // Ghi log dữ liệu yêu cầu
    file_put_contents('request_log.txt', "Delete Attendance Data: " . json_encode($data) . "\n", FILE_APPEND);

    // Xóa chấm công dựa trên MaChamCong
    $sqlDelete = "DELETE FROM chamcong WHERE MaChamCong='$maChamCong'";

    if ($conn->query($sqlDelete) === TRUE) {
        $response = ["success" => true];
    } else {
        $response = ["success" => false, "message" => $conn->error];
    }

    // Ghi log dữ liệu trả về
    file_put_contents('response_log.txt', "Response Data: " . json_encode($response) . "\n", FILE_APPEND);

    echo json_encode($response);
}


?>
