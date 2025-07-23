document.addEventListener('DOMContentLoaded', function () {
    const apiBase = 'https://localhost:7176/api/Users';
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }
    // Try to get token from sessionStorage first, then cookie
    let token = sessionStorage.getItem('Token');
    if (!token) {
        token = getCookie('Token');
    }
    if (!token) {
        window.location.href = '/Login';
        return;
    }
    function showAlert(selector, message, type = 'danger') {
        document.querySelector(selector).innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`;
    }
    function clearAlert(selector) {
        document.querySelector(selector).innerHTML = '';
    }
    function showGlobalAlert(message, type = 'success') {
        showAlert('#userManagementGlobalAlert', message, type);
        setTimeout(() => clearAlert('#userManagementGlobalAlert'), 4000);
    }
    async function handleApiResponse(res, alertSelector, modalId, successMsg) {
        if (res.status === 401) {
            window.location.href = '/Login';
            return;
        }
        if (res.status === 403) {
            showAlert(alertSelector, 'You do not have permission to perform this action.', 'danger');
            return;
        }
        if (res.ok) {
            if (modalId) {
                const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById(modalId));
                modal.hide();
            }
            showGlobalAlert(successMsg, 'success');
            setTimeout(() => location.reload(), 1200);
        } else {
            let msg = await res.text();
            if (!msg) msg = 'An error occurred. Please try again.';
            showAlert(alertSelector, msg);
        }
    }
    // Password eye toggle for Add User
    function attachCreatePasswordToggle() {
        const pwdInput = document.getElementById('createPassword');
        const toggle = document.getElementById('toggleCreatePassword');
        if (pwdInput && toggle) {
            toggle.onclick = function () {
                if (pwdInput.type === 'password') {
                    pwdInput.type = 'text';
                    toggle.innerHTML = '<i class="fas fa-eye"></i>';
                } else {
                    pwdInput.type = 'password';
                    toggle.innerHTML = '<i class="fas fa-eye-slash"></i>';
                }
            };
        }
    }
    // Ensure toggle always works after modal open
    const createUserModal = document.getElementById('createUserModal');
    if (createUserModal) {
        createUserModal.addEventListener('shown.bs.modal', attachCreatePasswordToggle);
        // Also attach on DOMContentLoaded in case modal is already open
        attachCreatePasswordToggle();
    }
    // Add User
    document.getElementById('createUserForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        clearAlert('#createUserAlert');
        const data = {
            fullName: this.fullName.value,
            userName: this.userName.value,
            email: this.email.value,
            password: this.password.value,
            role: parseInt(this.role.value)
        };
        try {
            const res = await fetch(apiBase, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            await handleApiResponse(res, '#createUserAlert', 'createUserModal', 'User created successfully!');
        } catch (err) {
            showAlert('#createUserAlert', err.message);
        }
    });
    // Edit User: open modal and fill data from table row
    document.querySelectorAll('button[data-bs-target="#editUserModal"]').forEach(btn => {
        btn.addEventListener('click', function () {
            const userId = this.getAttribute('data-userid');
            // Find row
            const row = this.closest('tr');
            document.getElementById('editUserId').value = userId;
            document.getElementById('editFullName').value = row.children[0].textContent;
            document.getElementById('editUserName').value = row.children[1].textContent;
            document.getElementById('editEmail').value = row.children[2].textContent;
            // Role: get from hidden attribute or data-role
            let role = 1;
            if (row.children[3].textContent.trim() === 'Teacher') role = 1;
            else if (row.children[3].textContent.trim() === 'Student') role = 2;
            document.getElementById('editRole').value = role;
            document.getElementById('editPassword').value = '';
        });
    });
    // Edit User: submit
    document.getElementById('editUserForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        clearAlert('#editUserAlert');
        const data = {
            id: this.id.value,
            fullName: this.fullName.value,
            userName: this.userName.value,
            email: this.email.value,
            role: parseInt(this.role.value),
            password: this.password.value || undefined
        };
        try {
            const res = await fetch(apiBase, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            await handleApiResponse(res, '#editUserAlert', 'editUserModal', 'User updated successfully!');
        } catch (err) {
            showAlert('#editUserAlert', err.message);
        }
    });
    // View User: open modal and fill data from table row
    document.querySelectorAll('button[data-bs-target="#viewUserModal"]').forEach(btn => {
        btn.addEventListener('click', function () {
            const row = this.closest('tr');
            document.getElementById('viewFullName').textContent = row.children[0].textContent;
            document.getElementById('viewUserName').textContent = row.children[1].textContent;
            document.getElementById('viewEmail').textContent = row.children[2].textContent;
            document.getElementById('viewRole').textContent = row.children[3].textContent;
            document.getElementById('viewStatus').textContent = row.children[4].textContent;
            document.getElementById('viewRegistrationDate').textContent = row.children[5].textContent;
        });
    });
    // Ban User: open modal
    document.querySelectorAll('button[data-bs-target="#banUserModal"]').forEach(btn => {
        btn.addEventListener('click', function () {
            document.getElementById('banUserId').value = this.getAttribute('data-userid');
        });
    });
    // Ban User: confirm
    document.getElementById('confirmBanUserBtn').addEventListener('click', async function () {
        const userId = document.getElementById('banUserId').value;
        try {
            const res = await fetch(`${apiBase}/ban/${userId}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            await handleApiResponse(res, '#userManagementGlobalAlert', 'banUserModal', 'User banned successfully!');
        } catch (err) {
            showGlobalAlert(err.message, 'danger');
        }
    });
    // Unban User: open modal
    document.querySelectorAll('button[data-bs-target="#unbanUserModal"]').forEach(btn => {
        btn.addEventListener('click', function () {
            document.getElementById('unbanUserId').value = this.getAttribute('data-userid');
        });
    });
    // Unban User: confirm
    document.getElementById('confirmUnbanUserBtn').addEventListener('click', async function () {
        const userId = document.getElementById('unbanUserId').value;
        try {
            const res = await fetch(`${apiBase}/unban/${userId}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            await handleApiResponse(res, '#userManagementGlobalAlert', 'unbanUserModal', 'User unbanned successfully!');
        } catch (err) {
            showGlobalAlert(err.message, 'danger');
        }
    });
}); 