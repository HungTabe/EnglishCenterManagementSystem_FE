const apiBase = 'https://localhost:7176/api/class/odata/TeacherSchedules';

const queryForm = document.getElementById('queryForm');
const teacherIdInput = document.getElementById('teacherIdInput');
const filterInput = document.getElementById('filterInput');
const orderInput = document.getElementById('orderInput');
const topInput = document.getElementById('topInput');
const scheduleResults = document.getElementById('scheduleResults');
const alertPlaceholder = document.getElementById('alertPlaceholder');

function showAlert(message, type = 'success') {
    alertPlaceholder.innerHTML = `<div class="alert alert-${type} alert-dismissible" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
}

function clearAlert() {
    alertPlaceholder.innerHTML = '';
}

function buildODataQuery(teacherId, filter, order, top) {
    let params = [`teacherId=${encodeURIComponent(teacherId)}`];
    if (filter) params.push(`$filter=${encodeURIComponent(filter)}`);
    if (order) params.push(`$orderby=${encodeURIComponent(order)}`);
    if (top) params.push(`$top=${encodeURIComponent(top)}`);
    return params.length ? '?' + params.join('&') : '';
}

function renderSchedules(schedules) {
    if (!schedules || schedules.length === 0) {
        scheduleResults.innerHTML = '<div class="alert alert-info">No schedules found for the given criteria.</div>';
        return;
    }
    let html = `<div class="accordion" id="scheduleAccordion">`;
    schedules.forEach((item, idx) => {
        html += `
        <div class="accordion-item mb-3">
            <h2 class="accordion-header" id="heading${idx}">
                <button class="accordion-button ${idx !== 0 ? 'collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${idx}" aria-expanded="${idx === 0 ? 'true' : 'false'}" aria-controls="collapse${idx}">
                    <span class="fw-bold me-2">${item.className}</span> | <span class="text-primary ms-2">${item.courseName}</span> <span class="ms-3 badge bg-secondary">Room: ${item.room}</span>
                </button>
            </h2>
            <div id="collapse${idx}" class="accordion-collapse collapse ${idx === 0 ? 'show' : ''}" aria-labelledby="heading${idx}" data-bs-parent="#scheduleAccordion">
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
                    <button class="btn btn-outline-primary btn-sm mb-2" type="button" data-bs-toggle="collapse" data-bs-target="#students${idx}" aria-expanded="false" aria-controls="students${idx}">
                        <i class="fas fa-users me-1"></i>Show/Hide Students (${item.students.length})
                    </button>
                    <div class="collapse" id="students${idx}">
                        <div class="card card-body">
                            <div class="table-responsive">
                                <table class="table table-sm table-bordered align-middle mb-0">
                                    <thead class="table-light">
                                        <tr>
                                            <th>Student ID</th>
                                            <th>Full Name</th>
                                            <th>Email</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${item.students.map(stu => `
                                            <tr>
                                                <td>${stu.studentId}</td>
                                                <td>${stu.fullName}</td>
                                                <td>${stu.email}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    });
    html += '</div>';
    scheduleResults.innerHTML = html;
}

queryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlert();
    scheduleResults.innerHTML = '';
    const teacherId = teacherIdInput.value.trim();
    const filter = filterInput.value.trim();
    const order = orderInput.value.trim();
    const top = topInput.value.trim();
    if (!teacherId) {
        showAlert('Please enter your Teacher ID.', 'warning');
        return;
    }
    const query = buildODataQuery(teacherId, filter, order, top);
    try {
        const res = await axios.get(apiBase + query);
        renderSchedules(res.data);
    } catch (err) {
        showAlert('Failed to fetch schedules. Please check your input or try again later.', 'danger');
    }
}); 