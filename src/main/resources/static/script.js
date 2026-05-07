/* CORE LOGIC PRESERVED FROM ORIGINAL SOURCE
   UI RENDERING UPDATED FOR HIGH-END GLASSMORPHISM
*/
const API = 'http://localhost:8080/api';
let allRooms = [], allBookings = [], allCustomers = [], allRoomTypes = [], allServices = [];

// --- HELPER FUNCTIONS ---
function fmt(n) { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n); }
function fmtDate(d) { return d ? new Date(d).toLocaleDateString('vi-VN') : '-'; }

function statusTag(s) {
    const map = {
        'Trống': 'green', 'Đã xác nhận': 'green', 'Đã trả phòng': 'emerald',
        'Đang ở': 'blue', 'Chờ': 'yellow', 'Chờ xác nhận': 'yellow',
        'Bảo trì': 'red', 'Đã hủy': 'red'
    };
    return `<span class="tag tag-${map[s] || 'blue'}">${s}</span>`;
}

function toast(msg, type = 'success') {
    const t = document.getElementById('toast');
    const m = document.getElementById('toast-msg');
    const icon = t.querySelector('i');

    m.textContent = msg;
    t.className = `toast show ${type}`;

    if(type === 'success') icon.className = 'fas fa-check-circle';
    else if(type === 'error') icon.className = 'fas fa-exclamation-circle';
    else icon.className = 'fas fa-info-circle';

    setTimeout(() => t.classList.remove('show'), 4000);
}

async function api(method, url, body) {
    try {
        const r = await fetch(API + url, {
            method,
            headers: {'Content-Type': 'application/json'},
            body: body ? JSON.stringify(body) : undefined
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Lỗi hệ thống');
        return data;
    } catch(e) {
        toast(e.message, 'error');
        throw e;
    }
}

// --- TAB NAVIGATION ---
const tabTitles = {
    dashboard: 'RESORT OVERVIEW',
    roomtypes: 'HỆ THỐNG HẠNG PHÒNG',
    rooms: 'SƠ ĐỒ VÀ TRẠNG THÁI PHÒNG',
    customers: 'HỒ SƠ KHÁCH HÀNG VIP',
    bookings: 'TRUNG TÂM ĐIỀU PHỐI BOOKING',
    services: 'QUẢN TRỊ DỊCH VỤ NỘI KHU'
};

function showTab(name) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    document.getElementById('tab-' + name).classList.add('active');
    const items = document.querySelectorAll('.nav-item');
    const index = Object.keys(tabTitles).indexOf(name);
    if(items[index]) items[index].classList.add('active');

    document.getElementById('pageTitle').textContent = tabTitles[name];

    const loaders = {
        dashboard: loadDashboard,
        roomtypes: loadRoomTypes,
        rooms: loadRooms,
        customers: loadCustomers,
        bookings: loadBookings,
        services: loadServices
    };
    loaders[name]?.();
}

// --- DASHBOARD ---
async function loadDashboard() {
    try {
        const [rooms, bookings, customers] = await Promise.all([
            fetch(API+'/rooms').then(r=>r.json()).catch(()=>[]),
            fetch(API+'/bookings').then(r=>r.json()).catch(()=>[]),
            fetch(API+'/customers').then(r=>r.json()).catch(()=>[]),
        ]);

        allRooms = rooms; allBookings = bookings; allCustomers = customers;

        document.getElementById('statTotalRooms').textContent = rooms.length;
        document.getElementById('statAvailRooms').textContent = rooms.filter(r=>r.status==='Trống').length;
        document.getElementById('statBookings').textContent = bookings.length;
        document.getElementById('statCustomers').textContent = customers.length;

        const statusIndicator = document.getElementById('serverStatus');
        statusIndicator.innerHTML = '<i class="fas fa-satellite-dish"></i> Sync: OK';
        statusIndicator.classList.add('online');

        const bCust = document.getElementById('b-customer');
        if(bCust) bCust.innerHTML = customers.map(c => `<option value="${c.id}">${c.fullName}</option>`).join('');

        const bRoom = document.getElementById('b-room');
        if(bRoom) bRoom.innerHTML = rooms.filter(r => r.status === 'Trống').map(r => `<option value="${r.id}">${r.roomNumber} (${r.roomType?.typeName})</option>`).join('');

        document.getElementById('dashBookings').innerHTML = `
            <div class="table-wrap">
                <table>
                    <thead><tr><th>Guest Name</th><th>Timeline</th><th>Status</th></tr></thead>
                    <tbody>
                        ${bookings.slice(0, 5).map(b => `
                            <tr>
                                <td><div style="font-weight:500; color:var(--accent-gold)">${b.customer?.fullName}</div></td>
                                <td><span style="font-family:'Inter'; font-size:12px; color:var(--text-muted)">${fmtDate(b.checkInDate)} <i class="fas fa-arrow-right" style="margin:0 5px; opacity:0.5"></i> ${fmtDate(b.checkOutDate)}</span></td>
                                <td>${statusTag(b.status)}</td>
                            </tr>
                        `).join('')}
                        ${bookings.length === 0 ? '<tr><td colspan="3" style="text-align:center; padding:30px; opacity:0.5">No recent bookings</td></tr>' : ''}
                    </tbody>
                </table>
            </div>`;

        const statusCount = {};
        rooms.forEach(r => statusCount[r.status] = (statusCount[r.status]||0)+1);
        document.getElementById('dashRooms').innerHTML = Object.entries(statusCount).map(([s, c]) => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding: 18px 0; border-bottom: 1px solid rgba(255,255,255,0.05)">
                <span style="font-weight:500">${statusTag(s)}</span>
                <strong style="color:var(--accent-cyan); font-size:16px; text-shadow: 0 0 10px rgba(0,242,254,0.3)">${c} Unit(s)</strong>
            </div>
        `).join('') || '<p class="empty-state">Hệ thống phòng chưa được khởi tạo</p>';

    } catch(e) {
        console.error(e);
        const statusIndicator = document.getElementById('serverStatus');
        statusIndicator.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Mất kết nối Server';
        statusIndicator.classList.remove('online');
    }
}

// --- HẠNG PHÒNG ---
async function loadRoomTypes() {
    const data = await fetch(API+'/room-types').then(r=>r.json()).catch(()=>[]);
    allRoomTypes = data;
    const tbody = document.getElementById('rt-tbody');
    tbody.innerHTML = data.map(rt => `
        <tr>
            <td><span style="color:var(--text-dim); font-family:'Poppins'">#${rt.id}</span></td>
            <td><strong style="color:var(--accent-gold); font-size:15px">${rt.typeName}</strong><br><small style="color:var(--text-dim)">${rt.description || 'Tiêu chuẩn 5 sao'}</small></td>
            <td><strong style="color:var(--accent-emerald)">${fmt(rt.pricePerNight)}</strong></td>
            <td><i class="fas fa-users" style="color:var(--accent-cyan); margin-right:5px"></i> ${rt.capacity} người</td>
            <td><span class="tag tag-blue">Active</span></td>
            <td>
                <div style="display:flex; gap:8px">
                    <button class="btn btn-outline btn-sm" onclick="editRoomType(${rt.id})"><i class="fas fa-pen"></i></button>
                    <button class="btn btn-outline btn-sm" style="color:var(--accent-rose); border-color:rgba(251, 113, 133, 0.3)" onclick="deleteRoomType(${rt.id})"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>`).join('') || '<tr><td colspan="6" class="empty-state">Chưa có hạng phòng nào</td></tr>';

    const sel = document.getElementById('r-type');
    if (sel) sel.innerHTML = data.map(rt => `<option value="${rt.id}">${rt.typeName}</option>`).join('');
}

async function addRoomType() {
    const name = document.getElementById('rt-name').value;
    const price = document.getElementById('rt-price').value;
    const cap = document.getElementById('rt-capacity').value;
    if(!name || !price || !cap) return toast('Vui lòng cung cấp đủ thông tin tham số', 'error');

    await api('POST', '/room-types', { typeName: name, pricePerNight: price, capacity: cap, description: document.getElementById('rt-desc').value });
    toast('Đã ghi nhận hạng phòng mới', 'success');
    loadRoomTypes();
}

// --- PHÒNG ---
async function loadRooms() {
    const data = await fetch(API+'/rooms').then(r=>r.json()).catch(()=>[]);
    allRooms = data;
    renderRooms(data);
    if (!allRoomTypes.length) loadRoomTypes();
}

function renderRooms(data) {
    const tbody = document.getElementById('rooms-tbody');
    tbody.innerHTML = data.map(r => `
        <tr>
            <td><strong style="color:var(--accent-cyan); font-size:16px">${r.roomNumber}</strong></td>
            <td>Khu vực ${r.floorNumber}</td>
            <td style="color:var(--accent-gold)">${r.roomType?.typeName || 'N/A'}</td>
            <td>${fmt(r.roomType?.pricePerNight)}</td>
            <td>${statusTag(r.status)}</td>
            <td>
                <button class="btn btn-outline btn-sm" onclick="editRoom(${r.id})"><i class="fas fa-sliders-h"></i> Điều chỉnh</button>
            </td>
        </tr>`).join('') || '<tr><td colspan="6" class="empty-state">Chưa có dữ liệu vận hành phòng</td></tr>';
}

function filterRooms() {
    const s = document.getElementById('filter-room-status').value;
    renderRooms(s ? allRooms.filter(r => r.status === s) : allRooms);
}

async function addRoom() {
    const num = document.getElementById('r-number').value;
    const type = document.getElementById('r-type').value;
    if(!num || !type) return toast('Cần có mã định danh phòng', 'error');
    await api('POST', '/rooms', { roomNumber: num, floorNumber: document.getElementById('r-floor').value, status: document.getElementById('r-status').value, roomType: { id: type } });
    toast('Khởi tạo không gian thành công');
    loadRooms();
}

// --- KHÁCH HÀNG ---
async function loadCustomers() {
    const data = await fetch(API+'/customers').then(r=>r.json()).catch(()=>[]);
    allCustomers = data;
    renderCustomers(data);
}

function renderCustomers(data) {
    document.getElementById('cust-tbody').innerHTML = data.map(c => `
        <tr>
            <td><span style="color:var(--text-dim)">#VIP-${c.id}</span></td>
            <td><strong style="color:white; font-size:15px">${c.fullName}</strong></td>
            <td><i class="fas fa-phone-alt" style="font-size:12px; color:var(--accent-teal); margin-right:5px"></i> ${c.phone || '-'}</td>
            <td>${c.email || '-'}</td>
            <td>${new Date().toLocaleDateString('vi-VN')}</td>
            <td>
                <button class="btn btn-outline btn-sm" onclick="editCustomer(${c.id})"><i class="fas fa-user-edit"></i> Profile</button>
            </td>
        </tr>`).join('');
}

function searchCustomers() {
    const q = document.getElementById('c-search').value.toLowerCase();
    renderCustomers(allCustomers.filter(c => c.fullName.toLowerCase().includes(q)));
}

async function addCustomer() {
    const name = document.getElementById('c-name').value;
    if(!name) return toast('Họ tên khách hàng là bắt buộc', 'error');
    await api('POST', '/customers', { fullName: name, phone: document.getElementById('c-phone').value, email: document.getElementById('c-email').value });
    toast('Hồ sơ đã được lưu trữ an toàn');
    loadCustomers();
}

// --- ĐẶT PHÒNG ---
async function loadBookings() {
    const data = await fetch(API+'/bookings').then(r=>r.json()).catch(()=>[]);
    allBookings = data;
    document.getElementById('book-tbody').innerHTML = data.map(b => `
        <tr>
            <td><strong style="color:var(--accent-cyan)">#RES-${b.id}</strong></td>
            <td style="font-weight:500">${b.customer?.fullName}</td>
            <td><i class="fas fa-sign-in-alt" style="color:var(--accent-emerald); margin-right:5px"></i> ${fmtDate(b.checkInDate)}</td>
            <td><i class="fas fa-sign-out-alt" style="color:var(--accent-rose); margin-right:5px"></i> ${fmtDate(b.checkOutDate)}</td>
            <td>${statusTag(b.status)}</td>
            <td>
                <div style="display:flex; gap:8px">
                ${b.status === 'Chờ' ? `<button class="btn btn-success btn-sm" onclick="updateBStatus(${b.id}, 'Đã xác nhận')"><i class="fas fa-check"></i> Duyệt</button>` : ''}
                <button class="btn btn-outline btn-sm" style="color:var(--accent-rose); border-color:rgba(251, 113, 133, 0.3)" onclick="deleteBooking(${b.id})"><i class="fas fa-times"></i></button>
                </div>
            </td>
        </tr>`).join('');
}

async function addBooking() {
    const payload = {
        customer: { id: document.getElementById('b-customer').value },
        checkInDate: document.getElementById('b-checkin').value,
        checkOutDate: document.getElementById('b-checkout').value,
        status: 'Chờ',
        bookingRooms: [{ room: { id: document.getElementById('b-room').value } }]
    };
    await api('POST', '/bookings', payload);
    toast('Đã khởi tạo Reservation');
    loadBookings();
    loadDashboard();
}

async function updateBStatus(id, status) {
    await api('PATCH', `/bookings/${id}/status`, { status });
    toast(`Chuyển trạng thái sang: ${status}`);
    loadBookings();
}

async function deleteBooking(id) {
    if(!confirm('CẢNH BÁO: Bạn có chắc chắn muốn hủy Reservation này?')) return;
    await api('DELETE', `/bookings/${id}`);
    toast('Reservation đã bị hủy');
    loadBookings();
}

// --- DỊCH VỤ ---
async function loadServices() {
    const data = await fetch(API+'/services').then(r=>r.json()).catch(()=>[]);
    allServices = data;
    document.getElementById('svc-tbody').innerHTML = data.map(s => `
        <tr>
            <td><span style="color:var(--text-dim)">#SRV-${s.id}</span></td>
            <td><strong style="font-size:15px">${s.serviceName}</strong></td>
            <td><strong style="color:var(--accent-gold); font-size:16px">${fmt(s.price)}</strong></td>
            <td>
                <button class="btn btn-outline btn-sm" style="color:var(--accent-rose)" onclick="deleteService(${s.id})"><i class="fas fa-ban"></i> Ngừng cung cấp</button>
            </td>
        </tr>`).join('');
}

async function addService() {
    const name = document.getElementById('svc-name').value;
    const price = document.getElementById('svc-price').value;
    if(!name || !price) return toast('Cần có Tên và Biểu phí dịch vụ', 'error');
    await api('POST', '/services', { serviceName: name, price });
    toast('Dịch vụ đã được Live trên hệ thống');
    loadServices();
}

async function deleteService(id) {
    if(!confirm('Ngừng cung cấp dịch vụ này?')) return;
    await api('DELETE', `/services/${id}`);
    toast('Đã gỡ dịch vụ khỏi danh mục');
    loadServices();
}

// --- UTILS ---
function closeModal() { document.getElementById('editModal').classList.remove('show'); }

// Khởi tạo app
window.onload = loadDashboard;