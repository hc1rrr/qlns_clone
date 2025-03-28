fetch("sidebar.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("sidebar").innerHTML = data;
});

document.addEventListener('DOMContentLoaded', function () {
    function calculateSalary(monthlySalary, workingDays, overtimeDays, totalDaysInMonth) {
        const dailySalary = monthlySalary / totalDaysInMonth;
        const salary = (dailySalary * workingDays) + (dailySalary * overtimeDays * 1.5);
        return salary;
    }

    function countWorkingDays(startDate, endDate) {
        let workingDays = 0;
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            if (currentDate.getDay() >= 1 && currentDate.getDay() <= 5) {
                workingDays++;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return workingDays;
    }

    const salaryTableBody = document.getElementById("salary-body");

    salaryTableBody.querySelectorAll('tr').forEach(function(row) {
        const monthlySalary = parseFloat(row.cells[3].innerText.replace(/,/g, '')); 
        const overtimeDays = parseInt(row.cells[5].innerText); 
        const salaryPeriod = row.cells[2].innerText; 
        const periodParts = salaryPeriod.split(' - ');
        const startDateStr = periodParts[0];
        const endDateStr = periodParts[1];
        const startDate = new Date(startDateStr.split('/').reverse().join('-')); 
        const endDate = new Date(endDateStr.split('/').reverse().join('-'));
        const workingDays = countWorkingDays(startDate, endDate);
        const netSalary = calculateSalary(monthlySalary, workingDays, overtimeDays, 30); 
        const formattedSalary = netSalary.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
        row.cells[6].innerText = formattedSalary;
    });
});
