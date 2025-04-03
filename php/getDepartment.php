<?php
header("Content-Type: application/json");
require "connect.php"; 

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'get':
        getDepartments($conn);
        break;
    case 'add':
        addDepartment($conn);
        break;
    case 'update':
        updateDepartment($conn);
        break;
    case 'delete':
        deleteDepartment($conn);
        break;
    default:
        echo json_encode(["success" => false, "message" => "Invalid action"]);
        break;
}

$conn->close();

function getDepartments($conn) {
    $sql = "SELECT MaPhongBan, TenPhongBan, MoTa FROM phongban";
    $result = $conn->query($sql);

    $departments = [];

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $departments[] = $row;
        }
    }

    echo json_encode($departments);
}

function addDepartment($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    $tenPhongBan = $data['tenPhongBan'] ?? '';
    $moTa = $data['moTa'] ?? '';

    if (empty($tenPhongBan)) {
        echo json_encode(["success" => false, "message" => "Tên phòng ban không được để trống"]);
        return;
    }
    $sql = "SELECT MaPhongBan FROM phongban WHERE TenPhongBan='$tenPhongBan'";
    $result = $conn->query($sql);
    if ($result->num_rows > 0) {
        echo json_encode(["success" => false, "message" => "Tên phòng ban bị trùng"]);
        return;
    }

    $sql = "SELECT MaPhongBan FROM phongban ORDER BY MaPhongBan DESC LIMIT 1";
    $result = $conn->query($sql);
    $lastMaPhongBan = $result->fetch_assoc()['MaPhongBan'] ?? 'PB00';
    $newMaPhongBan = 'PB' . str_pad((int)substr($lastMaPhongBan, 2) + 1, 2, '0', STR_PAD_LEFT);

    $sql = "INSERT INTO phongban (MaPhongBan, TenPhongBan, MoTa) VALUES ('$newMaPhongBan', '$tenPhongBan', '$moTa')";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => true, "message" => "Thêm phòng ban thành công"]);
    } else {
        echo json_encode(["success" => false, "message" => $conn->error]);
    }
}

function updateDepartment($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    $maPhongBan = $data['maPhongBan'] ?? '';
    $tenPhongBan = $data['tenPhongBan'] ?? '';
    $moTa = $data['moTa'] ?? '';

    if (empty($maPhongBan) || empty($tenPhongBan)) {
        echo json_encode(["success" => false, "message" => "Dữ liệu không hợp lệ"]);
        return;
    }

    $sql = "UPDATE phongban SET TenPhongBan='$tenPhongBan', MoTa='$moTa' WHERE MaPhongBan='$maPhongBan'";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => true, "message" => "Cập nhật thành công"]);
    } else {
        echo json_encode(["success" => false, "message" => $conn->error]);
    }
}

function deleteDepartment($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    $maPhongBan = $data['maPhongBan'] ?? '';

    if (empty($maPhongBan)) {
        echo json_encode(["success" => false, "message" => "Mã phòng ban không hợp lệ"]);
        return;
    }

    $sql = "DELETE FROM phongban WHERE MaPhongBan='$maPhongBan'";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => true, "message" => "Xóa phòng ban thành công"]);
    } else {
        echo json_encode(["success" => false, "message" => $conn->error]);
    }
}
?>