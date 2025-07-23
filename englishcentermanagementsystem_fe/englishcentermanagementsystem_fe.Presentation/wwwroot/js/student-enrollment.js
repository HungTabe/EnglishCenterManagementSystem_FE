const classApiBase = 'https://localhost:7176/api/class/odata/TeacherSchedules';
const enrollApiBase = 'https://localhost:7176/api/enrollment';
const classListApi = 'https://localhost:7176/api/class';

const queryForm = document.getElementById('queryForm');
const studentIdInput = document.getElementById('studentIdInput');
const filterInput = document.getElementById('filterInput');
const orderInput = document.getElementById('orderInput');
const topInput = document.getElementById('topInput');
const classResults = document.getElementById('classResults');
const alertPlaceholder = document.getElementById('alertPlaceholder');
const classListTable = document.getElementById('classListTable');

const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
const registerForm = document.getElementById('registerForm');
const registerAssignmentId = document.getElementById('registerAssignmentId');
const registerStudentId = document.getElementById('registerStudentId');
const registerAmount = document.getElementById('registerAmount');
const registerPartialPayment = document.getElementById('registerPartialPayment');

const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
const confirmationBody = document.getElementById('confirmationBody');

function showAlert(message, type = 'success') {
    alertPlaceholder.innerHTML = `<div class="alert alert-${type} alert-dismissible" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
}

function clearAlert() {
    alertPlaceholder.innerHTML = '';
}

function buildODataQuery(filter, order, top) {
    let params = [];
    if (filter) params.push(`$filter=${encodeURIComponent(filter)}`);
    if (order) params.push(`$orderby=${encodeURIComponent(order)}`);
    if (top) params.push(`$top=${encodeURIComponent(top)}`);
    return params.length ? '?' + params.join('&') : '';
}

function renderClasses(classes, studentId) {
    if (!classes || classes.length === 0) {
        classResults.innerHTML = '<div class="alert alert-info">No classes found for the given criteria.</div>';
        return;
    }
    let html = `<div class="accordion" id="classAccordion">`;
    classes.forEach((item, idx) => {
        html += `
        <div class="accordion-item mb-3">
            <h2 class="accordion-header" id="heading${idx}">
                <button class="accordion-button ${idx !== 0 ? 'collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${idx}" aria-expanded="${idx === 0 ? 'true' : 'false'}" aria-controls="collapse${idx}">
                    <span class="fw-bold me-2">${item.className}</span> | <span class="text-primary ms-2">${item.courseName}</span> <span class="ms-3 badge bg-secondary">Room: ${item.room}</span>
                </button>
            </h2>
            <div id="collapse${idx}" class="accordion-collapse collapse ${idx === 0 ? 'show' : ''}" aria-labelledby="heading${idx}" data-bs-parent="#classAccordion">
                <div class="accordion-body">
                    <div class="row mb-2">
                        <div class="col-md-4">
                            <strong>Class ID:</strong> ${item.classId}<br/>
                            <strong>Assignment ID:</strong> ${item.assignmentId}<br/>
                            <strong>Course ID:</strong> ${item.courseId}<br/>
                        </div>
                        <div class="col-md-4">
                            <strong>Fee:</strong> ${item.fee.toLocaleString(undefined, {style: 'currency', currency: 'USD'})}<br/>
                            <strong>Start Date:</strong> ${new Date(item.startDate).toLocaleDateString()}<br/>
                            <strong>End Date:</strong> ${new Date(item.endDate).toLocaleDateString()}<br/>
                        </div>
                        <div class="col-md-4">
                            <strong>Schedules:</strong>
                            <ul class="list-unstyled mb-0">
                                ${item.schedules.map(s => `<li><i class='fas fa-calendar-alt me-1'></i>${s.dayOfWeek}: ${s.startTime} - ${s.endTime}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                    <hr/>
                    <button class="btn btn-outline-success btn-sm" data-action="register" data-id="${item.assignmentId}" data-fee="${item.fee}">
                        <i class="fas fa-sign-in-alt me-1"></i>Register for this Course
                    </button>
                </div>
            </div>
        </div>`;
    });
    html += '</div>';
    classResults.innerHTML = html;

    // Register button event listeners
    document.querySelectorAll('button[data-action="register"]').forEach(btn => {
        btn.addEventListener('click', function() {
            registerAssignmentId.value = this.getAttribute('data-id');
            registerStudentId.value = studentId;
            registerAmount.value = this.getAttribute('data-fee');
            registerPartialPayment.checked = false;
            registerModal.show();
        });
    });
}

async function loadClassList() {
    if (!classListTable) return;
    classListTable.innerHTML = '<tr><td colspan="5" class="text-center">Loading...</td></tr>';
    try {
        const res = await axios.get(classListApi);
        const data = res.data;
        if (!data.length) {
            classListTable.innerHTML = '<tr><td colspan="5" class="text-center">No classes found.</td></tr>';
            return;
        }
        classListTable.innerHTML = '';
        data.forEach(cls => {
            classListTable.innerHTML += `
                <tr>
                    <td>${cls.classId}</td>
                    <td>${cls.className}</td>
                    <td>${cls.room}</td>
                    <td>${cls.maxCapacity}</td>
                    <td>${cls.status}</td>
                </tr>
            `;
        });
    } catch (err) {
        classListTable.innerHTML = `<tr><td colspan="5" class="text-danger text-center">Failed to load class list.</td></tr>`;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    loadClassList();
});

queryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlert();
    classResults.innerHTML = '';
    const studentId = studentIdInput.value.trim();
    const filter = filterInput.value.trim();
    const order = orderInput.value.trim();
    const top = topInput.value.trim();
    if (!studentId) {
        showAlert('Please enter your Student ID.', 'warning');
        return;
    }
    // Always filter out classes the student is already enrolled in (if possible, not implemented here)
    const query = buildODataQuery(filter, order, top);
    try {
        const res = await axios.get(classApiBase + query);
        renderClasses(res.data, studentId);
    } catch (err) {
        showAlert('Failed to fetch classes. Please check your input or try again later.', 'danger');
    }
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlert();
    const studentId = registerStudentId.value;
    const assignmentId = parseInt(registerAssignmentId.value);
    const amount = parseFloat(registerAmount.value);
    const isPartialPayment = registerPartialPayment.checked;
    try {
        const res = await axios.post(enrollApiBase + '/register', {
            studentId,
            assignmentId,
            amount,
            isPartialPayment
        });
        registerModal.hide();
        const data = res.data.data;
        confirmationBody.innerHTML = `
            <div class="alert alert-success">${res.data.message}</div>
            <ul class="list-group mb-2">
                <li class="list-group-item"><strong>Enrollment ID:</strong> ${data.enrollmentId}</li>
                <li class="list-group-item"><strong>Status:</strong> ${data.status}</li>
                <li class="list-group-item"><strong>Paid Amount:</strong> ${data.paidAmount.toLocaleString(undefined, {style: 'currency', currency: 'USD'})}</li>
                <li class="list-group-item"><strong>Total Amount:</strong> ${data.totalAmount.toLocaleString(undefined, {style: 'currency', currency: 'USD'})}</li>
                <li class="list-group-item"><strong>Confirmed:</strong> ${data.isConfirmed ? 'Yes' : 'No'}</li>
            </ul>
            <div>${data.message}</div>
        `;
        confirmationModal.show();
    } catch (err) {
        registerModal.hide();
        let msg = 'Registration failed.';
        if (err.response && err.response.data && err.response.data.message) {
            msg = err.response.data.message;
        }
        confirmationBody.innerHTML = `<div class="alert alert-danger">${msg}</div>`;
        confirmationModal.show();
    }
}); 