// API Base URL Resolution (Works for Vercel production, localhost, and file://)
const API_BASE = (window.location.protocol === 'file:' || ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port && window.location.port !== '5000'))
    ? 'http://localhost:5000/api'
    : '/api';

// State
let token = localStorage.getItem('hvt_admin_token') || null;
let currentAdmin = null;
try {
    const rawUser = localStorage.getItem('hvt_admin_user');
    if (rawUser && rawUser !== 'undefined' && rawUser !== 'null') {
        currentAdmin = JSON.parse(rawUser);
    }
} catch (e) {
    console.warn('Resetting corrupt admin session:', e);
    currentAdmin = null;
    localStorage.removeItem('hvt_admin_user');
    localStorage.removeItem('hvt_admin_token');
    token = null;
}
let currentTab = 'dashboard';
let allBookings = [];
let allRooms = [];


// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
});

function initApp() {
    if (token && currentAdmin) {
        showAppView();
        loadTabContent(currentTab);
    } else {
        showLoginView();
    }
}

// View Switches
function showLoginView() {
    document.getElementById('loginView').classList.remove('hidden');
    document.getElementById('appView').classList.add('hidden');
}

function showAppView() {
    document.getElementById('loginView').classList.add('hidden');
    document.getElementById('appView').classList.remove('hidden');
    if (currentAdmin) {
        document.getElementById('adminUserName').textContent = currentAdmin.name || 'Admin';
        document.getElementById('adminUserRole').textContent = currentAdmin.role || 'Manager';
        document.getElementById('adminUserAvatar').textContent = (currentAdmin.name || 'A')[0].toUpperCase();
    }
}

// Event Listeners
function setupEventListeners() {
    // Login Form
    document.getElementById('adminLoginForm')?.addEventListener('submit', handleLogin);

    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);

    // Sidebar Tabs
    document.querySelectorAll('.sidebar .nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });

    // Mobile Sidebar Toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            document.getElementById('sidebar')?.classList.toggle('active');
        });
    }

    // Change Password Form
    document.getElementById('openChangePassBtn')?.addEventListener('click', () => openModal('changePassModal'));
    document.getElementById('changePassForm')?.addEventListener('submit', handleChangePassword);

    // Room Modals & Forms
    document.getElementById('openAddRoomBtn')?.addEventListener('click', () => openAddRoomModal());
    document.getElementById('roomForm')?.addEventListener('submit', handleSaveRoom);

    // Filter & Search Controls
    document.getElementById('bookingSearchInput')?.addEventListener('input', filterBookingsTable);
    document.getElementById('bookingFilterStatus')?.addEventListener('change', filterBookingsTable);
    document.getElementById('customerSearchInput')?.addEventListener('input', filterCustomersTable);
    document.getElementById('reviewFilterStatus')?.addEventListener('change', loadReviews);

    // Gallery Form
    document.getElementById('addGalleryForm')?.addEventListener('submit', handleAddGallery);

    // Reply Form
    document.getElementById('replyForm')?.addEventListener('submit', handleSendReply);

    // Settings Form
    document.getElementById('settingsForm')?.addEventListener('submit', handleSaveSettings);
}

// Tab Switching
function switchTab(tabName) {
    currentTab = tabName;
    document.querySelectorAll('.sidebar .nav-item').forEach(b => {
        b.classList.toggle('active', b.dataset.tab === tabName);
    });
    document.querySelectorAll('.tab-content').forEach(tc => {
        tc.classList.toggle('active', tc.id === `tab-${tabName}`);
    });

    // Page titles
    const titles = {
        dashboard: 'Dashboard Overview',
        bookings: 'Booking Management',
        rooms: 'Room Management',
        customers: 'Customer Directory',
        reviews: 'Review Moderation',
        gallery: 'Gallery & Media Management',
        messages: 'Customer Inquiries & Messages',
        settings: 'System & Hotel Settings'
    };
    document.getElementById('pageTitle').textContent = titles[tabName] || 'Admin Panel';

    // Close mobile sidebar if open
    document.getElementById('sidebar').classList.remove('active');

    loadTabContent(tabName);
}

// Local mock database for offline / GitHub Pages demo mode
const mockDb = {
    rooms: [
        {
            _id: 'r1',
            name: 'Deluxe Room',
            roomNumber: '101',
            type: 'deluxe',
            pricePerNight: 2499,
            bedType: 'King',
            maxGuests: 2,
            status: 'available',
            description: 'Spacious air-conditioned room with king bed & mountain view.',
            images: [{ url: 'Room1.jpeg' }]
        },
        {
            _id: 'r2',
            name: 'Executive Room',
            roomNumber: '201',
            type: 'executive',
            pricePerNight: 3499,
            bedType: 'King',
            maxGuests: 3,
            status: 'available',
            description: 'Premium business-class room with dedicated desk & mini-fridge.',
            images: [{ url: 'Room2.jpeg' }]
        },
        {
            _id: 'r3',
            name: 'Family Suite',
            roomNumber: '301',
            type: 'family',
            pricePerNight: 4999,
            bedType: 'King',
            maxGuests: 4,
            status: 'occupied',
            description: 'Luxurious suite with 2 king bedrooms, living area & balcony.',
            images: [{ url: 'Room1.0.png' }]
        }
    ],
    bookings: [
        {
            _id: 'b1',
            bookingId: 'HVT-2026-001',
            guestName: 'Rajesh Sharma',
            guestPhone: '+91 98765 43210',
            guestEmail: 'rajesh.sharma@example.com',
            room: { _id: 'r1', name: 'Deluxe Room', type: 'deluxe' },
            checkIn: '2026-09-05T00:00:00.000Z',
            checkOut: '2026-09-07T00:00:00.000Z',
            guests: 2,
            nights: 2,
            pricePerNight: 2499,
            totalAmount: 4998,
            finalAmount: 4998,
            status: 'confirmed',
            paymentStatus: 'paid',
            createdAt: '2026-09-04T10:00:00.000Z'
        },
        {
            _id: 'b2',
            bookingId: 'HVT-2026-002',
            guestName: 'Amit Verma',
            guestPhone: '+91 98123 45678',
            guestEmail: 'amit.verma@example.com',
            room: { _id: 'r2', name: 'Executive Room', type: 'executive' },
            checkIn: '2026-09-06T00:00:00.000Z',
            checkOut: '2026-09-08T00:00:00.000Z',
            guests: 2,
            nights: 2,
            pricePerNight: 3499,
            totalAmount: 6998,
            finalAmount: 6998,
            status: 'pending',
            paymentStatus: 'pending',
            createdAt: '2026-09-04T14:30:00.000Z'
        },
        {
            _id: 'b3',
            bookingId: 'HVT-2026-003',
            guestName: 'Priya Singh',
            guestPhone: '+91 97531 86420',
            guestEmail: 'priya.singh@example.com',
            room: { _id: 'r3', name: 'Family Suite', type: 'family' },
            checkIn: '2026-09-08T00:00:00.000Z',
            checkOut: '2026-09-11T00:00:00.000Z',
            guests: 4,
            nights: 3,
            pricePerNight: 4999,
            totalAmount: 14997,
            finalAmount: 14997,
            status: 'confirmed',
            paymentStatus: 'paid',
            createdAt: '2026-09-03T18:20:00.000Z'
        }
    ],
    customers: [
        {
            _id: 'c1',
            name: 'Rajesh Sharma',
            email: 'rajesh.sharma@example.com',
            phone: '+91 98765 43210',
            totalBookings: 3,
            isBlocked: false,
            createdAt: '2026-08-10T00:00:00.000Z'
        },
        {
            _id: 'c2',
            name: 'Amit Verma',
            email: 'amit.verma@example.com',
            phone: '+91 98123 45678',
            totalBookings: 1,
            isBlocked: false,
            createdAt: '2026-08-22T00:00:00.000Z'
        },
        {
            _id: 'c3',
            name: 'Priya Singh',
            email: 'priya.singh@example.com',
            phone: '+91 97531 86420',
            totalBookings: 2,
            isBlocked: false,
            createdAt: '2026-08-25T00:00:00.000Z'
        }
    ],
    reviews: [
        {
            _id: 'rev1',
            customer: { name: 'Sunil Gupta' },
            room: { name: 'Deluxe Room' },
            rating: 5,
            comment: 'Exceptional hospitality, spacious and clean rooms! The pool was fantastic.',
            status: 'approved',
            createdAt: '2026-08-28T00:00:00.000Z'
        },
        {
            _id: 'rev2',
            customer: { name: 'Ananya Roy' },
            room: { name: 'Executive Room' },
            rating: 4,
            comment: 'Great location in Chhatarpur, delicious food at restaurant.',
            status: 'approved',
            createdAt: '2026-08-30T00:00:00.000Z'
        },
        {
            _id: 'rev3',
            customer: { name: 'Vikram Mehta' },
            room: { name: 'Family Suite' },
            rating: 5,
            comment: 'Staff was very courteous and helpful during our family trip.',
            status: 'pending',
            createdAt: '2026-09-01T00:00:00.000Z'
        }
    ],
    gallery: [
        { _id: 'g1', title: 'Hotel Exterior', category: 'exterior', url: 'Front Img.png' },
        { _id: 'g2', title: 'Swimming Pool', category: 'facilities', url: 'Pool.jpeg' },
        { _id: 'g3', title: 'Grand Reception', category: 'facilities', url: 'Reception.jpeg' },
        { _id: 'g4', title: 'Deluxe Bedroom', category: 'rooms', url: 'Room1.jpeg' }
    ],
    messages: [
        {
            _id: 'm1',
            name: 'Vikas Kumar',
            email: 'vikas@gmail.com',
            subject: 'Wedding Lawn Booking Inquiry',
            message: 'Hello, we want to book lawn and 15 rooms for family marriage in November.',
            status: 'unread',
            createdAt: '2026-09-04T12:00:00.000Z'
        },
        {
            _id: 'm2',
            name: 'Pooja Pandey',
            email: 'pooja.p@outlook.com',
            subject: 'Conference Hall Availability',
            message: 'Need conference hall with projector for 40 people next week.',
            status: 'read',
            createdAt: '2026-09-03T09:15:00.000Z'
        }
    ],
    settings: {
        hotelName: 'Hotel Vijay Tara',
        contact: {
            phone: '+91 80900 54641',
            email: 'info@hotelvijaytara.com',
            whatsapp: '+918090054641',
            address: 'Aurangabad - Daltenganj Rd, Main Road, Chhatarpur, Jharkhand 822113'
        }
    }
};

function getFallbackMock(endpoint, method, body) {
    if (endpoint.includes('/auth/admin/login')) {
        if (body && body.email === 'admin@hotelvijaytara.com' && body.password === 'Admin@123') {
            return {
                success: true,
                data: {
                    token: 'demo-token-vijay-tara-2026',
                    user: { name: 'Super Admin', email: 'admin@hotelvijaytara.com', role: 'superadmin' }
                }
            };
        } else {
            throw new Error('Invalid credentials! Default: admin@hotelvijaytara.com / Admin@123');
        }
    }
    if (endpoint.includes('/auth/change-password')) {
        return { success: true, message: 'Password updated successfully' };
    }
    if (endpoint.includes('/admin/dashboard')) {
        return {
            success: true,
            data: {
                totalRevenue: 284500,
                todayRevenue: 12499,
                totalBookings: 64,
                todayBookings: 3,
                availableRooms: 12,
                occupiedRooms: 6,
                pendingBookings: 1,
                totalCustomers: 58
            }
        };
    }
    if (endpoint.startsWith('/bookings')) {
        if (method === 'PUT' && endpoint.includes('/status')) {
            const parts = endpoint.split('/');
            const id = parts[2];
            const item = mockDb.bookings.find(b => b._id === id);
            if (item && body && body.status) item.status = body.status;
            return { success: true, message: 'Status updated' };
        }
        if (method === 'DELETE') {
            const parts = endpoint.split('/');
            const id = parts[2];
            mockDb.bookings = mockDb.bookings.filter(b => b._id !== id);
            return { success: true, message: 'Booking deleted' };
        }
        return { success: true, data: mockDb.bookings };
    }
    if (endpoint.startsWith('/rooms')) {
        if (method === 'POST') {
            const newRoom = { _id: 'r' + Date.now(), ...body };
            mockDb.rooms.push(newRoom);
            return { success: true, data: newRoom };
        }
        if (method === 'PUT') {
            const parts = endpoint.split('/');
            const id = parts[2];
            const idx = mockDb.rooms.findIndex(r => r._id === id);
            if (idx !== -1) mockDb.rooms[idx] = { ...mockDb.rooms[idx], ...body };
            return { success: true, data: mockDb.rooms[idx] };
        }
        if (method === 'DELETE') {
            const parts = endpoint.split('/');
            const id = parts[2];
            mockDb.rooms = mockDb.rooms.filter(r => r._id !== id);
            return { success: true, message: 'Room deleted' };
        }
        return { success: true, data: mockDb.rooms };
    }
    if (endpoint.startsWith('/customers')) {
        if (method === 'PUT' && endpoint.includes('/block')) {
            const parts = endpoint.split('/');
            const id = parts[2];
            const c = mockDb.customers.find(item => item._id === id);
            if (c) c.isBlocked = !c.isBlocked;
            return { success: true, message: 'Status updated' };
        }
        if (method === 'DELETE') {
            const parts = endpoint.split('/');
            const id = parts[2];
            mockDb.customers = mockDb.customers.filter(c => c._id !== id);
            return { success: true, message: 'Customer deleted' };
        }
        return { success: true, data: mockDb.customers };
    }
    if (endpoint.startsWith('/reviews')) {
        if (method === 'PUT' && endpoint.includes('/status')) {
            const parts = endpoint.split('/');
            const id = parts[2];
            const rev = mockDb.reviews.find(r => r._id === id);
            if (rev && body && body.status) rev.status = body.status;
            return { success: true, message: 'Status updated' };
        }
        if (method === 'DELETE') {
            const parts = endpoint.split('/');
            const id = parts[2];
            mockDb.reviews = mockDb.reviews.filter(r => r._id !== id);
            return { success: true, message: 'Review deleted' };
        }
        return { success: true, data: mockDb.reviews };
    }
    if (endpoint.startsWith('/gallery')) {
        if (method === 'POST') {
            const item = { _id: 'g' + Date.now(), ...body };
            mockDb.gallery.push(item);
            return { success: true, data: item };
        }
        if (method === 'DELETE') {
            const parts = endpoint.split('/');
            const id = parts[2];
            mockDb.gallery = mockDb.gallery.filter(g => g._id !== id);
            return { success: true, message: 'Deleted' };
        }
        return { success: true, data: mockDb.gallery };
    }
    if (endpoint.startsWith('/contact')) {
        if (method === 'PUT' && endpoint.includes('/reply')) {
            const parts = endpoint.split('/');
            const id = parts[2];
            const m = mockDb.messages.find(item => item._id === id);
            if (m) m.status = 'replied';
            return { success: true, message: 'Reply sent' };
        }
        if (method === 'DELETE') {
            const parts = endpoint.split('/');
            const id = parts[2];
            mockDb.messages = mockDb.messages.filter(m => m._id !== id);
            return { success: true, message: 'Deleted' };
        }
        return { success: true, data: mockDb.messages };
    }
    if (endpoint.startsWith('/settings')) {
        if (method === 'PUT') {
            if (body && body.hotelName) mockDb.settings.hotelName = body.hotelName;
            if (body && body.contact) mockDb.settings.contact = { ...mockDb.settings.contact, ...body.contact };
            return { success: true, message: 'Settings saved' };
        }
        return { success: true, data: mockDb.settings };
    }
    return { success: true, data: [] };
}

// API Helper
async function apiFetch(endpoint, method = 'GET', body = null) {
    const isStaticHost = window.location.hostname.includes('github.io') || window.location.protocol === 'file:';
    
    // On static hosting (like GitHub Pages), immediately use demo mock data
    if (isStaticHost) {
        const mock = getFallbackMock(endpoint, method, body);
        if (mock) return mock;
    }

    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config = { method, headers };
    if (body) config.body = JSON.stringify(body);

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, config);
        
        // If server returned 404 or HTML (e.g. GitHub Pages 404.html), handle cleanly
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            const mock = getFallbackMock(endpoint, method, body);
            if (mock) return mock;
            throw new Error(`Server returned non-JSON response (${response.status})`);
        }

        const data = await response.json();
        
        if (response.status === 401) {
            handleLogout();
            throw new Error('Session expired. Please sign in again.');
        }
        
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'API request failed');
        }
        return data;
    } catch (err) {
        // Fallback for static demo mode (e.g. GitHub Pages)
        const mock = getFallbackMock(endpoint, method, body);
        if (mock) {
            console.warn(`[Demo Mode] Serving mock data for: ${endpoint}`);
            return mock;
        }
        console.error(`API Error (${endpoint}):`, err);
        throw err;
    }
}

// Auth Handlers
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    const btn = document.getElementById('loginBtn');

    try {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';

        const data = await apiFetch('/auth/admin/login', 'POST', { email, password });
        
        token = data.data.token;
        currentAdmin = data.data.user;
        localStorage.setItem('hvt_admin_token', token);
        localStorage.setItem('hvt_admin_user', JSON.stringify(currentAdmin));

        showToast('Login successful! Welcome to Admin Panel', 'success');
        showAppView();
        switchTab('dashboard');
    } catch (err) {
        showToast(err.message || 'Login failed', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>Sign In to Dashboard</span> <i class="fas fa-arrow-right"></i>';
    }
}

function handleLogout() {
    token = null;
    currentAdmin = null;
    localStorage.removeItem('hvt_admin_token');
    localStorage.removeItem('hvt_admin_user');
    showLoginView();
    showToast('Logged out successfully', 'info');
}

async function handleChangePassword(e) {
    e.preventDefault();
    const currentPassword = document.getElementById('currentPass').value;
    const newPassword = document.getElementById('newPass').value;

    try {
        await apiFetch('/auth/change-password', 'PUT', { currentPassword, newPassword });
        showToast('Password updated successfully', 'success');
        closeModal('changePassModal');
        document.getElementById('changePassForm').reset();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// Load Tab Contents
function loadTabContent(tab) {
    switch (tab) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'bookings':
            loadBookings();
            break;
        case 'rooms':
            loadRooms();
            break;
        case 'customers':
            loadCustomers();
            break;
        case 'reviews':
            loadReviews();
            break;
        case 'gallery':
            loadGallery();
            break;
        case 'messages':
            loadMessages();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// DASHBOARD
async function loadDashboard() {
    try {
        const data = await apiFetch('/admin/dashboard');
        const stats = data.data;

        document.getElementById('statTotalRevenue').textContent = `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`;
        document.getElementById('statTodayRevenue').textContent = `₹${(stats.todayRevenue || 0).toLocaleString('en-IN')}`;
        document.getElementById('statTotalBookings').textContent = stats.totalBookings || 0;
        document.getElementById('statTodayBookings').textContent = stats.todayBookings || 0;
        document.getElementById('statAvailableRooms').textContent = stats.availableRooms || 0;
        document.getElementById('statOccupiedRooms').textContent = stats.occupiedRooms || 0;
        document.getElementById('statPendingBookings').textContent = stats.pendingBookings || 0;
        document.getElementById('statTotalCustomers').textContent = stats.totalCustomers || 0;

        // Pending badge update
        const pendingBadge = document.getElementById('pendingBookingBadge');
        if (stats.pendingBookings > 0) {
            pendingBadge.textContent = stats.pendingBookings;
            pendingBadge.classList.remove('hidden');
        } else {
            pendingBadge.classList.add('hidden');
        }

        // Render Recent Bookings Table
        const recentRes = await apiFetch('/bookings?limit=6');
        const recentList = Array.isArray(recentRes.data) ? recentRes.data : (recentRes.data?.bookings || []);
        renderRecentBookings(recentList);

        // Render Revenue Chart
        renderRevenueChart();
    } catch (err) {
        console.error('Error loading dashboard stats:', err);
    }
}

function renderRecentBookings(bookings) {
    const tbody = document.getElementById('recentBookingsTable');
    if (!bookings || bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No recent bookings found</td></tr>';
        return;
    }

    tbody.innerHTML = bookings.map(b => `
        <tr>
            <td><strong>${b.bookingId}</strong></td>
            <td>${escapeHtml(b.guestName)}</td>
            <td>${b.room ? escapeHtml(b.room.name) : 'N/A'}</td>
            <td>${new Date(b.checkIn).toLocaleDateString('en-IN')}</td>
            <td>₹${(b.finalAmount || b.totalAmount).toLocaleString('en-IN')}</td>
            <td><span class="status-pill status-${b.status}">${b.status}</span></td>
        </tr>
    `).join('');
}

function renderRevenueChart() {
    const chartBars = document.getElementById('chartBars');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Sample visual heights for aesthetic chart UI
    const dummyHeights = [30, 45, 60, 40, 75, 90, 85, 95, 70, 80, 65, 85];
    
    chartBars.innerHTML = months.map((m, idx) => `
        <div class="chart-bar-col">
            <div class="chart-bar" style="height: ${dummyHeights[idx]}%;" title="${m}: ${dummyHeights[idx] * 1000} Revenue"></div>
            <span class="chart-label">${m}</span>
        </div>
    `).join('');
}

// BOOKINGS MANAGEMENT
async function loadBookings() {
    try {
        const res = await apiFetch('/bookings?limit=100');
        if (Array.isArray(res.data)) {
            allBookings = res.data;
        } else if (res.data && Array.isArray(res.data.bookings)) {
            allBookings = res.data.bookings;
        } else {
            allBookings = [];
        }
        filterBookingsTable();
    } catch (err) {
        console.error('Failed to load bookings:', err);
        showToast('Failed to load bookings', 'error');
    }
}

function filterBookingsTable() {
    const query = (document.getElementById('bookingSearchInput')?.value || '').toLowerCase();
    const statusFilter = document.getElementById('bookingFilterStatus')?.value || 'all';

    let filtered = allBookings.filter(b => {
        const matchStatus = statusFilter === 'all' || b.status === statusFilter;
        const matchSearch = !query || 
            b.bookingId.toLowerCase().includes(query) ||
            b.guestName.toLowerCase().includes(query) ||
            b.guestPhone.includes(query);
        return matchStatus && matchSearch;
    });

    const tbody = document.getElementById('bookingsTableBody');
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">No bookings match the filter.</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(b => `
        <tr>
            <td><strong>${b.bookingId}</strong></td>
            <td>${escapeHtml(b.guestName)}</td>
            <td>${escapeHtml(b.guestPhone)}</td>
            <td>${b.room ? escapeHtml(b.room.name) : 'N/A'}</td>
            <td>${new Date(b.checkIn).toLocaleDateString('en-IN', {day:'numeric', month:'short'})} - ${new Date(b.checkOut).toLocaleDateString('en-IN', {day:'numeric', month:'short'})}</td>
            <td>₹${(b.finalAmount || b.totalAmount).toLocaleString('en-IN')}</td>
            <td><span class="status-pill status-${b.status}">${b.status}</span></td>
            <td>
                <div class="action-btns">
                    ${b.status === 'pending' ? `<button class="icon-btn success" title="Confirm" onclick="updateBookingStatus('${b._id}', 'confirmed')"><i class="fas fa-check"></i></button>` : ''}
                    ${b.status === 'confirmed' ? `<button class="icon-btn success" title="Check-In" onclick="updateBookingStatus('${b._id}', 'checked-in')"><i class="fas fa-key"></i></button>` : ''}
                    ${b.status === 'checked-in' ? `<button class="icon-btn" title="Check-Out" onclick="updateBookingStatus('${b._id}', 'checked-out')"><i class="fas fa-sign-out-alt"></i></button>` : ''}
                    ${['pending', 'confirmed'].includes(b.status) ? `<button class="icon-btn danger" title="Reject/Cancel" onclick="updateBookingStatus('${b._id}', 'cancelled')"><i class="fas fa-times"></i></button>` : ''}
                    <button class="icon-btn" title="View Invoice" onclick="viewInvoice('${b._id}')"><i class="fas fa-file-invoice"></i></button>
                    <button class="icon-btn danger" title="Delete" onclick="deleteBooking('${b._id}')"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function updateBookingStatus(id, newStatus) {
    try {
        await apiFetch(`/bookings/${id}/status`, 'PUT', { status: newStatus });
        showToast(`Booking updated to ${newStatus}`, 'success');
        loadBookings();
        loadDashboard();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function deleteBooking(id) {
    if (!confirm('Are you sure you want to delete this booking record?')) return;
    try {
        await apiFetch(`/bookings/${id}`, 'DELETE');
        showToast('Booking deleted', 'success');
        loadBookings();
        loadDashboard();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

function viewInvoice(id) {
    const b = allBookings.find(item => item._id === id);
    if (!b) return;

    const content = document.getElementById('invoiceContent');
    content.innerHTML = `
        <div style="padding: 10px; color: #fff;">
            <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #D4AF37; padding-bottom: 15px; margin-bottom: 20px;">
                <div>
                    <h2 style="color: #D4AF37; margin:0;">Hotel Vijay Tara</h2>
                    <p style="font-size: 0.85rem; color: #A3C2B7;">Main Road, Chhatarpur, Jharkhand 822113</p>
                    <p style="font-size: 0.85rem; color: #A3C2B7;">Phone: +91 80900 54641 | info@hotelvijaytara.com</p>
                </div>
                <div style="text-align: right;">
                    <h3 style="color: #fff; margin:0;">INVOICE</h3>
                    <p style="font-weight: bold; color: #D4AF37;">#${b.bookingId}</p>
                    <p style="font-size: 0.85rem;">Date: ${new Date(b.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
                <div>
                    <h4 style="color: #D4AF37; margin-bottom: 8px;">GUEST DETAILS</h4>
                    <p><strong>Name:</strong> ${escapeHtml(b.guestName)}</p>
                    <p><strong>Phone:</strong> ${escapeHtml(b.guestPhone)}</p>
                    <p><strong>Email:</strong> ${escapeHtml(b.guestEmail || 'N/A')}</p>
                </div>
                <div>
                    <h4 style="color: #D4AF37; margin-bottom: 8px;">BOOKING SUMMARY</h4>
                    <p><strong>Room:</strong> ${b.room ? escapeHtml(b.room.name) : 'N/A'}</p>
                    <p><strong>Dates:</strong> ${new Date(b.checkIn).toDateString()} - ${new Date(b.checkOut).toDateString()}</p>
                    <p><strong>Guests / Nights:</strong> ${b.guests} Guests / ${b.nights || 1} Night(s)</p>
                </div>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                    <tr style="background: rgba(10,25,19,0.8); color: #D4AF37;">
                        <th style="padding: 10px; text-align: left;">Item Description</th>
                        <th style="padding: 10px; text-align: center;">Rate / Night</th>
                        <th style="padding: 10px; text-align: center;">Nights</th>
                        <th style="padding: 10px; text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.1);">${b.room ? escapeHtml(b.room.name) : 'Room Booking'}</td>
                        <td style="padding: 10px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1);">₹${(b.pricePerNight || 0).toLocaleString('en-IN')}</td>
                        <td style="padding: 10px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1);">${b.nights || 1}</td>
                        <td style="padding: 10px; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.1);">₹${(b.totalAmount || 0).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                        <td colspan="3" style="padding: 10px; text-align: right;">GST (12%):</td>
                        <td style="padding: 10px; text-align: right;">₹${(b.tax || 0).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr style="font-weight: bold; font-size: 1.1rem; color: #D4AF37;">
                        <td colspan="3" style="padding: 10px; text-align: right;">GRAND TOTAL:</td>
                        <td style="padding: 10px; text-align: right;">₹${(b.finalAmount || b.totalAmount).toLocaleString('en-IN')}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;

    openModal('invoiceModal');
}

// ROOMS MANAGEMENT
async function loadRooms() {
    try {
        const res = await apiFetch('/rooms');
        allRooms = Array.isArray(res.data) ? res.data : (res.data?.rooms || []);
        renderRoomsGrid();
    } catch (err) {
        console.error('Failed to load rooms:', err);
        showToast('Failed to load rooms', 'error');
    }
}

function renderRoomsGrid() {
    const grid = document.getElementById('roomsAdminGrid');
    if (!allRooms || allRooms.length === 0) {
        grid.innerHTML = '<div class="col-span-3 text-center">No rooms found. Click "Add New Room" to create one.</div>';
        return;
    }

    grid.innerHTML = allRooms.map(r => {
        const imgUrl = (r.images && r.images.length > 0) ? r.images[0].url : '/images/rooms/deluxe1.jpg';
        return `
            <div class="room-admin-card">
                <img src="${imgUrl}" alt="${escapeHtml(r.name)}" class="room-card-img" />
                <div class="room-card-body">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h4 class="room-card-title">${escapeHtml(r.name)}</h4>
                        <span class="status-pill status-${r.status}">${r.status}</span>
                    </div>
                    <div class="room-card-price">₹${r.pricePerNight.toLocaleString('en-IN')} <span style="font-size:0.75rem; color:#A3C2B7;">/ night</span></div>
                    <div class="room-card-meta">
                        <span><i class="fas fa-hashtag"></i> Room ${escapeHtml(r.roomNumber || 'N/A')}</span>
                        <span><i class="fas fa-users"></i> ${r.maxGuests} Guests</span>
                        <span><i class="fas fa-bed"></i> ${escapeHtml(r.bedType || 'King')}</span>
                    </div>
                    <div style="margin-top:auto; display:flex; gap:8px;">
                        <button class="btn btn-sm btn-ghost w-full" onclick="openEditRoomModal('${r._id}')"><i class="fas fa-edit"></i> Edit</button>
                        <button class="btn btn-sm btn-ghost danger w-full" onclick="deleteRoom('${r._id}')"><i class="fas fa-trash"></i> Delete</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function openAddRoomModal() {
    document.getElementById('roomForm').reset();
    document.getElementById('roomId').value = '';
    document.getElementById('roomModalTitle').textContent = 'Add New Room';
    openModal('roomModal');
}

function openEditRoomModal(id) {
    const room = allRooms.find(r => r._id === id);
    if (!room) return;

    document.getElementById('roomId').value = room._id;
    document.getElementById('roomName').value = room.name;
    document.getElementById('roomNumber').value = room.roomNumber || '';
    document.getElementById('roomTypeSelect').value = room.type;
    document.getElementById('roomPrice').value = room.pricePerNight;
    document.getElementById('roomBedType').value = room.bedType || 'king';
    document.getElementById('roomMaxGuests').value = room.maxGuests || 2;
    document.getElementById('roomStatus').value = room.status || 'available';
    document.getElementById('roomImageUrl').value = (room.images && room.images[0]) ? room.images[0].url : '';
    document.getElementById('roomDesc').value = room.description || '';

    document.getElementById('roomModalTitle').textContent = 'Edit Room Details';
    openModal('roomModal');
}

async function handleSaveRoom(e) {
    e.preventDefault();
    const id = document.getElementById('roomId').value;
    const name = document.getElementById('roomName').value;
    const roomNumber = document.getElementById('roomNumber').value;
    const type = document.getElementById('roomTypeSelect').value;
    const pricePerNight = parseFloat(document.getElementById('roomPrice').value);
    const bedType = document.getElementById('roomBedType').value;
    const maxGuests = parseInt(document.getElementById('roomMaxGuests').value);
    const status = document.getElementById('roomStatus').value;
    const imageUrl = document.getElementById('roomImageUrl').value;
    const description = document.getElementById('roomDesc').value || `${name} at Hotel Vijay Tara`;

    const body = {
        name, roomNumber, type, pricePerNight, bedType, maxGuests, status, description,
        images: imageUrl ? [{ url: imageUrl }] : [{ url: '/images/rooms/deluxe1.jpg' }]
    };

    try {
        if (id) {
            await apiFetch(`/rooms/${id}`, 'PUT', body);
            showToast('Room updated successfully', 'success');
        } else {
            await apiFetch('/rooms', 'POST', body);
            showToast('New room created successfully', 'success');
        }
        closeModal('roomModal');
        loadRooms();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function deleteRoom(id) {
    if (!confirm('Are you sure you want to delete this room?')) return;
    try {
        await apiFetch(`/rooms/${id}`, 'DELETE');
        showToast('Room deleted successfully', 'success');
        loadRooms();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// CUSTOMERS MANAGEMENT
async function loadCustomers() {
    try {
        const res = await apiFetch('/customers');
        const list = Array.isArray(res.data) ? res.data : (res.data?.customers || []);
        renderCustomersTable(list);
    } catch (err) {
        console.error('Failed to load customers:', err);
        showToast('Failed to load customers', 'error');
    }
}

function renderCustomersTable(customers) {
    const tbody = document.getElementById('customersTableBody');
    if (!customers || customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No registered customers found.</td></tr>';
        return;
    }

    tbody.innerHTML = customers.map(c => `
        <tr>
            <td><strong>${escapeHtml(c.name)}</strong></td>
            <td>${escapeHtml(c.email)}</td>
            <td>${escapeHtml(c.phone || 'N/A')}</td>
            <td>${c.totalBookings || 0} Bookings</td>
            <td>${new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
            <td><span class="status-pill ${c.isBlocked ? 'status-cancelled' : 'status-confirmed'}">${c.isBlocked ? 'Blocked' : 'Active'}</span></td>
            <td>
                <div class="action-btns">
                    <button class="icon-btn ${c.isBlocked ? 'success' : 'danger'}" title="${c.isBlocked ? 'Unblock' : 'Block'}" onclick="toggleBlockCustomer('${c._id}')">
                        <i class="fas fa-${c.isBlocked ? 'user-check' : 'user-slash'}"></i>
                    </button>
                    <button class="icon-btn danger" title="Delete Customer" onclick="deleteCustomer('${c._id}')"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

function filterCustomersTable() {
    const q = (document.getElementById('customerSearchInput')?.value || '').toLowerCase();
    const rows = document.querySelectorAll('#customersTableBody tr');
    rows.forEach(r => {
        const text = r.textContent.toLowerCase();
        r.style.display = text.includes(q) ? '' : 'none';
    });
}

async function toggleBlockCustomer(id) {
    try {
        await apiFetch(`/customers/${id}/block`, 'PUT');
        showToast('Customer status updated', 'success');
        loadCustomers();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function deleteCustomer(id) {
    if (!confirm('Are you sure you want to delete this customer account?')) return;
    try {
        await apiFetch(`/customers/${id}`, 'DELETE');
        showToast('Customer deleted', 'success');
        loadCustomers();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// REVIEWS MODERATION
async function loadReviews() {
    try {
        const status = document.getElementById('reviewFilterStatus')?.value || '';
        const res = await apiFetch(`/reviews${status ? `?status=${status}` : ''}`);
        const list = Array.isArray(res.data) ? res.data : (res.data?.reviews || []);
        renderReviewsTable(list);
    } catch (err) {
        console.error('Failed to load reviews:', err);
        showToast('Failed to load reviews', 'error');
    }
}

function renderReviewsTable(reviews) {
    const tbody = document.getElementById('reviewsTableBody');
    if (!reviews || reviews.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No reviews found.</td></tr>';
        return;
    }

    tbody.innerHTML = reviews.map(r => `
        <tr>
            <td><strong>${r.customer ? escapeHtml(r.customer.name) : 'Guest'}</strong></td>
            <td>${r.room ? escapeHtml(r.room.name) : 'General Stay'}</td>
            <td style="color:#D4AF37;">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</td>
            <td>${escapeHtml(r.comment)}</td>
            <td><span class="status-pill status-${r.status}">${r.status}</span></td>
            <td>
                <div class="action-btns">
                    ${r.status !== 'approved' ? `<button class="icon-btn success" title="Approve" onclick="updateReviewStatus('${r._id}', 'approved')"><i class="fas fa-check"></i></button>` : ''}
                    ${r.status !== 'rejected' ? `<button class="icon-btn danger" title="Reject" onclick="updateReviewStatus('${r._id}', 'rejected')"><i class="fas fa-times"></i></button>` : ''}
                    <button class="icon-btn danger" title="Delete" onclick="deleteReview('${r._id}')"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function updateReviewStatus(id, newStatus) {
    try {
        await apiFetch(`/reviews/${id}/status`, 'PUT', { status: newStatus });
        showToast(`Review ${newStatus}`, 'success');
        loadReviews();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function deleteReview(id) {
    if (!confirm('Delete this review?')) return;
    try {
        await apiFetch(`/reviews/${id}`, 'DELETE');
        showToast('Review deleted', 'success');
        loadReviews();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// GALLERY MANAGEMENT
async function loadGallery() {
    try {
        const res = await apiFetch('/gallery');
        const list = Array.isArray(res.data) ? res.data : (res.data?.items || []);
        renderGalleryGrid(list);
    } catch (err) {
        console.error('Failed to load gallery:', err);
        showToast('Failed to load gallery', 'error');
    }
}

function renderGalleryGrid(items) {
    const grid = document.getElementById('galleryAdminGrid');
    if (!items || items.length === 0) {
        grid.innerHTML = '<div class="text-center">No images in gallery. Upload one above.</div>';
        return;
    }

    grid.innerHTML = items.map(item => `
        <div class="gallery-admin-item">
            <img src="${item.url}" alt="${escapeHtml(item.title)}" />
            <div class="gallery-item-overlay">
                <button class="btn btn-sm btn-ghost danger" onclick="deleteGalleryItem('${item._id}')"><i class="fas fa-trash"></i> Delete</button>
            </div>
        </div>
    `).join('');
}

async function handleAddGallery(e) {
    e.preventDefault();
    const title = document.getElementById('galleryTitle').value;
    const category = document.getElementById('galleryCategory').value;
    const url = document.getElementById('galleryUrl').value;

    try {
        await apiFetch('/gallery', 'POST', { title, category, url });
        showToast('Gallery image added', 'success');
        document.getElementById('addGalleryForm').reset();
        loadGallery();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function deleteGalleryItem(id) {
    if (!confirm('Delete this image?')) return;
    try {
        await apiFetch(`/gallery/${id}`, 'DELETE');
        showToast('Image deleted', 'success');
        loadGallery();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// CONTACT MESSAGES MANAGEMENT
async function loadMessages() {
    try {
        const res = await apiFetch('/contact');
        const messages = Array.isArray(res.data) ? res.data : (res.data?.messages || []);
        renderMessagesTable(messages);

        const unread = messages.filter(m => m.status === 'unread').length;
        const msgBadge = document.getElementById('unreadMsgBadge');
        if (unread > 0) {
            msgBadge.textContent = unread;
            msgBadge.classList.remove('hidden');
        } else {
            msgBadge.classList.add('hidden');
        }
    } catch (err) {
        console.error('Failed to load messages:', err);
        showToast('Failed to load messages', 'error');
    }
}

function renderMessagesTable(messages) {
    const tbody = document.getElementById('messagesTableBody');
    if (!messages || messages.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No messages received yet.</td></tr>';
        return;
    }

    tbody.innerHTML = messages.map(m => `
        <tr>
            <td><strong>${escapeHtml(m.name)}</strong><br><small>${escapeHtml(m.email)}</small></td>
            <td>${escapeHtml(m.subject)}</td>
            <td>${escapeHtml(m.message)}</td>
            <td>${new Date(m.createdAt).toLocaleDateString('en-IN')}</td>
            <td><span class="status-pill status-${m.status}">${m.status}</span></td>
            <td>
                <div class="action-btns">
                    <button class="icon-btn" title="Reply" onclick="openReplyModal('${m._id}', '${escapeHtml(m.email)}', '${escapeHtml(m.subject)}')"><i class="fas fa-reply"></i></button>
                    <button class="icon-btn danger" title="Delete" onclick="deleteMessage('${m._id}')"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openReplyModal(id, email, subject) {
    document.getElementById('replyContactId').value = id;
    document.getElementById('replyToEmail').textContent = email;
    document.getElementById('replyToSubject').textContent = subject;
    document.getElementById('replyText').value = '';
    openModal('replyModal');
}

async function handleSendReply(e) {
    e.preventDefault();
    const id = document.getElementById('replyContactId').value;
    const reply = document.getElementById('replyText').value;

    try {
        await apiFetch(`/contact/${id}/reply`, 'PUT', { reply });
        showToast('Reply sent successfully', 'success');
        closeModal('replyModal');
        loadMessages();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function deleteMessage(id) {
    if (!confirm('Delete this message?')) return;
    try {
        await apiFetch(`/contact/${id}`, 'DELETE');
        showToast('Message deleted', 'success');
        loadMessages();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// SETTINGS
async function loadSettings() {
    try {
        const res = await apiFetch('/settings');
        const s = res.data;
        if (s) {
            document.getElementById('settingHotelName').value = s.hotelName || 'Hotel Vijay Tara';
            document.getElementById('settingPhone').value = s.contact?.phone || '+91 80900 54641';
            document.getElementById('settingEmail').value = s.contact?.email || 'info@hotelvijaytara.com';
            document.getElementById('settingWhatsapp').value = s.contact?.whatsapp || '+918090054641';
            document.getElementById('settingAddress').value = s.contact?.address || 'Chhatarpur, Jharkhand';
        }
    } catch (err) {
        showToast('Failed to load settings', 'error');
    }
}

async function handleSaveSettings(e) {
    e.preventDefault();
    const body = {
        hotelName: document.getElementById('settingHotelName').value,
        contact: {
            phone: document.getElementById('settingPhone').value,
            email: document.getElementById('settingEmail').value,
            whatsapp: document.getElementById('settingWhatsapp').value,
            address: document.getElementById('settingAddress').value,
        }
    };

    try {
        await apiFetch('/settings', 'PUT', body);
        showToast('Settings saved successfully', 'success');
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// UI Helpers (Modals & Toasts)
function openModal(id) {
    document.getElementById(id).classList.remove('hidden');
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}

function showToast(msg, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };

    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> <span>${escapeHtml(msg)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(50px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
