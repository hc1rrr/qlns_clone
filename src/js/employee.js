fetch("sidebar.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("sidebar").innerHTML = data;
  });


  document.addEventListener("DOMContentLoaded", function () { 
    const salaryInput = document.getElementById("employee-salary");
    salaryInput.addEventListener("focus", function (e) {
        console.log('da focus input');
        
        let value = salaryInput.value;
        console.log('value hể ', value);
        
        value = value.replace(/[^0-9]/g, "");
        let formattedValue = "";
        let length = value.length;
        for (let i = length; i > 0; i -= 3) {
            formattedValue = value.substring(i - 3, i) + (formattedValue ? "," + formattedValue : "");
        }
        salaryInput.value = formattedValue;
    });
});


function openEmployeeModal(employee = null, row = null) {
    function realValue(value) {
        console.log('value here ', value);
        
        value = value.replace(/[^0-9]/g, "");
        let formattedValue = "";
        let length = value.length;
        for (let i = length; i > 0; i -= 3) {
            formattedValue = value.substring(i - 3, i) + (formattedValue ? "," + formattedValue : "");
        }
        return formattedValue;
    }
    const modalHtml = `
        <div class="modal" id="employee-modal">
            <div class="modal-content">
                <span class="close-btn" onclick="closeEmployeeModal()">&times;</span>
                <h3>${employee ? "Chỉnh sửa nhân viên" : "Thêm nhân viên"}</h3>
                <input type="text" id="employee-id" placeholder="Mã nhân viên" value="${employee ? employee.id : ""}">
                <input type="text" id="employee-name" placeholder="Tên nhân viên" value="${employee ? employee.name : ""}">
                
                <!-- Giới tính -->
                <div>
                    <label>Giới tính:</label>
                    <label>
                        <input type="radio" id="employee-gender" name="gender" value="Nam" ${employee && employee.gender === 'Nam' ? 'checked' : ''}> Nam
                    </label>
                    <label>
                        <input type="radio" id="employee-gender" name="gender" value="Nữ" ${employee && employee.gender === 'Nữ' ? 'checked' : ''}> Nữ
                    </label>
                </div>
                
                <input type="date" id="employee-dob" placeholder="Ngày sinh" value="${employee ? employee.dob : ""}">
                <input type="text" id="employee-address" placeholder="Địa chỉ" value="${employee ? employee.address : ""}">
                <input type="email" id="employee-email" placeholder="Email" value="${employee ? employee.email : ""}">
                <input type="text" id="employee-phone" placeholder="Số điện thoại" value="${employee ? employee.phone : ""}">
                
                <!-- Chức vụ -->
                <label for="employee-position">Chức vụ:</label>
                <select id="employee-position">
                    <option value="Nhân viên" ${employee && employee.position === 'Nhân viên' ? 'selected' : ''}>Nhân viên</option>
                    <option value="Tổng giám đốc" ${employee && employee.position === 'Tổng giám đốc' ? 'selected' : ''}>Tổng giám đốc</option>
                    <option value="Quản lý" ${employee && employee.position === 'Quản lý' ? 'selected' : ''}>Quản lý</option>
                </select>
                
                <!-- Phòng ban -->
                <label for="employee-department">Phòng ban:</label>
                <select id="employee-department">
                    <option value="Hành chính" ${employee && employee.department === 'Hành chính' ? 'selected' : ''}>Hành chính</option>
                    <option value="Kinh doanh" ${employee && employee.department === 'Kinh doanh' ? 'selected' : ''}>Kinh doanh</option>
                    <option value="Kỹ thuật" ${employee && employee.department === 'Kỹ thuật' ? 'selected' : ''}>Kỹ thuật</option>
                    <option value="Marketing" ${employee && employee.department === 'Marketing' ? 'selected' : ''}>Marketing</option>
                    <option value="Nhân sự" ${employee && employee.department === 'Nhân sự' ? 'selected' : ''}>Nhân sự</option>
                </select>
                
                <input type="text" id="employee-salary" placeholder="Lương" value="${employee ? realValue(employee.salary) : ""}">
                <button class="save-btn" onclick="${employee ? `updateEmployee(${row.rowIndex})` : "saveEmployee()"}">${employee ? "Cập nhật" : "Lưu"}</button>
            </div>
        </div>`;

    document.body.insertAdjacentHTML("beforeend", modalHtml);
}

function closeEmployeeModal() {
    const modal = document.getElementById("employee-modal");
    if (modal) {
        modal.remove();
    }
}

function saveEmployee() {
    const id = document.getElementById("employee-id").value;
    const name = document.getElementById("employee-name").value;
    const gender = document.querySelector('input[name="gender"]:checked');
    const genderValue = gender ? gender.value : ""; //value = '', 0, null, undefined
    const dob = document.getElementById("employee-dob").value;
    const address = document.getElementById("employee-address").value;
    const email = document.getElementById("employee-email").value;
    const phone = document.getElementById("employee-phone").value;
    const position = document.getElementById("employee-position").value;  
    const department = document.getElementById("employee-department").value;
    const salary = document.getElementById("employee-salary").value;

    if (!id || !name || !genderValue || !email || !phone) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td>${id}</td>
        <td>${name}</td>
        <td>${genderValue}</td>
        <td>${dob}</td>
        <td>${address}</td>
        <td>${email}</td>
        <td>${phone}</td>
        <td>${position}</td>
        <td>${department}</td>
        <td>${salary}</td>
        <td>
            <button class="edit-btn" onclick="editEmployee(this)">Sửa</button>
            <button class="delete-btn" onclick="deleteEmployee(this)">Xóa</button>
        </td>
    `;

    document.getElementById("employee-body").appendChild(newRow);
    closeEmployeeModal();
}



function deleteEmployee(button) {
    const row = button.closest("tr");
    row.remove();
}


function editEmployee(button) {
    const row = button.closest("tr");
    const cells = row.getElementsByTagName("td");
    function realValue(value) {
        console.log('value hể ', value);
        
        value = value.replace(/[^0-9]/g, "");
        let formattedValue = "";
        let length = value.length;
        for (let i = length; i > 0; i -= 3) {
            formattedValue = value.substring(i - 3, i) + (formattedValue ? "," + formattedValue : "");
        }
        return formattedValue;
    }
   
    const employee = {
        id: cells[0].textContent,
        name: cells[1].textContent,
        gender: cells[2].textContent,
        dob: cells[3].textContent,
        address: cells[4].textContent,
        email: cells[5].textContent,
        phone: cells[6].textContent,
        position: cells[7].textContent,
        department: cells[8].textContent,
        salary: realValue(cells[9].textContent.trim().replace(/[^0-9]/g, '')) // Remove all non-numeric characters
        // salary: '01'
    };

    openEmployeeModal(employee, row);
}

// Cập nhật thông tin nhân viên
function updateEmployee(rowIndex) {
    const table = document.getElementById("employee-body");
    const row = table.rows[rowIndex - 1];
    const cells = row.getElementsByTagName("td");
    function realValue(value) {
        console.log('value hể ', value);
        
        value = value.replace(/[^0-9]/g, "");
        let formattedValue = "";
        let length = value.length;
        for (let i = length; i > 0; i -= 3) {
            formattedValue = value.substring(i - 3, i) + (formattedValue ? "," + formattedValue : "");
        }
        return formattedValue;
    }
    cells[0].textContent = document.getElementById("employee-id").value;
    cells[1].textContent = document.getElementById("employee-name").value;
    cells[2].textContent = document.querySelector('input[name="gender"]:checked').value;
    cells[3].textContent = document.getElementById("employee-dob").value;
    cells[4].textContent = document.getElementById("employee-address").value;
    cells[5].textContent = document.getElementById("employee-email").value;
    cells[6].textContent = document.getElementById("employee-phone").value;
    cells[7].textContent = document.getElementById("employee-position").value;
    cells[8].textContent = document.getElementById("employee-department").value;
    let salary = document.getElementById("employee-salary").value.replace(/[^0-9]/g, "");
    salary = salary.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ";
    console.log('realValue(salary)', realValue(salary));
    
    cells[9].textContent = realValue(salary);


    closeEmployeeModal();
}
