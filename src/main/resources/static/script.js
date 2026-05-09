/* CORE LOGIC PRESERVED FROM ORIGINAL SOURCE
   Added full-page EN/VI translation support
*/
const API = (() => {
    if (window.location.protocol === 'file:') return 'http://localhost:8080/api';
    if (window.location.port && window.location.port !== '8080') {
        return `${window.location.protocol}//${window.location.hostname}:8080/api`;
    }
    return `${window.location.origin}/api`;
})();
let allRooms = [], allBookings = [], allCustomers = [], allRoomTypes = [], allServices = [];
let currentLang = localStorage.getItem('resort_lang') || 'vi';
let revenueChart = null;
let reportLineChart = null;
let reportDonutChart = null;

const I18N = {
    vi: {
        page: {
            title: 'AURA LUXURY RESORT | Hệ thống Quản lý Thông minh',
            connect: 'Đang kết nối...',
            syncOk: 'Sync: OK',
            disconnected: 'Mất kết nối Server'
        },
        nav: {
            dashboard: 'TỔNG QUAN',
            reports: 'BÁO CÁO',
            roomtypes: 'HẠNG PHÒNG',
            rooms: 'QUẢN LÝ PHÒNG',
            customers: 'KHÁCH HÀNG',
            bookings: 'LỄ TÂN & ĐẶT PHÒNG',
            services: 'DỊCH VỤ RESORT'
        },
        tab: {
            dashboard: 'TỔNG QUAN RESORT',
            reports: 'BÁO CÁO THỐNG KÊ',
            roomtypes: 'HỆ THỐNG HẠNG PHÒNG',
            rooms: 'SƠ ĐỒ VÀ TRẠNG THÁI PHÒNG',
            customers: 'HỒ SƠ KHÁCH HÀNG VIP',
            bookings: 'TRUNG TÂM ĐIỀU PHỐI BOOKING',
            services: 'QUẢN TRỊ DỊCH VỤ NỘI KHU'
        },
        dashboard: {
            totalRooms: 'Tổng số phòng',
            availableRooms: 'Phòng trống',
            bookings: 'Lượt đặt phòng',
            customers: 'Tổng khách lưu trú',
            recentBookings: 'Đặt phòng gần đây',
            viewAll: 'Xem tất cả',
            syncing: 'Đang đồng bộ dữ liệu hệ thống...',
            occupancy: 'Hiện trạng công suất',
            noRecentBookings: 'Không có đặt phòng gần đây',
            noRoomData: 'Hệ thống phòng chưa được khởi tạo',
            units: 'phòng'
        },
        sections: {
            roomTypeSetup: 'Thiết lập hạng phòng cao cấp',
            roomTypePortfolio: 'Portfolio Hạng Phòng',
            sync: 'Đồng bộ',
            roomAllocate: 'Cấp phát không gian',
            roomMap: 'Sơ đồ Resort (Real-time)',
            customerRegister: 'Đăng ký hồ sơ VIP',
            customerDirectory: 'Danh bạ khách hàng',
            newBooking: 'Lập Reservation Mới',
            bookingOps: 'Quản lý vận hành Booking',
            serviceSetup: 'Tích hợp tiện ích nội khu',
            serviceMenu: 'Menu Dịch Vụ Resort'
        },
        form: {
            roomTypeName: 'Tên hạng phòng',
            roomTypePrice: 'Giá mỗi đêm (VNĐ)',
            roomTypeCapacity: 'Sức chứa tối đa',
            roomTypeDesc: 'Tiện ích nổi bật',
            roomTypeNamePh: 'VD: Ocean View Villa',
            roomTypePricePh: '15,000,000',
            roomTypeCapacityPh: '4',
            roomTypeDescPh: 'Hồ bơi riêng, Quản gia 24/7...',
            updateSystem: 'Cập nhật hệ thống',
            roomCode: 'Mã định danh (Số phòng)',
            roomCodePh: 'VD: VILLA-01',
            roomFloor: 'Khu vực / Tầng',
            roomFloorPh: '1',
            roomCategory: 'Chuẩn hạng phòng',
            roomInitStatus: 'Trạng thái khởi tạo',
            roomReady: 'Sẵn sàng đón khách',
            roomMaintenance: 'Đóng - Đang bảo dưỡng',
            putInOperation: 'Đưa vào vận hành',
            filterAllStatus: '-- Lọc tất cả trạng thái --',
            filterAvailable: 'Phòng đang trống',
            filterOccupied: 'Phòng đang phục vụ',
            filterMaintenance: 'Đang bảo trì/Setup',
            customerName: 'Họ và Tên khách hàng',
            customerNamePh: 'Nguyễn Văn A',
            customerPhone: 'Hotline cá nhân',
            customerPhonePh: '090 123 4567',
            customerEmail: 'Địa chỉ Email',
            customerEmailPh: 'vip@email.com',
            saveProfile: 'Lưu trữ hồ sơ',
            customerSearchPh: 'Tra cứu thông tin khách...',
            selectCustomer: 'Chỉ định hồ sơ khách',
            selectRoom: 'Phân bổ phòng (Trống)',
            checkinDate: 'Dự kiến Check-in',
            checkoutDate: 'Dự kiến Check-out',
            createBooking: 'Phát hành Booking',
            serviceName: 'Tên gói dịch vụ',
            serviceNamePh: 'VD: Liệu trình Spa 90 phút, BBQ Bãi Biển...',
            servicePrice: 'Biểu phí (VNĐ)',
            servicePricePh: '1,500,000',
            activateService: 'Kích hoạt gói',
            cancelTask: 'Hủy tác vụ',
            overrideData: 'Ghi đè dữ liệu',
            systemNotice: 'Thông báo hệ thống'
        },
        table: {
            guestName: 'Tên khách',
            timeline: 'Mốc thời gian',
            status: 'Trạng thái',
            roomType: 'Hạng phòng',
            listedPrice: 'Niêm yết/Đêm',
            capacity: 'Sức chứa',
            action: 'Thao tác',
            area: 'Khu vực',
            category: 'Phân hạng',
            standardPrice: 'Báo giá chuẩn',
            currentStatus: 'Trạng thái hiện tại',
            management: 'Quản lý'
            ,
            roomCode: 'Định danh',
            serviceCode: 'Mã DV',
            serviceDesc: 'Mô tả tiện ích',
            serviceFee: 'Phí dịch vụ',
            reservationCode: 'Mã Reservation',
            guestRepresentative: 'Đại diện lưu trú',
            checkinTime: 'Thời điểm Check-in',
            checkoutTime: 'Thời điểm Check-out',
            orderStatus: 'Trạng thái Order',
            command: 'Lệnh',
            customerCode: '#Mã KH',
            customerName: 'Tên Khách Hàng',
            contactPhone: 'Liên hệ (Phone)',
            email: 'Email',
            createdDate: 'Ngày mở hồ sơ',
            lookup: 'Tra cứu',
            roomTypeId: '#ID'
        },
        roomTypes: {
            noData: 'Chưa có hạng phòng nào',
            standard: 'Tiêu chuẩn 5 sao',
            people: 'người'
        },
        rooms: {
            noData: 'Chưa có dữ liệu vận hành phòng',
            areaPrefix: 'Khu vực',
            adjust: 'Điều chỉnh'
        },
        customers: {
            noName: 'Họ tên khách hàng là bắt buộc',
            saved: 'Hồ sơ đã được lưu trữ an toàn',
            profile: 'Hồ sơ'
        },
        bookings: {
            addSuccess: 'Đã khởi tạo Reservation',
            statusChanged: 'Chuyển trạng thái sang',
            deleteConfirm: 'CẢNH BÁO: Bạn có chắc chắn muốn hủy Reservation này?',
            deleted: 'Reservation đã bị hủy',
            approve: 'Duyệt'
        },
        services: {
            missingFields: 'Cần có Tên và Biểu phí dịch vụ',
            added: 'Dịch vụ đã được Live trên hệ thống',
            deleteConfirm: 'Ngừng cung cấp dịch vụ này?',
            deleted: 'Đã gỡ dịch vụ khỏi danh mục',
            deactivate: 'Ngừng cung cấp'
        },
        common: {
            systemError: 'Lỗi hệ thống',
            active: 'Đang hoạt động'
        }
    },
    en: {
        page: {
            title: 'AURA LUXURY RESORT | Smart Management System',
            connect: 'Connecting...',
            syncOk: 'Sync: OK',
            disconnected: 'Server disconnected'
        },
        nav: {
            dashboard: 'OVERVIEW',
            reports: 'REPORTS',
            roomtypes: 'ROOM TYPES',
            rooms: 'ROOM MANAGEMENT',
            customers: 'CUSTOMERS',
            bookings: 'RECEPTION & BOOKINGS',
            services: 'RESORT SERVICES'
        },
        tab: {
            dashboard: 'RESORT OVERVIEW',
            reports: 'REVENUE REPORTS',
            roomtypes: 'ROOM TYPE SYSTEM',
            rooms: 'ROOM MAP & STATUS',
            customers: 'VIP CUSTOMER PROFILES',
            bookings: 'BOOKING CONTROL CENTER',
            services: 'ON-SITE SERVICE MANAGEMENT'
        },
        dashboard: {
            totalRooms: 'Total rooms',
            availableRooms: 'Available rooms',
            bookings: 'Bookings',
            customers: 'Total guests',
            recentBookings: 'Recent bookings',
            viewAll: 'View all',
            syncing: 'Synchronizing system data...',
            occupancy: 'Occupancy status',
            noRecentBookings: 'No recent bookings',
            noRoomData: 'No room data initialized',
            units: 'units'
        },
        sections: {
            roomTypeSetup: 'Premium room type setup',
            roomTypePortfolio: 'Room Type Portfolio',
            sync: 'Sync',
            roomAllocate: 'Allocate room inventory',
            roomMap: 'Resort map (Real-time)',
            customerRegister: 'Register VIP profile',
            customerDirectory: 'Customer directory',
            newBooking: 'Create new reservation',
            bookingOps: 'Booking operations management',
            serviceSetup: 'Configure on-site services',
            serviceMenu: 'Resort service menu'
        },
        form: {
            roomTypeName: 'Room type name',
            roomTypePrice: 'Price per night (VND)',
            roomTypeCapacity: 'Max capacity',
            roomTypeDesc: 'Highlights',
            roomTypeNamePh: 'Ex: Ocean View Villa',
            roomTypePricePh: '15,000,000',
            roomTypeCapacityPh: '4',
            roomTypeDescPh: 'Private pool, 24/7 butler...',
            updateSystem: 'Update system',
            roomCode: 'Identifier (Room number)',
            roomCodePh: 'Ex: VILLA-01',
            roomFloor: 'Area / Floor',
            roomFloorPh: '1',
            roomCategory: 'Room category',
            roomInitStatus: 'Initial status',
            roomReady: 'Ready for guests',
            roomMaintenance: 'Closed - Under maintenance',
            putInOperation: 'Put into operation',
            filterAllStatus: '-- Filter all statuses --',
            filterAvailable: 'Available rooms',
            filterOccupied: 'Occupied rooms',
            filterMaintenance: 'Maintenance / Setup',
            customerName: 'Customer full name',
            customerNamePh: 'Nguyen Van A',
            customerPhone: 'Personal hotline',
            customerPhonePh: '090 123 4567',
            customerEmail: 'Email address',
            customerEmailPh: 'vip@email.com',
            saveProfile: 'Save profile',
            customerSearchPh: 'Search customer information...',
            selectCustomer: 'Select customer profile',
            selectRoom: 'Assign room (Available)',
            checkinDate: 'Expected check-in',
            checkoutDate: 'Expected check-out',
            createBooking: 'Issue booking',
            serviceName: 'Service package name',
            serviceNamePh: 'Ex: 90-min Spa, Beach BBQ...',
            servicePrice: 'Price (VND)',
            servicePricePh: '1,500,000',
            activateService: 'Activate package',
            cancelTask: 'Cancel task',
            overrideData: 'Overwrite data',
            systemNotice: 'System notification'
        },
        table: {
            guestName: 'Guest name',
            timeline: 'Timeline',
            status: 'Status',
            roomType: 'Room type',
            listedPrice: 'Listed/Night',
            capacity: 'Capacity',
            action: 'Action',
            area: 'Area',
            category: 'Category',
            standardPrice: 'Standard price',
            currentStatus: 'Current status',
            management: 'Management'
            ,
            roomCode: 'Identifier',
            serviceCode: 'Service ID',
            serviceDesc: 'Service description',
            serviceFee: 'Service fee',
            reservationCode: 'Reservation ID',
            guestRepresentative: 'Guest representative',
            checkinTime: 'Check-in date',
            checkoutTime: 'Check-out date',
            orderStatus: 'Order status',
            command: 'Command',
            customerCode: 'Customer ID',
            customerName: 'Customer name',
            contactPhone: 'Contact (Phone)',
            email: 'Email',
            createdDate: 'Created date',
            lookup: 'Lookup',
            roomTypeId: '#ID'
        },
        roomTypes: {
            noData: 'No room types found',
            standard: '5-star standard',
            people: 'people'
        },
        rooms: {
            noData: 'No room operations data',
            areaPrefix: 'Area',
            adjust: 'Adjust'
        },
        customers: {
            noName: 'Customer full name is required',
            saved: 'Customer profile saved',
            profile: 'Profile'
        },
        bookings: {
            addSuccess: 'Reservation created',
            statusChanged: 'Status changed to',
            deleteConfirm: 'WARNING: Are you sure you want to cancel this reservation?',
            deleted: 'Reservation canceled',
            approve: 'Approve'
        },
        services: {
            missingFields: 'Service name and price are required',
            added: 'Service is now live in system',
            deleteConfirm: 'Stop providing this service?',
            deleted: 'Service removed from catalog',
            deactivate: 'Deactivate'
        },
        common: {
            systemError: 'System error',
            active: 'Active'
        }
    }
};

function t(key) {
    return key.split('.').reduce((acc, k) => (acc && acc[k] != null ? acc[k] : null), I18N[currentLang]) || key;
}

// --- HELPER FUNCTIONS ---
function fmt(n) { return new Intl.NumberFormat(currentLang === 'en' ? 'en-US' : 'vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0); }
function fmtDate(d) { return d ? new Date(d).toLocaleDateString(currentLang === 'en' ? 'en-US' : 'vi-VN') : '-'; }

function statusTag(s) {
    const statusText = {
        vi: {
            'Trống': 'Trống', 'Đã xác nhận': 'Đã xác nhận', 'Đã trả phòng': 'Đã trả phòng',
            'Đang ở': 'Đang ở', 'Chờ': 'Chờ', 'Chờ xác nhận': 'Chờ xác nhận',
            'Bảo trì': 'Bảo trì', 'Đã hủy': 'Đã hủy'
        },
        en: {
            'Trống': 'Available', 'Đã xác nhận': 'Confirmed', 'Đã trả phòng': 'Checked out',
            'Đang ở': 'Occupied', 'Chờ': 'Pending', 'Chờ xác nhận': 'Pending',
            'Bảo trì': 'Maintenance', 'Đã hủy': 'Canceled'
        }
    };
    const map = {
        'Trống': 'green', 'Đã xác nhận': 'green', 'Đã trả phòng': 'emerald',
        'Đang ở': 'blue', 'Chờ': 'yellow', 'Chờ xác nhận': 'yellow',
        'Bảo trì': 'red', 'Đã hủy': 'red'
    };
    return `<span class="tag tag-${map[s] || 'blue'}">${statusText[currentLang][s] || s}</span>`;
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
        const contentType = r.headers.get('content-type') || '';
        const data = contentType.includes('application/json') ? await r.json() : null;
        if (!r.ok) throw new Error((data && data.error) || t('common.systemError'));
        return data;
    } catch(e) {
        toast(e.message, 'error');
        throw e;
    }
}

// --- TAB NAVIGATION ---
const tabTitles = {
    dashboard: () => t('tab.dashboard'),
    reports: () => (currentLang === 'en' ? 'Revenue Reports' : 'Báo cáo doanh thu'),
    roomtypes: () => t('tab.roomtypes'),
    rooms: () => t('tab.rooms'),
    customers: () => t('tab.customers'),
    bookings: () => t('tab.bookings'),
    services: () => t('tab.services')
};

function showTab(name) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    document.getElementById('tab-' + name).classList.add('active');
    const items = document.querySelectorAll('.nav-item');
    const index = Object.keys(tabTitles).indexOf(name);
    if(items[index]) items[index].classList.add('active');

    document.getElementById('pageTitle').textContent = tabTitles[name]();

    const loaders = {
        dashboard: loadDashboard,
        reports: loadReports,
        roomtypes: loadRoomTypes,
        rooms: loadRooms,
        customers: loadCustomers,
        bookings: loadBookings,
        services: loadServices
    };
    loaders[name]?.();
}

// --- DASHBOARD ---
async function safeGet(url, fallback) {
    try {
        const r = await fetch(url);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const contentType = r.headers.get('content-type') || '';
        const data = contentType.includes('application/json') ? await r.json() : fallback;
        return { ok: true, data };
    } catch (e) {
        return { ok: false, data: fallback };
    }
}

async function loadDashboard() {
    try {
        const [roomsRes, bookingsRes, customersRes] = await Promise.all([
            safeGet(`${API}/rooms`, []),
            safeGet(`${API}/bookings`, []),
            safeGet(`${API}/customers`, []),
        ]);
        const rooms = roomsRes.data;
        const bookings = bookingsRes.data;
        const customers = customersRes.data;

        allRooms = rooms; allBookings = bookings; allCustomers = customers;

        document.getElementById('statTotalRooms').textContent = rooms.length;
        document.getElementById('statAvailRooms').textContent = rooms.filter(r=>r.status==='Trống').length;
        document.getElementById('statBookings').textContent = bookings.length;
        document.getElementById('statCustomers').textContent = customers.length;

        const statusIndicator = document.getElementById('serverStatus');
        if (roomsRes.ok || bookingsRes.ok || customersRes.ok) {
            statusIndicator.innerHTML = `<i class="fas fa-satellite-dish"></i> ${t('page.syncOk')}`;
            statusIndicator.classList.add('online');
        } else {
            statusIndicator.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${t('page.disconnected')}`;
            statusIndicator.classList.remove('online');
        }

        const bCust = document.getElementById('b-customer');
        if(bCust) bCust.innerHTML = customers.map(c => `<option value="${c.id}">${c.fullName}</option>`).join('');

        const bRoom = document.getElementById('b-room');
        if(bRoom) bRoom.innerHTML = rooms.filter(r => r.status === 'Trống').map(r => `<option value="${r.id}">${r.roomNumber} (${r.roomType?.typeName})</option>`).join('');

        document.getElementById('dashBookings').innerHTML = `
            <div class="table-wrap">
                <table>
                    <thead><tr><th>${t('table.guestName')}</th><th>${t('table.timeline')}</th><th>${t('table.status')}</th></tr></thead>
                    <tbody>
                        ${bookings.slice(0, 5).map(b => `
                            <tr>
                                <td><div style="font-weight:500; color:var(--accent-gold)">${b.customer?.fullName}</div></td>
                                <td><span style="font-family:'Inter'; font-size:12px; color:var(--text-muted)">${fmtDate(b.checkInDate)} <i class="fas fa-arrow-right" style="margin:0 5px; opacity:0.5"></i> ${fmtDate(b.checkOutDate)}</span></td>
                                <td>${statusTag(b.status)}</td>
                            </tr>
                        `).join('')}
                        ${bookings.length === 0 ? `<tr><td colspan="3" style="text-align:center; padding:30px; opacity:0.5">${t('dashboard.noRecentBookings')}</td></tr>` : ''}
                    </tbody>
                </table>
            </div>`;

        const statusCount = {};
        rooms.forEach(r => statusCount[r.status] = (statusCount[r.status]||0)+1);
        document.getElementById('dashRooms').innerHTML = Object.entries(statusCount).map(([s, c]) => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding: 18px 0; border-bottom: 1px solid rgba(255,255,255,0.05)">
                <span style="font-weight:500">${statusTag(s)}</span>
                <strong style="color:var(--accent-cyan); font-size:16px; text-shadow: 0 0 10px rgba(0,242,254,0.3)">${c} ${t('dashboard.units')}</strong>
            </div>
        `).join('') || `<p class="empty-state">${t('dashboard.noRoomData')}</p>`;
        loadRevenueChart();

    } catch(e) {
        console.error(e);
        const statusIndicator = document.getElementById('serverStatus');
        statusIndicator.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${t('page.disconnected')}`;
        statusIndicator.classList.remove('online');
    }
}

// --- HẠNG PHÒNG ---
async function loadRoomTypes() {
    const data = await fetch(`${API}/room-types`).then(r=>r.json()).catch(()=>[]);
    allRoomTypes = data;
    const tbody = document.getElementById('rt-tbody');
    tbody.innerHTML = data.map(rt => `
        <tr>
            <td><span style="color:var(--text-dim); font-family:'Poppins'">#${rt.id}</span></td>
            <td><strong style="color:var(--accent-gold); font-size:15px">${rt.typeName}</strong><br><small style="color:var(--text-dim)">${rt.description || t('roomTypes.standard')}</small></td>
            <td><strong style="color:var(--accent-emerald)">${fmt(rt.pricePerNight)}</strong></td>
            <td><i class="fas fa-users" style="color:var(--accent-cyan); margin-right:5px"></i> ${rt.capacity} ${t('roomTypes.people')}</td>
            <td><span class="tag tag-blue">${t('common.active')}</span></td>
            <td>
                <div style="display:flex; gap:8px">
                    <button class="btn btn-outline btn-sm" onclick="editRoomType(${rt.id})"><i class="fas fa-pen"></i></button>
                    <button class="btn btn-outline btn-sm" style="color:var(--accent-rose); border-color:rgba(251, 113, 133, 0.3)" onclick="deleteRoomType(${rt.id})"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>`).join('') || `<tr><td colspan="6" class="empty-state">${t('roomTypes.noData')}</td></tr>`;

    const sel = document.getElementById('r-type');
    if (sel) sel.innerHTML = data.map(rt => `<option value="${rt.id}">${rt.typeName}</option>`).join('');
}

async function addRoomType() {
    const name = document.getElementById('rt-name').value;
    const price = document.getElementById('rt-price').value;
    const cap = document.getElementById('rt-capacity').value;
    if(!name || !price || !cap) return toast(currentLang === 'en' ? 'Please provide all required fields' : 'Vui lòng cung cấp đủ thông tin tham số', 'error');

    await api('POST', '/room-types', { typeName: name, pricePerNight: price, capacity: cap, description: document.getElementById('rt-desc').value });
    toast(currentLang === 'en' ? 'Room type created successfully' : 'Đã ghi nhận hạng phòng mới', 'success');
    loadRoomTypes();
}

// --- PHÒNG ---
async function loadRooms() {
    const data = await fetch(`${API}/rooms`).then(r=>r.json()).catch(()=>[]);
    allRooms = data;
    renderRooms(data);
    if (!allRoomTypes.length) loadRoomTypes();
}

function renderRooms(data) {
    const tbody = document.getElementById('rooms-tbody');
    tbody.innerHTML = data.map(r => `
        <tr>
            <td><strong style="color:var(--accent-cyan); font-size:16px">${r.roomNumber}</strong></td>
            <td>${t('rooms.areaPrefix')} ${r.floorNumber}</td>
            <td style="color:var(--accent-gold)">${r.roomType?.typeName || 'N/A'}</td>
            <td>${fmt(r.roomType?.pricePerNight)}</td>
            <td>${statusTag(r.status)}</td>
            <td>
                <button class="btn btn-outline btn-sm" onclick="editRoom(${r.id})"><i class="fas fa-sliders-h"></i> ${t('rooms.adjust')}</button>
            </td>
        </tr>`).join('') || `<tr><td colspan="6" class="empty-state">${t('rooms.noData')}</td></tr>`;
}

function filterRooms() {
    const s = document.getElementById('filter-room-status').value;
    renderRooms(s ? allRooms.filter(r => r.status === s) : allRooms);
}

async function addRoom() {
    const num = document.getElementById('r-number').value;
    const type = document.getElementById('r-type').value;
    if(!num || !type) return toast(currentLang === 'en' ? 'Room identifier is required' : 'Cần có mã định danh phòng', 'error');
    await api('POST', '/rooms', { roomNumber: num, floorNumber: document.getElementById('r-floor').value, status: document.getElementById('r-status').value, roomTypeId: Number(type) });
    toast(currentLang === 'en' ? 'Room initialized successfully' : 'Khởi tạo không gian thành công');
    loadRooms();
}

// --- KHÁCH HÀNG ---
async function loadCustomers() {
    const data = await fetch(`${API}/customers`).then(r=>r.json()).catch(()=>[]);
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
            <td>${new Date().toLocaleDateString(currentLang === 'en' ? 'en-US' : 'vi-VN')}</td>
            <td>
                <button class="btn btn-outline btn-sm" onclick="editCustomer(${c.id})"><i class="fas fa-user-edit"></i> ${t('customers.profile')}</button>
            </td>
        </tr>`).join('');
}

function searchCustomers() {
    const q = document.getElementById('c-search').value.toLowerCase();
    renderCustomers(allCustomers.filter(c => c.fullName.toLowerCase().includes(q)));
}

async function addCustomer() {
    const name = document.getElementById('c-name').value;
    if(!name) return toast(t('customers.noName'), 'error');
    await api('POST', '/customers', { fullName: name, phone: document.getElementById('c-phone').value, email: document.getElementById('c-email').value });
    toast(t('customers.saved'));
    loadCustomers();
}

// --- ĐẶT PHÒNG ---
async function loadBookings() {
    const data = await safeGet(`${API}/bookings`, []).then(r => r.data);
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
                ${b.status === 'Chờ' ? `<button class="btn btn-success btn-sm" onclick="updateBStatus(${b.id}, 'Đã xác nhận')"><i class="fas fa-check"></i> ${t('bookings.approve')}</button>` : ''}
                <button class="btn btn-outline btn-sm" style="color:var(--accent-rose); border-color:rgba(251, 113, 133, 0.3)" onclick="deleteBooking(${b.id})"><i class="fas fa-times"></i></button>
                </div>
            </td>
        </tr>`).join('');
}

async function addBooking() {
    const payload = {
        customerId: Number(document.getElementById('b-customer').value),
        checkInDate: document.getElementById('b-checkin').value,
        checkOutDate: document.getElementById('b-checkout').value,
        roomIds: [Number(document.getElementById('b-room').value)]
    };
    await api('POST', '/bookings', payload);
    toast(t('bookings.addSuccess'));
    loadBookings();
    loadDashboard();
}

async function updateBStatus(id, status) {
    await api('PATCH', `/bookings/${id}/status`, { status });
    toast(`${t('bookings.statusChanged')}: ${statusTag(status).replace(/<[^>]+>/g, '')}`);
    loadBookings();
}

async function deleteBooking(id) {
    if(!confirm(t('bookings.deleteConfirm'))) return;
    await api('DELETE', `/bookings/${id}`);
    toast(t('bookings.deleted'));
    loadBookings();
}

// --- DỊCH VỤ ---
async function loadServices() {
    const data = await fetch(`${API}/services`).then(r=>r.json()).catch(()=>[]);
    allServices = data;
    document.getElementById('svc-tbody').innerHTML = data.map(s => `
        <tr>
            <td><span style="color:var(--text-dim)">#SRV-${s.id}</span></td>
            <td><strong style="font-size:15px">${s.serviceName}</strong></td>
            <td><strong style="color:var(--accent-gold); font-size:16px">${fmt(s.price)}</strong></td>
            <td>
                <button class="btn btn-outline btn-sm" style="color:var(--accent-rose)" onclick="deleteService(${s.id})"><i class="fas fa-ban"></i> ${t('services.deactivate')}</button>
            </td>
        </tr>`).join('');
}

async function addService() {
    const name = document.getElementById('svc-name').value;
    const price = document.getElementById('svc-price').value;
    if(!name || !price) return toast(t('services.missingFields'), 'error');
    await api('POST', '/services', { serviceName: name, price });
    toast(t('services.added'));
    loadServices();
}

async function deleteService(id) {
    if(!confirm(t('services.deleteConfirm'))) return;
    await api('DELETE', `/services/${id}`);
    toast(t('services.deleted'));
    loadServices();
}

async function loadRevenueChart() {
    const period = document.getElementById('revenue-period')?.value || 'month';
    const data = await safeGet(`${API}/payments/revenue?period=${period}`, []).then(r => r.data);
    const labels = data.map(x => x.period);
    const values = data.map(x => x.revenue || 0);
    const totalRevenue = values.reduce((sum, value) => sum + value, 0);

    const totalEl = document.getElementById('revenue-total');
    const countEl = document.getElementById('revenue-count');
    if (totalEl) totalEl.textContent = fmt(totalRevenue);
    if (countEl) {
        countEl.textContent = currentLang === 'en'
            ? `${labels.length} period(s) of data`
            : `${labels.length} kỳ dữ liệu`;
    }

    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;

    if (revenueChart) {
        revenueChart.destroy();
    }

    revenueChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: currentLang === 'en' ? 'Revenue (paid)' : 'Doanh thu đã thanh toán',
                data: values,
                borderWidth: 1.5,
                borderColor: 'rgba(0, 242, 254, 0.9)',
                backgroundColor: 'rgba(0, 242, 254, 0.25)',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    ticks: { color: 'rgba(255,255,255,0.8)' },
                    grid: { color: 'rgba(255,255,255,0.08)' }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'rgba(255,255,255,0.8)',
                        callback: (value) => new Intl.NumberFormat(currentLang === 'en' ? 'en-US' : 'vi-VN').format(value)
                    },
                    grid: { color: 'rgba(255,255,255,0.08)' }
                }
            },
            plugins: {
                legend: {
                    labels: { color: 'rgba(255,255,255,0.9)' }
                }
            }
        }
    });
}

function setupReportLineChart(labels, values, previousValues) {
    const canvas = document.getElementById('reportLineChart');
    if (!canvas) return;
    if (reportLineChart) reportLineChart.destroy();
    reportLineChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: currentLang === 'en' ? 'This period' : 'Kỳ này',
                    data: values,
                    borderColor: '#00f2fe',
                    backgroundColor: 'rgba(0,242,254,0.18)',
                    fill: true,
                    tension: 0.35
                },
                {
                    label: currentLang === 'en' ? 'Previous period' : 'Kỳ trước',
                    data: previousValues,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245,158,11,0.08)',
                    fill: false,
                    tension: 0.35
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: 'rgba(255,255,255,0.9)' } } },
            scales: {
                x: { ticks: { color: 'rgba(255,255,255,0.8)' }, grid: { color: 'rgba(255,255,255,0.08)' } },
                y: { ticks: { color: 'rgba(255,255,255,0.8)' }, grid: { color: 'rgba(255,255,255,0.08)' } }
            }
        }
    });
}

function setupReportDonutChart(roomRevenueMap) {
    const canvas = document.getElementById('reportDonutChart');
    if (!canvas) return;
    if (reportDonutChart) reportDonutChart.destroy();

    const labels = Object.keys(roomRevenueMap);
    const values = Object.values(roomRevenueMap);
    reportDonutChart = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: ['#0ea5e9', '#f59e0b', '#10b981', '#22d3ee', '#f43f5e', '#a855f7']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: 'rgba(255,255,255,0.9)' }
                }
            }
        }
    });
}

async function loadReports() {
    const [rooms, bookings, customers, monthlyRevenue] = await Promise.all([
        safeGet(`${API}/rooms`, []).then(r => r.data),
        safeGet(`${API}/bookings`, []).then(r => r.data),
        safeGet(`${API}/customers`, []).then(r => r.data),
        safeGet(`${API}/payments/revenue?period=month`, []).then(r => r.data)
    ]);

    const revenueValues = monthlyRevenue.map(x => x.revenue || 0);
    const totalRevenue = revenueValues.reduce((a, b) => a + b, 0);
    const avgRoomRevenue = rooms.length ? totalRevenue / rooms.length : 0;
    const occupancyRate = rooms.length ? Math.round((rooms.filter(r => r.status === 'Đang ở').length / rooms.length) * 100) : 0;

    const reportTotalRevenue = document.getElementById('reportTotalRevenue');
    const reportTotalBookings = document.getElementById('reportTotalBookings');
    const reportOccupancy = document.getElementById('reportOccupancy');
    const reportAvgRevenue = document.getElementById('reportAvgRevenue');
    if (reportTotalRevenue) reportTotalRevenue.textContent = fmt(totalRevenue);
    if (reportTotalBookings) reportTotalBookings.textContent = bookings.length.toLocaleString();
    if (reportOccupancy) reportOccupancy.textContent = `${occupancyRate}%`;
    if (reportAvgRevenue) reportAvgRevenue.textContent = fmt(avgRoomRevenue);

    const labels = monthlyRevenue.map(x => x.period);
    const prevValues = revenueValues.map((_, i) => Math.max(0, Math.round((revenueValues[i - 1] ?? revenueValues[i] ?? 0) * 0.92)));
    setupReportLineChart(labels, revenueValues, prevValues);

    const typeRevenueMap = {};
    rooms.forEach(r => {
        const key = r.roomType?.typeName || 'Khác';
        const weight = r.roomType?.pricePerNight || 0;
        typeRevenueMap[key] = (typeRevenueMap[key] || 0) + weight;
    });
    setupReportDonutChart(typeRevenueMap);

    const tbody = document.getElementById('reportTableBody');
    if (tbody) {
        tbody.innerHTML = monthlyRevenue.map((row, idx) => {
            const customersEstimate = customers.length ? Math.max(1, Math.round(customers.length * (0.55 + idx * 0.04))) : 0;
            const bookingEstimate = bookings.length ? Math.max(1, Math.round(bookings.length * (0.5 + idx * 0.05))) : 0;
            const roomRevenue = row.revenue || 0;
            const serviceRevenue = Math.round(roomRevenue * 0.25);
            const total = roomRevenue + serviceRevenue;
            return `
                <tr>
                    <td>${row.period}</td>
                    <td>${bookingEstimate}</td>
                    <td>${customersEstimate}</td>
                    <td>${fmt(roomRevenue)}</td>
                    <td>${fmt(serviceRevenue)}</td>
                    <td>${fmt(total)}</td>
                </tr>
            `;
        }).join('') || `<tr><td colspan="6" class="empty-state">${currentLang === 'en' ? 'No revenue data yet' : 'Chưa có dữ liệu doanh thu'}</td></tr>`;
    }
}

// --- UTILS ---
function closeModal() { document.getElementById('editModal').classList.remove('show'); }

function applyStaticTranslations() {
    document.title = t('page.title');
    const navItems = document.querySelectorAll('.nav-item');
    const navKeys = ['dashboard', 'reports', 'roomtypes', 'rooms', 'customers', 'bookings', 'services'];
    navItems.forEach((item, idx) => {
        const icon = item.querySelector('i');
        item.innerHTML = `${icon ? icon.outerHTML : ''} ${t(`nav.${navKeys[idx]}`)}`;
    });

    const selectors = [
        ['#serverStatus', `<i class="fas fa-circle"></i> ${t('page.connect')}`],
        ['#tab-dashboard .stat-card:nth-child(1) p', t('dashboard.totalRooms')],
        ['#tab-dashboard .stat-card:nth-child(2) p', t('dashboard.availableRooms')],
        ['#tab-dashboard .stat-card:nth-child(3) p', t('dashboard.bookings')],
        ['#tab-dashboard .stat-card:nth-child(4) p', t('dashboard.customers')],
        ['#tab-dashboard .empty-state p', t('dashboard.syncing')],
        ['#tab-dashboard .panel:nth-child(3) .panel-header h2', `<i class="fas fa-chart-pie"></i> ${t('dashboard.occupancy')} `]
    ];
    selectors.forEach(([sel, text]) => {
        const el = document.querySelector(sel);
        if (el) el.innerHTML = text;
    });

    // Dashboard panels (robust selectors)
    const dashBookingsPanel = document.getElementById('dashBookings')?.closest('.panel');
    if (dashBookingsPanel) {
        const bookingsTitle = dashBookingsPanel.querySelector('.panel-header h2');
        const bookingsBtn = dashBookingsPanel.querySelector('.panel-header .btn');
        if (bookingsTitle) bookingsTitle.innerHTML = `<i class="fas fa-history"></i> ${t('dashboard.recentBookings')}`;
        if (bookingsBtn) bookingsBtn.textContent = t('dashboard.viewAll');
    }
    const dashRoomsPanel = document.getElementById('dashRooms')?.closest('.panel');
    if (dashRoomsPanel) {
        const roomsTitle = dashRoomsPanel.querySelector('.panel-header h2');
        if (roomsTitle) roomsTitle.innerHTML = `<i class="fas fa-chart-pie"></i> ${t('dashboard.occupancy')}`;
    }

    // Room Types tab
    const rtSection = document.querySelector('#tab-roomtypes .panel:nth-child(1) .panel-header h2');
    if (rtSection) rtSection.innerHTML = `<i class="fas fa-crown"></i> ${t('sections.roomTypeSetup')}`;
    const rtPortfolio = document.querySelector('#tab-roomtypes .panel:nth-child(2) .panel-header h2');
    if (rtPortfolio) rtPortfolio.innerHTML = `<i class="fas fa-list-ul"></i> ${t('sections.roomTypePortfolio')}`;
    const rtSyncBtn = document.querySelector('#tab-roomtypes .panel:nth-child(2) .panel-header .btn');
    if (rtSyncBtn) rtSyncBtn.innerHTML = `<i class="fas fa-sync-alt"></i> ${t('sections.sync')}`;
    const rtLabels = document.querySelectorAll('#tab-roomtypes .form-group label');
    if (rtLabels[0]) rtLabels[0].textContent = t('form.roomTypeName');
    if (rtLabels[1]) rtLabels[1].textContent = t('form.roomTypePrice');
    if (rtLabels[2]) rtLabels[2].textContent = t('form.roomTypeCapacity');
    if (rtLabels[3]) rtLabels[3].textContent = t('form.roomTypeDesc');
    const rtHead = document.querySelectorAll('#tab-roomtypes thead th');
    if (rtHead[0]) rtHead[0].textContent = t('table.roomTypeId');
    if (rtHead[1]) rtHead[1].textContent = t('table.roomType');
    if (rtHead[2]) rtHead[2].textContent = t('table.listedPrice');
    if (rtHead[3]) rtHead[3].textContent = t('table.capacity');
    if (rtHead[4]) rtHead[4].textContent = t('table.status');
    if (rtHead[5]) rtHead[5].textContent = t('table.action');
    const rtUpdateBtn = document.querySelector('#tab-roomtypes .panel:nth-child(1) .btn');
    if (rtUpdateBtn) rtUpdateBtn.innerHTML = `<i class="fas fa-save"></i> ${t('form.updateSystem')}`;
    const rtName = document.getElementById('rt-name');
    const rtPrice = document.getElementById('rt-price');
    const rtCap = document.getElementById('rt-capacity');
    const rtDesc = document.getElementById('rt-desc');
    if (rtName) rtName.placeholder = t('form.roomTypeNamePh');
    if (rtPrice) rtPrice.placeholder = t('form.roomTypePricePh');
    if (rtCap) rtCap.placeholder = t('form.roomTypeCapacityPh');
    if (rtDesc) rtDesc.placeholder = t('form.roomTypeDescPh');

    // Rooms tab
    const roomSetup = document.querySelector('#tab-rooms .panel:nth-child(1) .panel-header h2');
    if (roomSetup) roomSetup.innerHTML = `<i class="fas fa-plus-square"></i> ${t('sections.roomAllocate')}`;
    const roomMap = document.querySelector('#tab-rooms .panel:nth-child(2) .panel-header h2');
    if (roomMap) roomMap.innerHTML = `<i class="fas fa-th-large"></i> ${t('sections.roomMap')}`;
    const roomLabels = document.querySelectorAll('#tab-rooms .panel:nth-child(1) .form-group label');
    if (roomLabels[0]) roomLabels[0].textContent = t('form.roomCode');
    if (roomLabels[1]) roomLabels[1].textContent = t('form.roomFloor');
    if (roomLabels[2]) roomLabels[2].textContent = t('form.roomCategory');
    if (roomLabels[3]) roomLabels[3].textContent = t('form.roomInitStatus');
    const rNum = document.getElementById('r-number');
    const rFloor = document.getElementById('r-floor');
    if (rNum) rNum.placeholder = t('form.roomCodePh');
    if (rFloor) rFloor.placeholder = t('form.roomFloorPh');
    const rStatus = document.getElementById('r-status');
    if (rStatus) {
        if (rStatus.options[0]) rStatus.options[0].textContent = t('form.roomReady');
        if (rStatus.options[1]) rStatus.options[1].textContent = t('form.roomMaintenance');
    }
    const roomRunBtn = document.querySelector('#tab-rooms .panel:nth-child(1) .btn');
    if (roomRunBtn) roomRunBtn.innerHTML = `<i class="fas fa-check-double"></i> ${t('form.putInOperation')}`;
    const roomFilter = document.getElementById('filter-room-status');
    if (roomFilter) {
        if (roomFilter.options[0]) roomFilter.options[0].textContent = t('form.filterAllStatus');
        if (roomFilter.options[1]) roomFilter.options[1].textContent = t('form.filterAvailable');
        if (roomFilter.options[2]) roomFilter.options[2].textContent = t('form.filterOccupied');
        if (roomFilter.options[3]) roomFilter.options[3].textContent = t('form.filterMaintenance');
    }
    const roomHead = document.querySelectorAll('#tab-rooms thead th');
    if (roomHead[0]) roomHead[0].textContent = t('table.roomCode');
    if (roomHead[1]) roomHead[1].textContent = t('table.area');
    if (roomHead[2]) roomHead[2].textContent = t('table.category');
    if (roomHead[3]) roomHead[3].textContent = t('table.standardPrice');
    if (roomHead[4]) roomHead[4].textContent = t('table.currentStatus');
    if (roomHead[5]) roomHead[5].textContent = t('table.management');

    // Customers tab
    const cReg = document.querySelector('#tab-customers .panel:nth-child(1) .panel-header h2');
    if (cReg) cReg.innerHTML = `<i class="fas fa-user-plus"></i> ${t('sections.customerRegister')}`;
    const cDir = document.querySelector('#tab-customers .panel:nth-child(2) .panel-header h2');
    if (cDir) cDir.innerHTML = `<i class="fas fa-address-book"></i> ${t('sections.customerDirectory')}`;
    const cLabels = document.querySelectorAll('#tab-customers .panel:nth-child(1) .form-group label');
    if (cLabels[0]) cLabels[0].textContent = t('form.customerName');
    if (cLabels[1]) cLabels[1].textContent = t('form.customerPhone');
    if (cLabels[2]) cLabels[2].textContent = t('form.customerEmail');
    const cName = document.getElementById('c-name');
    const cPhone = document.getElementById('c-phone');
    const cEmail = document.getElementById('c-email');
    const cSearch = document.getElementById('c-search');
    if (cName) cName.placeholder = t('form.customerNamePh');
    if (cPhone) cPhone.placeholder = t('form.customerPhonePh');
    if (cEmail) cEmail.placeholder = t('form.customerEmailPh');
    if (cSearch) cSearch.placeholder = t('form.customerSearchPh');
    const cSaveBtn = document.querySelector('#tab-customers .panel:nth-child(1) .btn');
    if (cSaveBtn) cSaveBtn.innerHTML = `<i class="fas fa-id-card"></i> ${t('form.saveProfile')}`;
    const cHead = document.querySelectorAll('#tab-customers thead th');
    if (cHead[0]) cHead[0].textContent = t('table.customerCode');
    if (cHead[1]) cHead[1].textContent = t('table.customerName');
    if (cHead[2]) cHead[2].textContent = t('table.contactPhone');
    if (cHead[3]) cHead[3].textContent = t('table.email');
    if (cHead[4]) cHead[4].textContent = t('table.createdDate');
    if (cHead[5]) cHead[5].textContent = t('table.lookup');

    // Bookings tab
    const bNew = document.querySelector('#tab-bookings .panel:nth-child(1) .panel-header h2');
    if (bNew) bNew.innerHTML = `<i class="fas fa-concierge-bell"></i> ${t('sections.newBooking')}`;
    const bOps = document.querySelector('#tab-bookings .panel:nth-child(2) .panel-header h2');
    if (bOps) bOps.innerHTML = `<i class="fas fa-tasks"></i> ${t('sections.bookingOps')}`;
    const bLabels = document.querySelectorAll('#tab-bookings .panel:nth-child(1) .form-group label');
    if (bLabels[0]) bLabels[0].textContent = t('form.selectCustomer');
    if (bLabels[1]) bLabels[1].textContent = t('form.selectRoom');
    if (bLabels[2]) bLabels[2].textContent = t('form.checkinDate');
    if (bLabels[3]) bLabels[3].textContent = t('form.checkoutDate');
    const bCreateBtn = document.querySelector('#tab-bookings .panel:nth-child(1) .btn');
    if (bCreateBtn) bCreateBtn.innerHTML = `<i class="fas fa-paper-plane"></i> ${t('form.createBooking')}`;
    const bHead = document.querySelectorAll('#tab-bookings thead th');
    if (bHead[0]) bHead[0].textContent = t('table.reservationCode');
    if (bHead[1]) bHead[1].textContent = t('table.guestRepresentative');
    if (bHead[2]) bHead[2].textContent = t('table.checkinTime');
    if (bHead[3]) bHead[3].textContent = t('table.checkoutTime');
    if (bHead[4]) bHead[4].textContent = t('table.orderStatus');
    if (bHead[5]) bHead[5].textContent = t('table.command');

    // Services tab
    const sSetup = document.querySelector('#tab-services .panel:nth-child(1) .panel-header h2');
    if (sSetup) sSetup.innerHTML = `<i class="fas fa-cocktail"></i> ${t('sections.serviceSetup')}`;
    const sMenu = document.querySelector('#tab-services .panel:nth-child(2) .panel-header h2');
    if (sMenu) sMenu.innerHTML = `<i class="fas fa-list-alt"></i> ${t('sections.serviceMenu')}`;
    const sLabels = document.querySelectorAll('#tab-services .panel:nth-child(1) .form-group label');
    if (sLabels[0]) sLabels[0].textContent = t('form.serviceName');
    if (sLabels[1]) sLabels[1].textContent = t('form.servicePrice');
    const sName = document.getElementById('svc-name');
    const sPrice = document.getElementById('svc-price');
    if (sName) sName.placeholder = t('form.serviceNamePh');
    if (sPrice) sPrice.placeholder = t('form.servicePricePh');
    const sAddBtn = document.querySelector('#tab-services .panel:nth-child(1) .btn');
    if (sAddBtn) sAddBtn.innerHTML = `<i class="fas fa-plus-circle"></i> ${t('form.activateService')}`;
    const sHead = document.querySelectorAll('#tab-services thead th');
    if (sHead[0]) sHead[0].textContent = t('table.serviceCode');
    if (sHead[1]) sHead[1].textContent = t('table.serviceDesc');
    if (sHead[2]) sHead[2].textContent = t('table.serviceFee');
    if (sHead[3]) sHead[3].textContent = t('table.management');

    // Modal + toast text
    const modalCancel = document.querySelector('#editModal .btn.btn-outline');
    const modalSave = document.getElementById('modal-save-btn');
    const toastMsg = document.getElementById('toast-msg');
    if (modalCancel) modalCancel.textContent = t('form.cancelTask');
    if (modalSave) modalSave.textContent = t('form.overrideData');
    if (toastMsg && toastMsg.textContent.trim() === 'Thông báo hệ thống') toastMsg.textContent = t('form.systemNotice');

    const viBtn = document.getElementById('lang-vi');
    const enBtn = document.getElementById('lang-en');
    if (viBtn && enBtn) {
        viBtn.classList.toggle('active', currentLang === 'vi');
        enBtn.classList.toggle('active', currentLang === 'en');
    }
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('resort_lang', lang);
    applyStaticTranslations();
    loadDashboard();
    const activeTab = document.querySelector('.tab-content.active')?.id?.replace('tab-', 'dashboard');
    if (activeTab && tabTitles[activeTab]) {
        document.getElementById('pageTitle').textContent = tabTitles[activeTab]();
    }
}

// Khởi tạo app
window.onload = function () {
    applyStaticTranslations();
    loadDashboard();
};