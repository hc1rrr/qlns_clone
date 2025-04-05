<?php
header("Access-Control-Allow-Origin: *"); // Cho phép tất cả nguồn
header("Access-Control-Allow-Methods: GET, POST, OPTIONS"); // Cho phép phương thức GET, POST
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Cho phép header cần thiết
header("Content-Type: application/json");
require "connect.php"; // Đảm bảo file này đã đúng thông tin kết nối CSDL

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Kết nối CSDL thất bại: " . $conn->connect_error]);
    exit;
}

// Lấy action từ query ?action=
$action = $_GET['action'] ?? 'get';

if (!$action) {
    echo json_encode(["success" => false, "message" => "Thiếu action"]);
    exit;
}

switch ($action) {
    case 'get':
        getEmployee($conn);
        break;
    case 'add':
        addEmployee($conn);
        break;
    case 'update':
        updateEmployee($conn);
        break;
    case 'delete':
        deleteEmployee($conn);
        break;
    default:
        echo json_encode(["success" => false, "message" => "Hành động không hợp lệ", "action" => $action]);
}

$conn->close();

// Hàm lấy danh sách nhân viên
function getEmployee($conn) {
    $sql = "SELECT MaNhanVien, HoTen, GioiTinh, NgaySinh, DiaChi, SDT, MaChucVu, MaPhongban, Luong FROM nhanvien";
    $result = $conn->query($sql);

    if (!$result) {
        echo json_encode(["success" => false, "message" => "Lỗi truy vấn: " . $conn->error]);
        return;
    }

    $employees = [];
    while ($row = $result->fetch_assoc()) {
        $employees[] = $row;
    }

    echo json_encode(["success" => true, "data" => $employees]);
}

// Hàm thêm nhân viên
function addEmployee($conn) {
    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data['HoTen']) || empty($data['GioiTinh']) || empty($data['NgaySinh']) ||
        empty($data['DiaChi']) || empty($data['SDT']) ||
        empty($data['MaChucVu']) || empty($data['MaPhongban'])) {
        echo json_encode(["success" => false, "message" => "Thiếu dữ liệu bắt buộc"]);
        return;
    }

    $MaNhanVien = generateEmployeeId($conn);
    $HoTen = $conn->real_escape_string($data['HoTen']);
    $GioiTinh = $conn->real_escape_string($data['GioiTinh']);
    $NgaySinh = $conn->real_escape_string($data['NgaySinh']);
    $DiaChi = $conn->real_escape_string($data['DiaChi']);
    $SDT = $conn->real_escape_string($data['SDT']);
    $MaChucVu = $conn->real_escape_string($data['MaChucVu']);
    $MaPhongban = $conn->real_escape_string($data['MaPhongban']);

    $sql = "INSERT INTO nhanvien (MaNhanVien, HoTen, GioiTinh, NgaySinh, DiaChi, SDT, MaChucVu, MaPhongban) 
            VALUES ('$MaNhanVien', '$HoTen', '$GioiTinh', '$NgaySinh', '$DiaChi', '$SDT', '$MaChucVu', '$MaPhongban')";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => true, "message" => "Thêm nhân viên thành công"]);
    } else {
        echo json_encode(["success" => false, "message" => "Lỗi: " . $conn->error]);
    }
}

// Hàm cập nhật thông tin nhân viên
function updateEmployee($conn) {
    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data['MaNhanVien']) || empty($data['HoTen'])) {
        echo json_encode(["success" => false, "message" => "Thiếu mã hoặc tên nhân viên"]);
        return;
    }

    $MaNhanVien = $conn->real_escape_string($data['MaNhanVien']);
    $HoTen = $conn->real_escape_string($data['HoTen']);
    $GioiTinh = $conn->real_escape_string($data['GioiTinh']);
    $NgaySinh = $conn->real_escape_string($data['NgaySinh']);
    $DiaChi = $conn->real_escape_string($data['DiaChi']);
    $SDT = $conn->real_escape_string($data['SDT']);
    $MaChucVu = $conn->real_escape_string($data['MaChucVu']);
    $MaPhongban = $conn->real_escape_string($data['MaPhongban']);
    $Luong = $conn->real_escape_string($data['Luong']);

    // 🛑 Kiểm tra xem MaPhongban có hợp lệ không
    if ($MaPhongban == "undefined" || empty($MaPhongban)) {
        echo json_encode(["success" => false, "message" => "Mã phòng ban không hợp lệ"]);
        return;
    }

    // 🛑 Kiểm tra MaPhongban có tồn tại trong bảng phongban không
    $checkPhongban = mysqli_query($conn, "SELECT * FROM phongban WHERE MaPhongban = '$MaPhongban'");
    if (mysqli_num_rows($checkPhongban) == 0) {
        echo json_encode(["success" => false, "message" => "Mã phòng ban không tồn tại"]);
        return;
    }

    // Thực hiện UPDATE nếu dữ liệu hợp lệ
    $sql = "UPDATE nhanvien SET 
        HoTen='$HoTen',
        GioiTinh='$GioiTinh',
        NgaySinh='$NgaySinh',
        DiaChi='$DiaChi',
        SDT='$SDT',
        MaChucVu='$MaChucVu',
        MaPhongban='$MaPhongban',
        Luong='$Luong'
        WHERE MaNhanVien='$MaNhanVien'";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => true, "message" => "Cập nhật thành công"]);
    } else {
        echo json_encode(["success" => false, "message" => "Lỗi: " . $conn->error]);
    }
}

// Hàm xóa nhân viên
function deleteEmployee($conn) {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!is_array($data) || empty($data['MaNhanVien'])) {
        echo json_encode(["success" => false, "message" => "Dữ liệu không hợp lệ hoặc thiếu mã nhân viên"]);
        return;
    }

    $MaNhanVien = $conn->real_escape_string($data['MaNhanVien']);
    $sql = "DELETE FROM nhanvien WHERE MaNhanVien='$MaNhanVien'";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => true, "message" => "Xóa thành công"]);
    } else {
        echo json_encode(["success" => false, "message" => "Lỗi: " . $conn->error]);
    }
}

// Hàm sinh Mã Nhân Viên tự động
function generateEmployeeId($conn) {
    $sql = "SELECT MaNhanVien FROM nhanvien ORDER BY MaNhanVien DESC LIMIT 1";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $lastId = $result->fetch_assoc()['MaNhanVien'];
        $number = (int) substr($lastId, 2) + 1;
        return 'NV' . str_pad($number, 3, '0', STR_PAD_LEFT);
    } else {
        return 'NV001';
    }
}
?>
