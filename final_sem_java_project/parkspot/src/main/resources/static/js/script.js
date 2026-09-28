/**
 * Parking Management System - Frontend Controller Script
 */

document.addEventListener('DOMContentLoaded', () => {
    // ------------------------------------------------------------------
    // DOM Element References
    // ------------------------------------------------------------------
    const entryForm = document.getElementById('entryForm');
    const vehicleNumberInput = document.getElementById('vehicleNumber');
    const flatVisitedInput = document.getElementById('flatVisited');
    const slotNumberInput = document.getElementById('slotNumber');

    const vehicleNumberError = document.getElementById('vehicleNumberError');
    const flatVisitedError = document.getElementById('flatVisitedError');
    const slotNumberError = document.getElementById('slotNumberError');

    const occupiedTableBody = document.getElementById('occupiedTableBody');
    const btnRefreshOccupied = document.getElementById('btnRefreshOccupied');

    const dailyLogForm = document.getElementById('dailyLogForm');
    const logDateInput = document.getElementById('logDate');
    const dailyLogTableBody = document.getElementById('dailyLogTableBody');

    const toast = document.getElementById('toast');
    const navLinks = document.querySelectorAll('.nav-link');

    // API Base URL
    const API_BASE_URL = '/api/parkspot';

    // ------------------------------------------------------------------
    // Initial Setup
    // ------------------------------------------------------------------
    // Set default date picker value to today's date (YYYY-MM-DD)
    const todayStr = new Date().toISOString().split('T')[0];
    logDateInput.value = todayStr;

    // Load initial data
    loadOccupiedSlots();
    loadDailyLog(todayStr);

    // Setup active navigation link highlighting
    setupNavigation();

    // ------------------------------------------------------------------
    // Event Listeners
    // ------------------------------------------------------------------
    // Form Submit: Log Vehicle Entry
    entryForm.addEventListener('submit', handleLogEntry);

    // Refresh Occupied Slots Button
    btnRefreshOccupied.addEventListener('click', loadOccupiedSlots);

    // Form Submit: View Daily Log
    dailyLogForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const selectedDate = logDateInput.value;
        if (!selectedDate) {
            showToast('Please select a valid date', 'error');
            return;
        }
        loadDailyLog(selectedDate);
    });

    // Delegated click for "Exit" buttons inside occupied slots table
    occupiedTableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-exit') || e.target.closest('.btn-exit')) {
            const btn = e.target.classList.contains('btn-exit') ? e.target : e.target.closest('.btn-exit');
            const slotId = btn.getAttribute('data-id');
            if (slotId) {
                handleLogExit(slotId);
            }
        }
    });

    // Input blur handlers for instant validation reset
    vehicleNumberInput.addEventListener('input', () => clearInputError(vehicleNumberInput, vehicleNumberError));
    flatVisitedInput.addEventListener('input', () => clearInputError(flatVisitedInput, flatVisitedError));
    slotNumberInput.addEventListener('input', () => clearInputError(slotNumberInput, slotNumberError));

    // ------------------------------------------------------------------
    // API Calls & Logic Functions
    // ------------------------------------------------------------------

    /**
     * POST /api/parkspot/entry
     * Log new vehicle entry
     */
    async function handleLogEntry(event) {
        event.preventDefault();

        // Perform Client-side Input Validation
        const isValid = validateEntryForm();
        if (!isValid) return;

        const payload = {
            vehicleNumber: vehicleNumberInput.value.trim().toUpperCase(),
            flatVisited: flatVisitedInput.value.trim().toUpperCase(),
            slotNumber: parseInt(slotNumberInput.value, 10)
        };

        const submitBtn = document.getElementById('btnLogEntry');
        setButtonLoading(submitBtn, true, 'Logging...');

        try {
            const response = await fetch(`${API_BASE_URL}/entry`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Failed to log vehicle entry.');
            }

            const data = await response.json();
            showToast(`Vehicle ${data.vehicleNumber || payload.vehicleNumber} entry logged successfully!`, 'success');

            // Reset form
            entryForm.reset();

            // Refresh Occupied Slots and Daily Log
            loadOccupiedSlots();
            if (logDateInput.value) {
                loadDailyLog(logDateInput.value);
            }
        } catch (error) {
            console.error('Error logging entry:', error);
            showToast(error.message || 'Error connecting to server.', 'error');
        } finally {
            setButtonLoading(submitBtn, false, 'Log Entry');
        }
    }

    /**
     * GET /api/parkspot/occupied
     * Fetch and display occupied parking slots
     */
    async function loadOccupiedSlots() {
        renderTableLoading(occupiedTableBody, 7, 'Fetching occupied slots...');

        try {
            const response = await fetch(`${API_BASE_URL}/occupied`);

            if (!response.ok) {
                throw new Error('Failed to fetch occupied slots.');
            }

            const occupiedSlots = await response.json();
            renderOccupiedTable(occupiedSlots);
        } catch (error) {
            console.error('Error fetching occupied slots:', error);
            renderTableMessage(occupiedTableBody, 7, `Error: ${error.message}`, 'empty-cell');
        }
    }

    /**
     * PUT /api/parkspot/exit/{id}
     * Log exit for parked vehicle
     */
    async function handleLogExit(id) {
        if (!confirm(`Are you sure you want to log exit for slot ID #${id}?`)) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/exit/${id}`, {
                method: 'PUT'
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to log vehicle exit.');
            }

            const data = await response.json();
            showToast(`Exit recorded for vehicle ${data.vehicleNumber || ''}!`, 'success');

            // Refresh dynamic tables
            loadOccupiedSlots();
            if (logDateInput.value) {
                loadDailyLog(logDateInput.value);
            }
        } catch (error) {
            console.error('Error logging exit:', error);
            showToast(error.message || 'Error processing exit request.', 'error');
        }
    }

    /**
     * GET /api/parkspot/daily-log/{date}
     * Fetch and display daily log for a specific date
     */
    async function loadDailyLog(dateStr) {
        renderTableLoading(dailyLogTableBody, 6, `Fetching records for ${dateStr}...`);

        try {
            const response = await fetch(`${API_BASE_URL}/daily-log/${dateStr}`);

            if (!response.ok) {
                throw new Error('Failed to fetch daily log records.');
            }

            const logs = await response.json();
            renderDailyLogTable(logs);
        } catch (error) {
            console.error('Error fetching daily log:', error);
            renderTableMessage(dailyLogTableBody, 6, `Error: ${error.message}`, 'empty-cell');
        }
    }

    // ------------------------------------------------------------------
    // Rendering Helpers
    // ------------------------------------------------------------------

    /**
     * Render Occupied Slots Table HTML
     */
    function renderOccupiedTable(slots) {
        if (!Array.isArray(slots) || slots.length === 0) {
            renderTableMessage(occupiedTableBody, 7, 'No occupied slots at the moment.', 'empty-cell');
            return;
        }

        occupiedTableBody.innerHTML = slots.map(slot => `
            <tr>
                <td><strong>#${slot.id}</strong></td>
                <td><span class="badge badge-occupied">${escapeHtml(slot.vehicleNumber)}</span></td>
                <td>${escapeHtml(slot.flatNumber)}</td>
                <td>Slot ${slot.slotNumber}</td>
                <td>${formatDateTime(slot.entryTime)}</td>
                <td>${slot.exitTime ? formatDateTime(slot.exitTime) : '<span class="text-muted">-- Still Parked --</span>'}</td>
                <td>
                    <button class="btn btn-danger btn-sm btn-exit" data-id="${slot.id}">
                        Exit
                    </button>
                </td>
            </tr>
        `).join('');
    }

    /**
     * Render Daily Log Table HTML
     */
    function renderDailyLogTable(logs) {
        if (!Array.isArray(logs) || logs.length === 0) {
            renderTableMessage(dailyLogTableBody, 6, 'No parking activity logged for this date.', 'empty-cell');
            return;
        }

        dailyLogTableBody.innerHTML = logs.map(log => `
            <tr>
                <td><strong>#${log.id}</strong></td>
                <td><strong>${escapeHtml(log.vehicleNumber)}</strong></td>
                <td>${escapeHtml(log.flatNumber)}</td>
                <td>Slot ${log.slotNumber}</td>
                <td>${formatDateTime(log.entryTime)}</td>
                <td>${log.exitTime ? formatDateTime(log.exitTime) : '<span class="badge badge-occupied">Parked</span>'}</td>
            </tr>
        `).join('');
    }

    function renderTableLoading(tbody, colspan, message) {
        tbody.innerHTML = `<tr><td colspan="${colspan}" class="loading-cell">⏳ ${message}</td></tr>`;
    }

    function renderTableMessage(tbody, colspan, message, className) {
        tbody.innerHTML = `<tr><td colspan="${colspan}" class="${className}">${message}</td></tr>`;
    }

    // ------------------------------------------------------------------
    // Validation & Utility Helpers
    // ------------------------------------------------------------------

    function validateEntryForm() {
        let valid = true;

        const vehicleVal = vehicleNumberInput.value.trim();
        const flatVal = flatVisitedInput.value.trim();
        const slotVal = slotNumberInput.value.trim();

        if (!vehicleVal) {
            setInputError(vehicleNumberInput, vehicleNumberError, 'Vehicle number is required.');
            valid = false;
        } else {
            clearInputError(vehicleNumberInput, vehicleNumberError);
        }

        if (!flatVal) {
            setInputError(flatVisitedInput, flatVisitedError, 'Flat visited is required.');
            valid = false;
        } else {
            clearInputError(flatVisitedInput, flatVisitedError);
        }

        if (!slotVal || isNaN(slotVal) || parseInt(slotVal, 10) <= 0) {
            setInputError(slotNumberInput, slotNumberError, 'Please enter a valid slot number (> 0).');
            valid = false;
        } else {
            clearInputError(slotNumberInput, slotNumberError);
        }

        return valid;
    }

    function setInputError(input, errorEl, message) {
        input.classList.add('invalid');
        if (errorEl) errorEl.textContent = message;
    }

    function clearInputError(input, errorEl) {
        input.classList.remove('invalid');
        if (errorEl) errorEl.textContent = '';
    }

    function setButtonLoading(button, isLoading, text) {
        if (isLoading) {
            button.disabled = true;
            button.innerHTML = `<span>⏳ ${text}</span>`;
        } else {
            button.disabled = false;
            button.innerHTML = `<span>${text}</span>`;
        }
    }

    /**
     * Display temporary floating toast notification
     */
    function showToast(message, type = 'success') {
        toast.textContent = message;
        toast.className = `toast toast-${type}`;

        setTimeout(() => {
            toast.classList.add('hidden');
        }, 4000);
    }

    /**
     * Format ISO datetime string (e.g. 2026-09-28T14:30:00 -> 28/09/2026, 02:30 PM)
     */
    function formatDateTime(dateTimeStr) {
        if (!dateTimeStr) return '--';
        try {
            const dt = new Date(dateTimeStr);
            if (isNaN(dt.getTime())) return dateTimeStr;
            return dt.toLocaleString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (e) {
            return dateTimeStr;
        }
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function setupNavigation() {
        window.addEventListener('hashchange', updateActiveNavLink);
        updateActiveNavLink();
    }

    function updateActiveNavLink() {
        const currentHash = window.location.hash || '#home';
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentHash) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
});
