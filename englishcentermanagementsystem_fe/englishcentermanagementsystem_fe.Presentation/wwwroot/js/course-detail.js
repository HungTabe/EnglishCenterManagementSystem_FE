const courseApiBase = 'https://localhost:7176/Course';
const classApiBase = 'https://localhost:7176/api/class';
const enrollApiBase = 'https://localhost:7176/api/enrollment';

const courseDetailBody = document.getElementById('courseDetailBody');
const classListTable = document.getElementById('classListTable');
const alertPlaceholder = document.getElementById('alertPlaceholder');

const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
const registerForm = document.getElementById('registerForm');
const registerAssignmentId = document.getElementById('registerAssignmentId');
const registerStudentId = document.getElementById('registerStudentId');
const registerAmount = document.getElementById('registerAmount');
const registerPartialPayment = document.getElementById('registerPartialPayment');

const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
const confirmationBody = document.getElementById('confirmationBody');

function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function showAlert(message, type = 'success') {
    alertPlaceholder.innerHTML = `<div class="alert alert-${type} alert-dismissible" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
}

function clearAlert() {
    alertPlaceholder.innerHTML = '';
}

async function loadCourseDetail(courseId) {
    try {
        const res = await axios.get(`${courseApiBase}/${courseId}`);
        renderCourseDetail(res.data);
    } catch (err) {
        showAlert('Failed to load course detail.', 'danger');
    }
}

function renderCourseDetail(course) {
    courseDetailBody.innerHTML = `
        <div class="row">
            <div class="col-md-8">
                <h5>${course.courseName}</h5>
                <p>${course.description}</p>
                <p><strong>Category:</strong> ${course.courseCategoryId}</p>
                <p><strong>Duration:</strong> ${course.durationInHours} hours</p>
                <p><strong>Fee:</strong> ${course.fee.toLocaleString(undefined, {style: 'currency', currency: 'USD'})}</p>
            </div>
        </div>
    `;
}

async function loadClassesForCourse(courseId) {
    classListTable.innerHTML = '<tr><td colspan="5" class="text-center">Loading...</td></tr>';
    try {
        const res = await axios.get(classApiBase);
        const allClasses = res.data;
        // For each class, fetch its details to check assignments for this course
        const classDetails = await Promise.all(allClasses.map(cls => axios.get(`${classApiBase}/${cls.classId}`)));
        const filtered = classDetails
            .map(r => r.data)
            .filter(clsDetail => (clsDetail.assignments || []).some(a => a.courseId === parseInt(courseId)));
        renderClassList(filtered, courseId);
    } catch (err) {
        classListTable.innerHTML = '<tr><td colspan="5" class="text-danger text-center">Failed to load classes.</td></tr>';
    }
}

function renderClassList(classes, courseId) {
    if (!classes.length) {
        classListTable.innerHTML = '<tr><td colspan="5" class="text-center">No classes available for this course.</td></tr>';
        return;
    }
    classListTable.innerHTML = '';
    classes.forEach(cls => {
        // Find the assignment for this course
        const assignment = (cls.assignments || []).find(a => a.courseId === parseInt(courseId));
        classListTable.innerHTML += `
            <tr>
                <td>${cls.className}</td>
                <td>${cls.room}</td>
                <td>${cls.maxCapacity}</td>
                <td>${cls.status}</td>
                <td>
                    <button class="btn btn-outline-success btn-sm" data-action="register" data-assignment-id="${assignment ? assignment.assignmentId : ''}" data-fee="${assignment ? assignment.fee : ''}">
                        Register
                    </button>
                </td>
            </tr>
        `;
    });
    document.querySelectorAll('button[data-action="register"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const assignmentId = this.getAttribute('data-assignment-id');
            const fee = this.getAttribute('data-fee');
            registerAssignmentId.value = assignmentId;
            registerAmount.value = fee;
            registerPartialPayment.checked = false;
            registerModal.show();
        });
    });
}

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
                <li class="list-group-item"><strong>Status:</strong> ${data.isConfirmed ? 'Confirmed' : 'Pending'}</li>
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

document.addEventListener('DOMContentLoaded', function () {
    const courseId = getQueryParam('courseId');
    if (!courseId) {
        showAlert('No course selected.', 'warning');
        return;
    }
    loadCourseDetail(courseId);
    loadClassesForCourse(courseId);
}); 