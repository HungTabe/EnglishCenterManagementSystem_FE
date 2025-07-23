const courseApiBase = 'https://localhost:7176/Course';
const courseListTable = document.getElementById('courseListTable');
const alertPlaceholder = document.getElementById('alertPlaceholder');

function showAlert(message, type = 'success') {
    alertPlaceholder.innerHTML = `<div class="alert alert-${type} alert-dismissible" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
}

async function loadCourses() {
    courseListTable.innerHTML = '<tr><td colspan="6" class="text-center">Loading...</td></tr>';
    try {
        const res = await axios.get(courseApiBase);
        const courses = res.data;
        renderCourseList(courses);
    } catch (err) {
        courseListTable.innerHTML = '<tr><td colspan="6" class="text-danger text-center">Failed to load courses.</td></tr>';
    }
}

function renderCourseList(courses) {
    if (!courses.length) {
        courseListTable.innerHTML = '<tr><td colspan="6" class="text-center">No courses found.</td></tr>';
        return;
    }
    courseListTable.innerHTML = '';
    courses.forEach(course => {
        courseListTable.innerHTML += `
            <tr>
                <td>${course.courseName}</td>
                <td>${course.courseCategoryId}</td>
                <td>${course.description}</td>
                <td>${course.durationInHours}</td>
                <td>${course.fee.toLocaleString(undefined, {style: 'currency', currency: 'USD'})}</td>
                <td><a class="btn btn-outline-primary btn-sm" href="/CourseDetail?courseId=${course.courseId}">View</a></td>
            </tr>
        `;
    });
}

document.addEventListener('DOMContentLoaded', function () {
    loadCourses();
}); 