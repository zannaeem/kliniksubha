import { supabase } from '../../js/supabase.js'

// Global variables
let currentAppointments = []
let filteredAppointments = []
let currentStatsPeriod = 'day'
let whatsappSettings = {
    defaultNumber: '60162235212', // Default clinic number
    messageTemplate: 'Hello {name}, this is Klinik Subha. Your appointment for {service} has been {status} for {date} {time}. Please contact us at +60162235212 if you have any questions.'
}

// Load WhatsApp settings from localStorage
function loadWhatsAppSettings() {
    const savedSettings = localStorage.getItem('whatsappSettings')
    if (savedSettings) {
        whatsappSettings = JSON.parse(savedSettings)
    }
    
    // Populate form fields
    document.getElementById('whatsappDefaultNumber').value = whatsappSettings.defaultNumber || ''
    document.getElementById('whatsappMessageTemplate').value = whatsappSettings.messageTemplate || ''
}

// Save WhatsApp settings to localStorage
function saveWhatsAppSettings() {
    whatsappSettings.defaultNumber = document.getElementById('whatsappDefaultNumber').value
    whatsappSettings.messageTemplate = document.getElementById('whatsappMessageTemplate').value
    
    localStorage.setItem('whatsappSettings', JSON.stringify(whatsappSettings))
    showSuccess('WhatsApp settings saved successfully!')
}

// Generate WhatsApp message URL
function generateWhatsAppUrl(appointment) {
    // Use patient's phone if available, otherwise use default clinic number
    let phone = appointment.patient_phone || whatsappSettings.defaultNumber
    
    // Clean the phone number (remove spaces, dashes, etc.)
    phone = phone.replace(/\D/g, '')
    
    // Add country code if not present
    if (!phone.startsWith('60')) {
        // If number starts with 0, remove it and add 60
        if (phone.startsWith('0')) {
            phone = '60' + phone.substring(1)
        }
        // If number is 10 or 11 digits without country code, add 60
        else if (phone.length === 10 || phone.length === 11) {
            phone = '60' + phone
        }
    }
    
    // Format date and time for message
    const dateStr = appointment.preferred_date ? new Date(appointment.preferred_date).toLocaleDateString() : 'not specified'
    const timeStr = appointment.preferred_time || 'not specified'
    
    // Replace placeholders in template
    let message = whatsappSettings.messageTemplate
        .replace('{name}', appointment.patient_name || 'Patient')
        .replace('{service}', appointment.service_type || 'consultation')
        .replace('{status}', appointment.status || 'scheduled')
        .replace('{date}', dateStr)
        .replace('{time}', timeStr)
    
    // Encode message for URL
    message = encodeURIComponent(message)
    
    return `https://wa.me/${phone}?text=${message}`
}

// Open WhatsApp chat with patient
function openWhatsAppChat(appointmentId) {
    const appointment = currentAppointments.find(app => app.id === appointmentId)
    if (!appointment) return
    
    const whatsappUrl = generateWhatsAppUrl(appointment)
    window.open(whatsappUrl, '_blank')
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        console.log('Loading dashboard statistics...')
        
        // Load appointments from Supabase
        const { data: appointments, error } = await supabase
            .from('appointments')
            .select('*')
            .order('created_at', { ascending: false })
        
        if (error) throw error
        
        currentAppointments = appointments || []
        
        // Update stats
        const totalAppointments = currentAppointments.length
        const pendingAppointments = currentAppointments.filter(app => app.status === 'pending').length
        const confirmedAppointments = currentAppointments.filter(app => app.status === 'confirmed').length
        
        document.getElementById('totalAppointments').textContent = totalAppointments
        document.getElementById('pendingAppointments').textContent = pendingAppointments
        document.getElementById('confirmedAppointments').textContent = confirmedAppointments
        
        // Load appointments into table
        await loadAppointmentsTable()
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error)
        showError('Error loading dashboard data: ' + error.message)
    }
}

// Load appointments into table
async function loadAppointmentsTable(appointments = currentAppointments) {
    const tableBody = document.querySelector('#appointmentsTable tbody')
    const loadingSpinner = document.getElementById('loadingSpinner')
    const noAppointments = document.getElementById('noAppointments')
    
    // Show loading spinner
    loadingSpinner.style.display = 'block'
    noAppointments.style.display = 'none'
    tableBody.innerHTML = ''
    
    if (appointments.length === 0) {
        loadingSpinner.style.display = 'none'
        noAppointments.style.display = 'block'
        return
    }
    
    // Populate table
    appointments.forEach(appointment => {
        const row = createAppointmentRow(appointment)
        tableBody.appendChild(row)
    })
    
    loadingSpinner.style.display = 'none'
}

// Create appointment table row
function createAppointmentRow(appointment) {
    const row = document.createElement('tr')
    
    // Format date and time
    const dateTime = formatDateTime(appointment.preferred_date, appointment.preferred_time)
    
    // Status badge
    const statusBadge = `<span class="status-badge ${appointment.status || 'pending'}">${appointment.status || 'pending'}</span>`
    
    // Actions
    const actions = `
        <button class="btn btn-sm btn-outline-primary btn-action me-1" onclick="viewAppointment('${appointment.id}')">
            <i class="bi bi-eye"></i>
        </button>
        ${appointment.status === 'pending' ? `
            <button class="btn btn-sm btn-confirm btn-action me-1" onclick="updateAppointmentStatus('${appointment.id}', 'confirmed')">
                <i class="bi bi-check-circle"></i>
            </button>
        ` : ''}
        <button class="btn btn-sm btn-outline-danger btn-action me-1" onclick="updateAppointmentStatus('${appointment.id}', 'cancelled')">
            <i class="bi bi-x-circle"></i>
        </button>
        <button class="btn btn-sm btn-whatsapp btn-action" onclick="openWhatsAppChat('${appointment.id}')">
            <i class="fab fa-whatsapp"></i>
        </button>
    `
    
    row.innerHTML = `
        <td>${appointment.patient_name || 'N/A'}</td>
        <td>${appointment.service_type || 'N/A'}</td>
        <td>${dateTime}</td>
        <td>${appointment.patient_phone || 'N/A'}</td>
        <td>${appointment.patient_ic_email || 'N/A'}</td>
        <td>${(appointment.additional_notes || '').substring(0, 50)}${(appointment.additional_notes || '').length > 50 ? '...' : ''}</td>
        <td>${statusBadge}</td>
        <td>${actions}</td>
    `
    
    return row
}

// Format date and time
function formatDateTime(date, time) {
    if (!date && !time) return 'Not specified'
    
    let result = ''
    if (date) {
        result += new Date(date).toLocaleDateString()
    }
    if (time) {
        result += (result ? ' ' : '') + time
    }
    return result || 'Not specified'
}

// View appointment details
window.viewAppointment = function(appointmentId) {
    const appointment = currentAppointments.find(app => app.id === appointmentId)
    if (!appointment) return
    
    const modalBody = document.querySelector('#appointmentModal .modal-body')
    modalBody.innerHTML = `
        <div>
            <strong>Patient Name:</strong> ${appointment.patient_name || 'N/A'}<br>
            <strong>Service Type:</strong> ${appointment.service_type || 'N/A'}<br>
            <strong>Date:</strong> ${appointment.preferred_date || 'N/A'}<br>
            <strong>Time:</strong> ${appointment.preferred_time || 'N/A'}<br>
            <strong>Phone:</strong> ${appointment.patient_phone || 'N/A'}<br>
            <strong>IC/Email:</strong> ${appointment.patient_ic_email || 'N/A'}<br>
            <strong>Notes:</strong> ${appointment.additional_notes || 'N/A'}<br>
            <strong>Status:</strong> <span class="status-badge ${appointment.status}">${appointment.status}</span><br>
            <strong>Submitted:</strong> ${appointment.created_at ? new Date(appointment.created_at).toLocaleString() : 'N/A'}
        </div>
        <div class="mt-3">
            <a href="#" class="btn btn-whatsapp" onclick="openWhatsAppChat('${appointment.id}'); return false;">
                <i class="fab fa-whatsapp me-2"></i>Contact via WhatsApp
            </a>
        </div>
    `
    
    // Set up modal buttons
    document.getElementById('confirmAppointment').onclick = () => {
        updateAppointmentStatus(appointmentId, 'confirmed')
        bootstrap.Modal.getInstance(document.getElementById('appointmentModal')).hide()
    }
    
    document.getElementById('cancelAppointment').onclick = () => {
        updateAppointmentStatus(appointmentId, 'cancelled')
        bootstrap.Modal.getInstance(document.getElementById('appointmentModal')).hide()
    }
    
    // Show/hide buttons based on current status
    const confirmBtn = document.getElementById('confirmAppointment')
    const cancelBtn = document.getElementById('cancelAppointment')
    
    if (appointment.status === 'confirmed') {
        confirmBtn.style.display = 'none'
        cancelBtn.textContent = 'Cancel Appointment'
    } else if (appointment.status === 'cancelled') {
        confirmBtn.textContent = 'Reconfirm Appointment'
        cancelBtn.style.display = 'none'
    } else {
        confirmBtn.style.display = 'block'
        confirmBtn.textContent = 'Confirm Appointment'
        cancelBtn.style.display = 'block'
        cancelBtn.textContent = 'Cancel Appointment'
    }
    
    // Show modal
    new bootstrap.Modal(document.getElementById('appointmentModal')).show()
}

// Update appointment status
window.updateAppointmentStatus = async function(appointmentId, status) {
    try {
        const { error } = await supabase
            .from('appointments')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', appointmentId)
        
        if (error) throw error
        
        // Update local data
        const appointment = currentAppointments.find(app => app.id === appointmentId)
        if (appointment) {
            appointment.status = status
        }
        
        // Reload table and stats
        await loadDashboardStats()
        
        showSuccess(`Appointment ${status} successfully!`)
    } catch (error) {
        console.error('Error updating appointment:', error)
        showError('Error updating appointment: ' + error.message)
    }
}

// Search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput')
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase()
            
            const filteredAppointments = currentAppointments.filter(appointment => 
                (appointment.patient_name || '').toLowerCase().includes(searchTerm) ||
                (appointment.service_type || '').toLowerCase().includes(searchTerm) ||
                (appointment.patient_phone || '').toLowerCase().includes(searchTerm) ||
                (appointment.patient_ic_email || '').toLowerCase().includes(searchTerm)
            )
            
            // Update table with filtered results
            const tableBody = document.querySelector('#appointmentsTable tbody')
            tableBody.innerHTML = ''
            
            filteredAppointments.forEach(appointment => {
                const row = createAppointmentRow(appointment)
                tableBody.appendChild(row)
            })
            
            // Show/hide no results message
            const noAppointments = document.getElementById('noAppointments')
            if (noAppointments) {
                noAppointments.style.display = 
                    filteredAppointments.length === 0 ? 'block' : 'none'
            }
        })
    }
})

// Sign out function
window.handleSignOut = async function() {
    try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        window.location.href = '/login.html'
    } catch (error) {
        console.error('Error signing out:', error)
        showError('Error signing out: ' + error.message)
    }
}

// Show success message
function showSuccess(message) {
    // Simple alert for now - you can implement toast notifications later
    alert(message)
}

// Show error message
function showError(message) {
    // Simple alert for now - you can implement toast notifications later
    alert(message)
}

// Real-time subscription to appointments
function setupRealtimeSubscription() {
    supabase
        .channel('appointments')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'appointments' },
            (payload) => {
                console.log('Real-time update:', payload)
                loadDashboardStats() // Reload data when changes occur
            }
        )
        .subscribe()
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Dashboard loading...')
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
        window.location.href = '/login.html'
        return
    }
    
    // Display admin email
    const adminEmailElement = document.getElementById('adminEmail')
    if (adminEmailElement) {
        adminEmailElement.textContent = session.user.email
    }
    
    // Load WhatsApp settings
    loadWhatsAppSettings()
    
    // Set up WhatsApp settings save button
    document.getElementById('saveWhatsappSettings').addEventListener('click', saveWhatsAppSettings)
    
    // Load dashboard data
    await loadDashboardStats()
    
    // Set up real-time subscription
    setupRealtimeSubscription()
    
    // Set up auto-refresh every 30 seconds (backup for real-time)
    setInterval(loadDashboardStats, 30000)
})

// Export functions for external use
window.dashboard = {
    loadDashboardStats,
    viewAppointment,
    updateAppointmentStatus
}

// Expose WhatsApp functions to window
window.openWhatsAppChat = openWhatsAppChat;

function filterAppointmentsByDate(startDate, endDate) {
    filteredAppointments = currentAppointments.filter(app => {
        if (!app.preferred_date) return false;
        const appDate = new Date(app.preferred_date);
        return (!startDate || appDate >= startDate) && (!endDate || appDate <= endDate);
    });
    loadAppointmentsTable(filteredAppointments);
}

document.getElementById('applyDateFilter').onclick = function() {
    const start = document.getElementById('filterStartDate').value ? new Date(document.getElementById('filterStartDate').value) : null;
    const end = document.getElementById('filterEndDate').value ? new Date(document.getElementById('filterEndDate').value) : null;
    filterAppointmentsByDate(start, end);
};

document.getElementById('resetDateFilter').onclick = function() {
    document.getElementById('filterStartDate').value = '';
    document.getElementById('filterEndDate').value = '';
    loadAppointmentsTable(currentAppointments);
};

// Quick filter helpers
function getTodayRange() {
    const today = new Date();
    today.setHours(0,0,0,0);
    const end = new Date(today);
    end.setHours(23,59,59,999);
    return [today, end];
}

function getWeekRange() {
    const now = new Date();
    const first = now.getDate() - now.getDay();
    const last = first + 6;
    const start = new Date(now.setDate(first));
    start.setHours(0,0,0,0);
    const end = new Date(now.setDate(last));
    end.setHours(23,59,59,999);
    return [start, end];
}

function getMonthRange() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    end.setHours(23,59,59,999);
    return [start, end];
}

function getYearRange() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31);
    end.setHours(23,59,59,999);
    return [start, end];
}

// Date filter logic
function filterAppointmentsByDateStatus(startDate, endDate, status) {
    let filtered = currentAppointments.filter(app => {
        if (!app.preferred_date) return false;
        const appDate = new Date(app.preferred_date);
        let dateMatch = (!startDate || appDate >= startDate) && (!endDate || appDate <= endDate);
        let statusMatch = !status || app.status === status;
        return dateMatch && statusMatch;
    });
    loadAppointmentsTable(filtered);
}

// Date filter events
document.getElementById('applyDateFilter').onclick = function() {
    const start = document.getElementById('filterStartDate').value ? new Date(document.getElementById('filterStartDate').value) : null;
    const end = document.getElementById('filterEndDate').value ? new Date(document.getElementById('filterEndDate').value) : null;
    const status = document.getElementById('statusFilter').value;
    filterAppointmentsByDateStatus(start, end, status);
};

document.getElementById('resetDateFilter').onclick = function() {
    document.getElementById('filterStartDate').value = '';
    document.getElementById('filterEndDate').value = '';
    document.getElementById('statusFilter').value = '';
    loadAppointmentsTable(currentAppointments);
};

document.getElementById('statusFilter').onchange = function() {
    document.getElementById('applyDateFilter').click();
};

document.getElementById('filterToday').onclick = function() {
    const [start, end] = getTodayRange();
    filterAppointmentsByDateStatus(start, end, document.getElementById('statusFilter').value);
};

document.getElementById('filterWeek').onclick = function() {
    const [start, end] = getWeekRange();
    filterAppointmentsByDateStatus(start, end, document.getElementById('statusFilter').value);
};

document.getElementById('filterMonth').onclick = function() {
    const [start, end] = getMonthRange();
    filterAppointmentsByDateStatus(start, end, document.getElementById('statusFilter').value);
};

document.getElementById('filterYear').onclick = function() {
    const [start, end] = getYearRange();
    filterAppointmentsByDateStatus(start, end, document.getElementById('statusFilter').value);
};

// Fetch and display appointment statistics
async function loadAppointmentStats() {
    const statsDiv = document.getElementById('appointmentStats');
    if (!statsDiv) return;
    try {
        const { data, error } = await supabase
            .from('appointments')
            .select('status', { count: 'exact', head: false });
        if (error) throw error;
        // Calculate stats
        let total = data.length;
        let confirmed = data.filter(a => a.status === 'confirmed').length;
        let pending = data.filter(a => a.status === 'pending').length;
        let rejected = data.filter(a => a.status === 'rejected').length;
        statsDiv.innerHTML = `
            <div class="row g-3 mb-4">
                <div class="col-md-3">
                    <div class="card text-center shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">Total Appointments</h5>
                            <p class="display-6">${total}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">Confirmed</h5>
                            <p class="display-6 text-success">${confirmed}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">Pending</h5>
                            <p class="display-6 text-warning">${pending}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">Rejected</h5>
                            <p class="display-6 text-danger">${rejected}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (err) {
        statsDiv.innerHTML = '<div class="alert alert-danger">Failed to load statistics.</div>';
    }
}

// Call stats loader on page load
window.addEventListener('DOMContentLoaded', loadAppointmentStats);

// Enhanced: Show only selected period in time-filtered stats
function updateTimeFilteredStats() {
    const statsDiv = document.getElementById('timeFilteredStats');
    if (!statsDiv) return;
    // Helper to filter by date range
    function filterByRange(start, end) {
        return currentAppointments.filter(app => {
            if (!app.preferred_date) return false;
            const appDate = new Date(app.preferred_date);
            return appDate >= start && appDate <= end;
        });
    }
    // Helper to count by status
    function countByStatus(arr, status) {
        return arr.filter(app => app.status === status).length;
    }
    // Get date ranges
    const now = new Date();
    now.setHours(0,0,0,0);
    // Today
    const todayStart = new Date(now);
    const todayEnd = new Date(now); todayEnd.setHours(23,59,59,999);
    // Week
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6); weekEnd.setHours(23,59,59,999);
    // Month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0); monthEnd.setHours(23,59,59,999);
    // Year
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearEnd = new Date(now.getFullYear(), 11, 31); yearEnd.setHours(23,59,59,999);
    // Calculate stats for selected period
    let period = { label: '', arr: [] };
    if (currentStatsPeriod === 'day') {
        period = { label: 'Today', arr: filterByRange(todayStart, todayEnd) };
    } else if (currentStatsPeriod === 'week') {
        period = { label: 'This Week', arr: filterByRange(weekStart, weekEnd) };
    } else if (currentStatsPeriod === 'month') {
        period = { label: 'This Month', arr: filterByRange(monthStart, monthEnd) };
    } else if (currentStatsPeriod === 'year') {
        period = { label: 'This Year', arr: filterByRange(yearStart, yearEnd) };
    }
    let html = `<div class="col-md-12 mb-3">
        <div class="stats-card">
            <small class="text-muted">${period.label}</small>
            <div>Total: <b>${period.arr.length}</b></div>
            <div>Pending: <b class='text-warning'>${countByStatus(period.arr, 'pending')}</b></div>
            <div>Confirmed: <b class='text-success'>${countByStatus(period.arr, 'confirmed')}</b></div>
        </div>
    </div>`;
    statsDiv.innerHTML = html;
}

// Button group event listeners
window.addEventListener('DOMContentLoaded', function() {
    const group = document.getElementById('statsPeriodGroup');
    if (group) {
        group.querySelectorAll('button[data-period]').forEach(btn => {
            btn.addEventListener('click', function() {
                group.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentStatsPeriod = this.getAttribute('data-period');
                updateTimeFilteredStats();
            });
        });
    }
});

// Call after loading stats
const origLoadDashboardStats = loadDashboardStats;
window.loadDashboardStats = async function() {
    await origLoadDashboardStats();
    updateTimeFilteredStats();
}; 