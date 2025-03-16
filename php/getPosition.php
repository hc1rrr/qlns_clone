<?php
header("Content-Type: application/json");
require "connect.php"; // Kết nối CSDL

$action = $_GET['action'];

switch ($action) {
    case 'get':
        getPositions($conn);
        break;
    case 'add':
        addPosition($conn);
        break;
    case 'update':
        updatePosition($conn);
        break;
    case 'delete':
        deletePosition($conn);
        break;
    default:
        echo json_encode(["success" => false, "message" => "Invalid action"]);
        break;
}

$conn->close();

function getPositions($conn) {
    $sql = "SELECT MaChucVu, TenChucVu FROM chucvu";
    $result = $conn->query($sql);

    $positions = [];

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $positions[] = $row;
        }
    }

    echo json_encode($positions);
}

function addPosition($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    $tenChucVu = $data['tenChucVu'];

    // Tạo MaChucVu tự động
    $sql = "SELECT MaChucVu FROM chucvu ORDER BY MaChucVu DESC LIMIT 1";
    $result = $conn->query($sql);
    $lastMaChucVu = $result->fetch_assoc()['MaChucVu'];
    $newMaChucVu = 'CV' . str_pad((int)substr($lastMaChucVu, 2) + 1, 2, '0', STR_PAD_LEFT);

    $sql = "INSERT INTO chucvu (MaChucVu, TenChucVu) VALUES ('$newMaChucVu', '$tenChucVu')";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "message" => $conn->error]);
    }
}

function updatePosition($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    $maChucVu = $data['maChucVu'];
    $tenChucVu = $data['tenChucVu'];

    $sql = "UPDATE chucvu SET TenChucVu='$tenChucVu' WHERE MaChucVu='$maChucVu'";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "message" => $conn->error]);
    }
}



function deletePosition($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    $maChucVu = $data['maChucVu'];

    $sql = "DELETE FROM chucvu WHERE MaChucVu='$maChucVu'";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "message" => $conn->error]);
    }
}
?>