const courseApiBase = 'https://localhost:7176/Course';
const classApiBase = 'https://localhost:7176/api/class';
const enrollApiBase = 'https://localhost:7176/api/enrollment';

const courseListTable = document.getElementById('courseListTable');
const courseDetailSection = document.getElementById('courseDetailSection');
const courseDetailBody = document.getElementById('courseDetailBody');
const classListSection = document.getElementById('classListSection');
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

let allCourses = [];
let allClasses = [];
let selectedCourse = null;
let selectedClass = null;

function showAlert(message, type = 'success') {
    alertPlaceholder.innerHTML = `<div class="alert alert-${type} alert-dismissible" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
}

function clearAlert() {
    alertPlaceholder.innerHTML = '';
}

async function loadCourses() {
    courseListTable.innerHTML = '<tr><td colspan="6" class="text-center">Loading...</td></tr>';
    try {
        const res = await axios.get(courseApiBase);
        allCourses = res.data;
        renderCourseList();
    } catch (err) {
        courseListTable.innerHTML = '<tr><td colspan="6" class="text-danger text-center">Failed to load courses.</td></tr>';
    }
}

function renderCourseList() {
    if (!allCourses.length) {
        courseListTable.innerHTML = '<tr><td colspan="6" class="text-center">No courses found.</td></tr>';
        return;
    }
    courseListTable.innerHTML = '';
    allCourses.forEach(course => {
        courseListTable.innerHTML += `
            <tr>
                <td>${course.courseName}</td>
                <td>${course.courseCategoryId}</td>
                <td>${course.description}</td>
                <td>${course.durationInHours}</td>
                <td>${course.fee.toLocaleString(undefined, {style: 'currency', currency: 'USD'})}</td>
                <td><button class="btn btn-outline-primary btn-sm" data-action="view-detail" data-id="${course.courseId}">View</button></td>
            </tr>
        `;
    });
    document.querySelectorAll('button[data-action="view-detail"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const courseId = this.getAttribute('data-id');
            showCourseDetail(courseId);
        });
    });
}

async function showCourseDetail(courseId) {
    clearAlert();
    selectedCourse = null;
    selectedClass = null;
    courseDetailSection.style.display = 'none';
    classListSection.style.display = 'none';
    try {
        const res = await axios.get(`${courseApiBase}/${courseId}`);
        selectedCourse = res.data;
        renderCourseDetail(selectedCourse);
        await loadClassesForCourse(courseId);
    } catch (err) {
        showAlert('Failed to load course detail.', 'danger');
    }
}

function renderCourseDetail(course) {
    courseDetailSection.style.display = '';
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
    classListSection.style.display = 'none';
    classListTable.innerHTML = '<tr><td colspan="5" class="text-center">Loading...</td></tr>';
    try {
        const res = await axios.get(classApiBase);
        allClasses = res.data;
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
    classListSection.style.display = '';
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
    loadCourses();
}); 