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
  // BỔ SUNG THÊM ĐOẠN NÀY
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
};

export default vi;