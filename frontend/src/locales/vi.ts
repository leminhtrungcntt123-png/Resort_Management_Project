const vi = {
  language: { english: "EN", vietnamese: "VI" },
  home: {
    title: "Hệ thống Quản lý Resort",
    subtitle: "Quản lý phòng, đặt phòng, dịch vụ và thông tin khách hàng.",
  },
  dashboard: {
    rooms: "Tổng số phòng",
    bookings: "Đặt phòng hiện tại",
    customers: "Khách hàng",
    revenue: "Doanh thu hôm nay",
  },
  charts: {
    pieTitle: "Phân tích Mật độ Đặt theo Loại phòng",
    pieDesc: "Số liệu thời gian thực được tính toán trực tiếp từ danh sách đơn đặt phòng",
    barTitle: "Lượt đặt theo tháng",
    barDesc: "Biểu đồ phân tích tần suất đặt phòng theo dòng thời gian",
    totalLabel: "Lượt đặt",
    footerPie: "Dữ liệu tự động đồng bộ hóa thông minh từ hệ thống",
    emptyData: "SQL Server hiện tại chưa có dữ liệu đặt phòng (Bookings trống)",
    loadingData: "Đang phân tích dữ liệu...",
    thisMonth: "Tháng này",
    monthPrefix: "Tháng"
  },
  // BỔ SUNG THÊM PHẦN NÀY CHO SIDEBAR
  sidebar: {
    overview: "Tổng quan",
    operation: "Quản lý vận hành",
    hrFinance: "Nhân sự & Tài chính",
    dashboard: "Dashboard",
    rooms: "Sơ đồ phòng",
    bookings: "Đặt phòng",
    customers: "Khách hàng",
    payments: "Thanh toán",
    employees: "Nhân viên",
    logout: "Đăng xuất"
  },
  bookings: {
      title: "Quản lý Đặt phòng",
      totalPrefix: "Tổng:",
      totalSuffix: "đơn đặt phòng",
      btnExportTxt: "Xuất TXT",
      btnExportExcel: "Xuất Excel",
      btnCreate: "+ Đặt phòng",
      statusExporting: "Đang xuất...",
      alertNoData: "Không có dữ liệu đặt phòng để xuất!",
      alertError: "Có lỗi xảy ra khi tải dữ liệu đơn đặt phòng!",
      qrTitle: "Quét mã thanh toán",
      qrCustomer: "Khách hàng:",
      qrCode: "Mã đơn:",
      qrCancel: "Hủy",
      qrConfirm: "Xác nhận đã quét",
      deleteTitle: "Xác nhận xóa",
      deleteDesc: "Xóa booking này sẽ trả phòng về trạng thái AVAILABLE.",
      deleteCancel: "Hủy",
      deleteConfirm: "Xóa",
      excelHeaders: {
        stt: "STT",
        code: "Mã Đặt Phòng",
        customer: "Tên Khách Hàng",
        phone: "Số Điện Thoại",
        roomNumber: "Số Phòng",
        roomType: "Loại Phòng",
        checkIn: "Ngày Vào",
        checkOut: "Ngày Ra",
        status: "Trạng Thái Đơn",
        method: "Phương Thức TT",
        payStatus: "Trạng Thái TT",
        amount: "Tổng Tiền (VND)"
      },
      txtHeaders: {
        code: "Mã Đơn",
        customer: "Khách Hàng",
        roomNumber: "Số Phòng",
        checkIn: "Ngày Check-in",
        checkOut: "Ngày Check-out",
        status: "Trạng Thái Đơn",
        payment: "Thanh Toán"
      },
      filter: {
        all: "Tất cả",
        pending: "Chờ xác nhận",
        confirmed: "Đã xác nhận",
        checkedIn: "Đã nhận phòng (Checked-in)",
        checkedOut: "Đã trả phòng (Checked-out)",
        cancelled: "Đã hủy"
      },
      table: {
        code: "Mã đơn",
        customer: "Khách hàng",
        room: "Phòng",
        checkIn: "Ngày vào",
        checkOut: "Ngày ra",
        status: "Trạng thái",
        payment: "Thanh toán",
        actions: "Thao tác",
        loading: "Đang tải dữ liệu...",
        empty: "Không có đơn đặt phòng nào.",
        btnCheckIn: "Nhận phòng",
        btnCheckOut: "Trả phòng",
        btnDetail: "Chi tiết",
        btnDelete: "Xóa"
      },
      pagination: {
        prev: "Trang trước",
        next: "Trang sau",
        pageOf: "Trang {current} trên {total}"
      }
  },
  rooms: {
    title: "Sơ đồ phòng Resort",
    subtitle: "Theo dõi trạng thái phòng hiện tại và xử lý vận hành nhanh.",
    btnCreate: "+ Thêm phòng",
    loading: "Đang tải danh sách phòng...",
    empty: "Không tìm thấy phòng nào phù hợp.",
    filter: {
      all: "Tất cả phòng",
      available: "Phòng trống (Available)",
      booked: "Đã đặt (Booked)",
      occupied: "Đang ở (Occupied)",
      maintenance: "Bảo trì (Maintenance)"
    },
    card: {
      roomPrefix: "Phòng",
      type: "Loại:",
      price: "Giá:",
      status: "Trạng thái:",
      btnQuickAction: "Thao tác nhanh",
      btnDetail: "Xem chi tiết"
    },
    title: "Quản lý Phòng",
    totalPrefix: "Tổng:",
    totalSuffix: "phòng",
    btnExportTxt: "Xuất TXT",
    btnExportExcel: "Xuất Excel",
    btnCreate: "+ Thêm phòng",
    statusExporting: "Đang xuất...",
    alertNoData: "Không có dữ liệu phòng để xuất!",
    alertError: "Có lỗi xảy ra khi tải dữ liệu phòng!",
    deleteTitle: "Xác nhận xóa",
    deleteDesc: "Bạn có chắc muốn xóa phòng này không? Hành động này không thể hoàn tác.",
    deleteCancel: "Hủy",
    deleteConfirm: "Xóa",
    errorDefault: "Có lỗi xảy ra",
    excelHeaders: {
      stt: "STT",
      roomNumber: "Số Phòng",
      floorNumber: "Tầng số",
      roomType: "Tên Loại Phòng",
      price: "Giá Phòng / Đêm (VND)",
      capacity: "Sức Chứa (Người)",
      status: "Trạng Thái Hiện Tại"
    },
    txtHeaders: {
      roomNumber: "Số Phòng",
      floorNumber: "Số Tầng",
      roomType: "Loại Phòng",
      status: "Trạng Thái",
      price: "Giá Gốc"
    },
    allFloors: "Tất cả tầng",
    floorPrefix: "Tầng",
    tableHeaders: {
      roomNumber: "Số phòng",
      floor: "Tầng",
      roomType: "Loại phòng",
      price: "Giá/đêm",
      status: "Trạng thái",
      actions: "Thao tác"
    },
    actionButtons: {
      edit: "Sửa",
      delete: "Xóa"
    }
  },
    customers: {
    title: "Quản lý Khách hàng",
    totalPrefix: "Tổng:",
    totalSuffix: "khách hàng",
    btnCreate: "+ Thêm khách hàng",
    btnExportTxt: "Xuất TXT",
    btnExportExcel: "Xuất Excel",
    statusProcessing: "Đang xử lý...",
    alertNoData: "Không có dữ liệu khách hàng nào để xuất!",
    alertError: "Có lỗi xảy ra khi tải dữ liệu!",
    loading: "Đang tải danh sách khách hàng...",
    empty: "Không tìm thấy khách hàng nào phù hợp.",
    searchPlaceholder: "Tìm theo tên...",
    btnSearch: "Tìm",
    btnClearSearch: "Xóa tìm kiếm",
    errorDefault: "Có lỗi xảy ra",
    deleteTitle: "Xác nhận xóa",
    deleteDesc: "Bạn có chắc muốn xóa khách hàng này không?",
    deleteCancel: "Hủy",
    deleteConfirm: "Xóa",
    loyaltyPoints: "Điểm tích lũy",

    // BỔ SUNG KHỐI NÀY VÀO TRONG CUSTOMERS
    tableHeaders: {
      fullName: "Họ tên",
      phone: "Số điện thoại",
      email: "Email",
      actions: "Thao tác"
    },

    excelHeaders: {
      stt: "STT",
      customerId: "Mã Khách Hàng",
      fullName: "Họ và Tên",
      phone: "Số Điện Thoại",
      email: "Email"
    },
    txtHeaders: {
      customerId: "Mã KH",
      fullName: "Họ và Tên",
      phone: "Số điện thoại",
      email: "Email"
    },
    modal: {
      createTitle: "Thêm khách hàng",
      editTitle: "Sửa: {name}",
      labelFullName: "Họ tên",
      labelPhone: "Số điện thoại",
      labelEmail: "Email",
      saving: "Đang lưu...",
      btnSave: "Lưu",
      btnUpdate: "Cập nhật"
    }
  }

};

export default vi;