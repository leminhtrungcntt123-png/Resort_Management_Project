/**
 * AURA LUXURY RESORT - PAYMENT LOGIC
 * Chỉ sửa logic JS, giữ nguyên các ID và Class của HTML/CSS cũ.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Hiển thị dữ liệu ngay khi trang load
    renderPaymentData();
    
    // 2. Cập nhật đồng hồ thời gian thực
    setInterval(() => {
        const timeEl = document.getElementById('current-time');
        if (timeEl) {
            const now = new Date();
            timeEl.innerText = now.toLocaleString('vi-VN');
        }
    }, 1000);
});

/**
 * Hàm lấy dữ liệu và đổ vào giao diện
 */
function renderPaymentData() {
    // Ưu tiên lấy dữ liệu từ sessionStorage (từ trang index chuyển sang)
    const rawData = sessionStorage.getItem('currentPayment') || sessionStorage.getItem('last_booking');
    
    if (!rawData) {
        console.error("Không tìm thấy dữ liệu booking trong sessionStorage!");
        // Nếu không có dữ liệu thật, bạn có thể để dữ liệu mặc định hoặc thông báo lỗi
        return;
    }

    try {
        const data = JSON.parse(rawData);
        const fmt = (num) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);

        // Map dữ liệu vào các ID có sẵn trong HTML của bạn
        if(document.getElementById('p-customer')) document.getElementById('p-customer').innerText = data.customerName || data.customer || "-";
        if(document.getElementById('p-id')) document.getElementById('p-id').innerText = data.bookingId || data.id || "-";
        if(document.getElementById('p-room-type')) document.getElementById('p-room-type').innerText = data.roomName || data.roomType || "-";
        if(document.getElementById('p-days')) document.getElementById('p-days').innerText = (data.days || 0) + " ngày";
        if(document.getElementById('p-msg')) document.getElementById('p-msg').innerText = "TT-" + (data.bookingId || data.id || "001");

        // Xử lý danh sách dịch vụ
        const svcList = document.getElementById('p-services');
        let svcTotal = 0;
        if (svcList) {
            if (data.services && data.services.length > 0) {
                svcList.innerHTML = data.services.map(s => {
                    svcTotal += (s.price || 0);
                    return `<li><span>${s.name}</span> <strong>${fmt(s.price || 0)}</strong></li>`;
                }).join('');
            } else {
                svcList.innerHTML = '<li><span>Không có dịch vụ đi kèm</span> <strong>0đ</strong></li>';
            }
        }

        // Tính toán tài chính
        const roomPrice = data.roomPrice || 0;
        const days = data.days || 1;
        const roomSubtotal = roomPrice * days;
        const vat = (roomSubtotal + svcTotal) * 0.1;
        const total = roomSubtotal + svcTotal + vat;

        // Hiển thị con số
        if(document.getElementById('p-room-price')) document.getElementById('p-room-price').innerText = fmt(roomSubtotal);
        if(document.getElementById('p-service-total')) document.getElementById('p-service-total').innerText = fmt(svcTotal);
        if(document.getElementById('p-vat')) document.getElementById('p-vat').innerText = fmt(vat);
        
        const totalEl = document.getElementById('p-total');
        if (totalEl) {
            totalEl.innerText = fmt(total);
        }

        // Cập nhật QR Code động theo VietQR
        const qrImg = document.getElementById('qr-image');
        if (qrImg) {
            const bookingId = data.bookingId || data.id || "001";
            qrImg.src = `https://img.vietqr.io/image/VCB-123456789-compact2.png?amount=${Math.round(total)}&addInfo=TT%20${bookingId}`;
        }

    } catch (e) {
        console.error("Lỗi parse JSON hoặc Render dữ liệu:", e);
    }
}

/**
 * Hàm xử lý khi bấm nút "XÁC NHẬN ĐÃ THANH TOÁN"
 * Gắn trực tiếp với thuộc tính onclick="processPayment()" trong HTML của bạn
 */
async function processPayment() {
    const btn = document.querySelector('.btn-pay');
    if (!btn) return;

    // 1. Bật hiệu ứng loading và disable nút để tránh bấm nhiều lần
    btn.classList.add('loading');
    btn.disabled = true;

    console.log("Đang xử lý giao dịch...");

    try {
        // 2. Giả lập thời gian chờ xử lý (1.5 giây cho chuyên nghiệp)
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 3. Lưu mã giao dịch vào session để trang success.html hiển thị
        const txCode = "TX-" + Date.now();
        sessionStorage.setItem('last_tx', txCode);

        // 4. CHUYỂN TRANG (Lệnh quan trọng nhất)
        console.log("Thanh toán thành công. Đang chuyển hướng...");
        window.location.href = 'success.html';

    } catch (error) {
        console.error("Lỗi thực thi thanh toán:", error);
        // Nếu lỗi thì nhả nút ra cho khách bấm lại
        btn.classList.remove('loading');
        btn.disabled = false;
        alert("Có lỗi xảy ra: " + error.message);
    }
}