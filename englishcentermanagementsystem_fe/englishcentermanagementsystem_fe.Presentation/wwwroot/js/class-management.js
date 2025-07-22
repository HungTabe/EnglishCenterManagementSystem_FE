// class-management.js

document.addEventListener('DOMContentLoaded', function () {
    const apiBase = 'https://localhost:7176/api/class';
    let editingClassId = null;
    let deleteClassId = null;

    // Placeholder data for Course and Teacher dropdowns
    const courses = [
        { id: 1, name: 'English 101' },
        { id: 2, name: 'Math 101' }
    ];
    const teachers = [
        { id: 'teacher-1', name: 'John Doe' },
        { id: 'teacher-2', name: 'Jane Smith' }
    ];
    const daysOfWeek = [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
    ];

    // Elements
    const classTableBody = document.querySelector('#classTable tbody');
    const alertPlaceholder = document.getElementById('alertPlaceholder');
    const classModal = new bootstrap.Modal(document.getElementById('classModal'));
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    const classForm = document.getElementById('classForm');
    const btnAddClass = document.getElementById('btnAddClass');
    const btnAddAssignment = document.getElementById('btnAddAssignment');
    const assignmentsContainer = document.getElementById('assignmentsContainer');
    const btnConfirmDelete = document.getElementById('btnConfirmDelete');

    // Utility: Show Bootstrap alert
    function showAlert(message, type = 'success', timeout = 3000) {
        alertPlaceholder.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
        if (timeout) {
            setTimeout(() => { alertPlaceholder.innerHTML = ''; }, timeout);
        }
    }

    // Utility: Show Bootstrap toast
    function showToast(message, type = 'success') {
        const toastId = 'toast-' + Date.now();
        const icon = type === 'success'
            ? '<i class="fas fa-check-circle text-success me-2"></i>'
            : type === 'danger'
                ? '<i class="fas fa-times-circle text-danger me-2"></i>'
                : '<i class="fas fa-info-circle text-primary me-2"></i>';
        const toastHtml = `
            <div id="${toastId}" class="toast align-items-center text-bg-${type} border-0 mb-2" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3000">
                <div class="d-flex">
                    <div class="toast-body">
                        ${icon}${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;
        const toastContainer = document.getElementById('toastContainer');
        toastContainer.insertAdjacentHTML('beforeend', toastHtml);
        const toastEl = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
        toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
    }

    // Load all classes
    async function loadClasses() {
        classTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Loading...</td></tr>';
        try {
            const res = await fetch(apiBase);
            if (!res.ok) throw new Error('Failed to load classes');
            const data = await res.json();
            renderClassTable(data);
        } catch (err) {
            classTableBody.innerHTML = `<tr><td colspan="6" class="text-danger text-center">${err.message}</td></tr>`;
        }
    }

    // Render class table
    function renderClassTable(classes) {
        if (!classes.length) {
            classTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No classes found.</td></tr>';
            return;
        }
        classTableBody.innerHTML = '';
        classes.forEach(cls => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${cls.classId}</td>
                <td>${cls.className}</td>
                <td>${cls.room}</td>
                <td>${cls.maxCapacity}</td>
                <td>${cls.status}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-2" data-action="edit" data-id="${cls.classId}"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${cls.classId}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            classTableBody.appendChild(row);
        });
    }

    // Open modal for create
    btnAddClass.addEventListener('click', () => {
        editingClassId = null;
        classForm.reset();
        document.getElementById('classId').value = '';
        assignmentsContainer.innerHTML = '';
        addAssignmentForm();
        document.getElementById('classModalLabel').textContent = 'Add Class';
        classModal.show();
    });

    // Open modal for edit
    classTableBody.addEventListener('click', async function (e) {
        const btn = e.target.closest('button[data-action="edit"]');
        if (!btn) return;
        const classId = btn.getAttribute('data-id');
        try {
            const res = await fetch(`${apiBase}/${classId}`);
            if (!res.ok) throw new Error('Failed to load class details');
            const data = await res.json();
            editingClassId = classId;
            fillClassForm(data);
            document.getElementById('classModalLabel').textContent = 'Edit Class';
            classModal.show();
        } catch (err) {
            showAlert(err.message, 'danger');
        }
    });

    // Open modal for delete
    classTableBody.addEventListener('click', function (e) {
        const btn = e.target.closest('button[data-action="delete"]');
        if (!btn) return;
        deleteClassId = btn.getAttribute('data-id');
        deleteModal.show();
    });

    // Confirm delete
    btnConfirmDelete.addEventListener('click', async function () {
        if (!deleteClassId) return;
        try {
            const res = await fetch(`${apiBase}/${deleteClassId}`, { method: 'DELETE' });
            if (!res.ok) {
                const errData = await res.json();
                showToast(errData.message || 'Delete failed', 'danger');
                throw new Error(errData.message || 'Delete failed');
            }
            showToast('Class deleted successfully.');
            showAlert('Class deleted successfully.');
            deleteModal.hide();
            loadClasses();
        } catch (err) {
            showToast(err.message, 'danger');
            showAlert(err.message, 'danger');
        }
    });

    // Fill form for edit
    function fillClassForm(data) {
        document.getElementById('classId').value = data.classId;
        document.getElementById('className').value = data.className;
        document.getElementById('room').value = data.room;
        document.getElementById('maxCapacity').value = data.maxCapacity;
        document.getElementById('status').value = data.status;
        assignmentsContainer.innerHTML = '';
        if (data.assignments && data.assignments.length) {
            data.assignments.forEach(a => addAssignmentForm(a));
        } else {
            addAssignmentForm();
        }
    }

    // Add assignment form
    function addAssignmentForm(assignment = null) {
        const idx = assignmentsContainer.children.length;
        const assignmentDiv = document.createElement('div');
        assignmentDiv.className = 'card mb-3 p-3 assignment-form';
        assignmentDiv.innerHTML = `
            <div class="row g-2 align-items-center flex-nowrap">
                <div class="col-md-2">
                    <label class="form-label">Course</label>
                    <select class="form-select assignment-course">
                        ${courses.map(c => `<option value="${c.id}" ${assignment && c.id == assignment.courseId ? 'selected' : ''}>${c.name}</option>`).join('')}
                    </select>
                </div>
                <div class="col-md-3">
                    <label class="form-label">Teacher</label>
                    <select class="form-select assignment-teacher">
                        ${teachers.map(t => `<option value="${t.id}" ${assignment && t.id == assignment.teacherId ? 'selected' : ''}>${t.name}</option>`).join('')}
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label">Fee</label>
                    <input type="number" class="form-control assignment-fee" min="0" value="${assignment ? assignment.fee : 0}" />
                </div>
                <div class="col-md-2">
                    <label class="form-label">Start Date</label>
                    <input type="date" class="form-control assignment-start" value="${assignment ? assignment.startDate?.split('T')[0] : ''}" />
                </div>
                <div class="col-md-2">
                    <label class="form-label">End Date</label>
                    <input type="date" class="form-control assignment-end" value="${assignment ? assignment.endDate?.split('T')[0] : ''}" />
                </div>
                <div class="col-md-1 d-flex align-items-center justify-content-start" style="margin-top: 30px;">
                    <button type="button" class="btn btn-outline-danger btn-sm btn-remove-assignment" title="Remove Assignment"><i class="fas fa-times"></i></button>
                </div>
            </div>
            <div class="row mt-2">
                <div class="col-12">
                    <label class="form-label">Schedules</label>
                    <div class="schedules-container"></div>
                    <button type="button" class="btn btn-outline-secondary btn-sm mt-2 btn-add-schedule"><i class="fas fa-plus"></i> Add Schedule</button>
                </div>
            </div>
        `;
        assignmentsContainer.appendChild(assignmentDiv);
        // Add schedules if any
        const schedulesContainer = assignmentDiv.querySelector('.schedules-container');
        if (assignment && assignment.schedules && assignment.schedules.length) {
            assignment.schedules.forEach(s => addScheduleForm(schedulesContainer, s));
        } else {
            addScheduleForm(schedulesContainer);
        }
    }

    // Add schedule form
    function addScheduleForm(container, schedule = null) {
        const div = document.createElement('div');
        div.className = 'row g-2 align-items-end mb-2 schedule-form';
        div.innerHTML = `
            <div class="col-md-3">
                <select class="form-select schedule-day">
                    ${daysOfWeek.map(d => `<option value="${d}" ${schedule && d == schedule.dayOfWeek ? 'selected' : ''}>${d}</option>`).join('')}
                </select>
            </div>
            <div class="col-md-3">
                <input type="time" class="form-control schedule-start" value="${schedule ? schedule.startTime : ''}" />
            </div>
            <div class="col-md-3">
                <input type="time" class="form-control schedule-end" value="${schedule ? schedule.endTime : ''}" />
            </div>
            <div class="col-md-2">
                <button type="button" class="btn btn-outline-danger btn-sm btn-remove-schedule"><i class="fas fa-times"></i></button>
            </div>
        `;
        container.appendChild(div);
    }

    // Add assignment
    btnAddAssignment.addEventListener('click', function () {
        addAssignmentForm();
    });

    // Dynamic remove assignment/schedule, add schedule
    assignmentsContainer.addEventListener('click', function (e) {
        if (e.target.closest('.btn-remove-assignment')) {
            e.target.closest('.assignment-form').remove();
        }
        if (e.target.closest('.btn-add-schedule')) {
            const container = e.target.closest('.assignment-form').querySelector('.schedules-container');
            addScheduleForm(container);
        }
        if (e.target.closest('.btn-remove-schedule')) {
            e.target.closest('.schedule-form').remove();
        }
    });

    // Handle form submit (create/update)
    classForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const formData = getClassFormData();
        try {
            let res;
            if (editingClassId) {
                res = await fetch(`${apiBase}/${editingClassId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            } else {
                res = await fetch(apiBase, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            }
            if (!res.ok) {
                const errData = await res.json();
                showToast(errData.message || 'Save failed', 'danger');
                throw new Error(errData.message || 'Save failed');
            }
            showToast('Class saved successfully.');
            showAlert('Class saved successfully.');
            classModal.hide();
            loadClasses();
        } catch (err) {
            showToast(err.message, 'danger');
            showAlert(err.message, 'danger');
        }
    });

    // Collect form data
    function getClassFormData() {
        const classId = document.getElementById('classId').value;
        const className = document.getElementById('className').value;
        const room = document.getElementById('room').value;
        const maxCapacity = parseInt(document.getElementById('maxCapacity').value);
        const status = document.getElementById('status').value;
        const assignments = [];
        assignmentsContainer.querySelectorAll('.assignment-form').forEach(assignmentDiv => {
            const courseId = parseInt(assignmentDiv.querySelector('.assignment-course').value);
            const teacherId = assignmentDiv.querySelector('.assignment-teacher').value;
            const fee = parseFloat(assignmentDiv.querySelector('.assignment-fee').value);
            const startDate = assignmentDiv.querySelector('.assignment-start').value;
            const endDate = assignmentDiv.querySelector('.assignment-end').value;
            const schedules = [];
            assignmentDiv.querySelectorAll('.schedule-form').forEach(scheduleDiv => {
                const dayOfWeek = scheduleDiv.querySelector('.schedule-day').value;
                const startTime = scheduleDiv.querySelector('.schedule-start').value;
                const endTime = scheduleDiv.querySelector('.schedule-end').value;
                schedules.push({ dayOfWeek, startTime, endTime });
            });
            assignments.push({ courseId, teacherId, fee, startDate, endDate, schedules });
        });
        const dto = {
            className,
            room,
            maxCapacity,
            status,
            assignments
        };
        if (editingClassId) dto.classId = parseInt(classId);
        return dto;
    }

    // Initial load
    loadClasses();
}); 