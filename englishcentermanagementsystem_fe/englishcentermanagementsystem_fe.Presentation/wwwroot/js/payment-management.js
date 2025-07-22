const apiBase = 'https://localhost:7176/api/payment';

// Elements
const viewMode = document.getElementById('viewMode');
const studentIdInput = document.getElementById('studentIdInput');
const btnFetchStudent = document.getElementById('btnFetchStudent');
const paymentTableBody = document.querySelector('#paymentTable tbody');
const alertPlaceholder = document.getElementById('alertPlaceholder');
const toastContainer = document.getElementById('toastContainer');

// Modals
const statusModal = new bootstrap.Modal(document.getElementById('statusModal'));
const refundModal = new bootstrap.Modal(document.getElementById('refundModal'));

let currentPayments = [];
let currentView = 'student';

function showAlert(message, type = 'success') {
    alertPlaceholder.innerHTML = `<div class="alert alert-${type} alert-dismissible" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
}

function showToast(message, type = 'success') {
    const toastId = `toast${Date.now()}`;
    const toastHtml = `<div id="${toastId}" class="toast align-items-center text-bg-${type} border-0 mb-2" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3000">
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    </div>`;
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    const toastEl = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

function renderTable(payments) {
    paymentTableBody.innerHTML = '';
    if (!payments || payments.length === 0) {
        paymentTableBody.innerHTML = '<tr><td colspan="9" class="text-center">No payment records found.</td></tr>';
        return;
    }
    payments.forEach(p => {
        paymentTableBody.insertAdjacentHTML('beforeend', `
            <tr>
                <td>${p.paymentId}</td>
                <td>${p.studentName} <br/><small class="text-muted">${p.studentId}</small></td>
                <td>${p.className}</td>
                <td>${p.courseName}</td>
                <td>${p.amount.toLocaleString(undefined, {style: 'currency', currency: 'USD'})}</td>
                <td>${new Date(p.paymentDate).toLocaleDateString()}</td>
                <td><span class="badge bg-${getStatusColor(p.status)}">${p.status}</span></td>
                <td>
                    ${p.isRefunded ? `<span class="badge bg-info">Refunded</span><br/><small>${p.refundAmount ? p.refundAmount.toLocaleString(undefined, {style: 'currency', currency: 'USD'}) : ''}</small>` :
                        `<button class="btn btn-outline-warning btn-sm" data-action="refund" data-id="${p.paymentId}" ${p.status !== 'Paid' ? 'disabled' : ''}>Refund</button>`}
                </td>
                <td>
                    ${currentView === 'admin' ? `<button class="btn btn-outline-primary btn-sm" data-action="status" data-id="${p.paymentId}">Update Status</button>` : ''}
                </td>
            </tr>
        `);
    });
}

function getStatusColor(status) {
    switch (status) {
        case 'Paid': return 'success';
        case 'Pending': return 'warning';
        case 'Failed': return 'danger';
        case 'Refunded': return 'info';
        default: return 'secondary';
    }
}

async function fetchPayments() {
    if (currentView === 'student') {
        const studentId = studentIdInput.value.trim();
        if (!studentId) {
            showAlert('Please enter a Student ID.', 'warning');
            return;
        }
        try {
            const res = await axios.get(`${apiBase}/student`, { params: { studentId } });
            currentPayments = res.data;
            renderTable(currentPayments);
        } catch (err) {
            showAlert('Failed to fetch student payment history.', 'danger');
        }
    } else {
        try {
            const res = await axios.get(`${apiBase}/admin`);
            currentPayments = res.data;
            renderTable(currentPayments);
        } catch (err) {
            showAlert('Failed to fetch all payments.', 'danger');
        }
    }
}

// Event Listeners
viewMode.addEventListener('change', () => {
    currentView = viewMode.value;
    if (currentView === 'student') {
        studentIdInput.style.display = '';
        btnFetchStudent.classList.remove('d-none');
        paymentTableBody.innerHTML = '';
    } else {
        studentIdInput.style.display = 'none';
        btnFetchStudent.classList.add('d-none');
        fetchPayments();
    }
});

btnFetchStudent.addEventListener('click', fetchPayments);

paymentTableBody.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const paymentId = btn.getAttribute('data-id');
    const action = btn.getAttribute('data-action');
    if (action === 'status') {
        document.getElementById('statusPaymentId').value = paymentId;
        statusModal.show();
    } else if (action === 'refund') {
        document.getElementById('refundPaymentId').value = paymentId;
        document.getElementById('refundAmount').value = '';
        document.getElementById('refundNote').value = '';
        refundModal.show();
    }
});

// Update Status Form
const statusForm = document.getElementById('statusForm');
statusForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const paymentId = document.getElementById('statusPaymentId').value;
    const newStatus = document.getElementById('newStatus').value;
    try {
        await axios.put(`${apiBase}/${paymentId}/status`, JSON.stringify(newStatus), {
            headers: { 'Content-Type': 'application/json' }
        });
        showToast('Payment status updated.');
        statusModal.hide();
        fetchPayments();
    } catch (err) {
        showAlert('Failed to update payment status.', 'danger');
    }
});

// Refund Form
const refundForm = document.getElementById('refundForm');
refundForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const paymentId = document.getElementById('refundPaymentId').value;
    const amount = parseFloat(document.getElementById('refundAmount').value);
    const note = document.getElementById('refundNote').value;
    try {
        await axios.post(`${apiBase}/${paymentId}/refund`, { amount, note });
        showToast('Refund processed.','info');
        refundModal.hide();
        fetchPayments();
    } catch (err) {
        showAlert('Failed to process refund.', 'danger');
    }
});

// Initial state
if (viewMode.value === 'admin') {
    fetchPayments();
} 