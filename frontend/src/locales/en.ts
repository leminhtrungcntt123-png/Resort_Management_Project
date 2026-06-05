const en = {
  language: { english: "EN", vietnamese: "VI" },
  home: {
    title: "Resort Management System",
    subtitle: "Manage rooms, bookings, services, and guest information.",
  },
  dashboard: {
    rooms: "Total Rooms",
    bookings: "Active Bookings",
    customers: "Customers",
    revenue: "Today Revenue",
  },
  charts: {
    pieTitle: "Room Type Booking Density Analysis",
    pieDesc: "Real-time statistics calculated directly from the bookings dataset",
    barTitle: "Monthly Bookings",
    barDesc: "Analysis of booking frequency over timelines",
    totalLabel: "Bookings",
    footerPie: "Data automatically synchronized from system",
    emptyData: "SQL Server currently has no booking data (Bookings empty)",
    loadingData: "Analyzing dataset...",
    thisMonth: "This month",
    monthPrefix: "Month"
  },
  // BỔ SUNG THÊM PHẦN NÀY CHO SIDEBAR EQUAL VỚI TIẾNG VIỆT
  sidebar: {
    overview: "Overview",
    operation: "Operations",
    hrFinance: "HR & Finance",
    dashboard: "Dashboard",
    rooms: "Room Map",
    bookings: "Bookings",
    customers: "Customers",
    payments: "Payments",
    employees: "Employees",
    logout: "Logout"
  },
  bookings: {
      title: "Booking Management",
      totalPrefix: "Total:",
      totalSuffix: "bookings",
      btnExportTxt: "Export TXT",
      btnExportExcel: "Export Excel",
      btnCreate: "+ New Booking",
      statusExporting: "Exporting...",
      alertNoData: "No booking data available to export!",
      alertError: "An error occurred while fetching booking data!",
      qrTitle: "Scan Payment QR",
      qrCustomer: "Customer:",
      qrCode: "Booking ID:",
      qrCancel: "Cancel",
      qrConfirm: "Confirm Scanned",
      deleteTitle: "Confirm Delete",
      deleteDesc: "Deleting this booking will reset the room status to AVAILABLE.",
      deleteCancel: "Cancel",
      deleteConfirm: "Delete",
      excelHeaders: {
        stt: "No.",
        code: "Booking ID",
        customer: "Customer Name",
        phone: "Phone Number",
        roomNumber: "Room No.",
        roomType: "Room Type",
        checkIn: "Check-in Date",
        checkOut: "Check-out Date",
        status: "Booking Status",
        method: "Payment Method",
        payStatus: "Payment Status",
        amount: "Total Amount (VND)"
      },
      txtHeaders: {
        code: "Booking ID",
        customer: "Customer",
        roomNumber: "Room No.",
        checkIn: "Check-in Date",
        checkOut: "Check-out Date",
        status: "Booking Status",
        payment: "Payment"
      },
      filter: {
        all: "All",
        pending: "Pending",
        confirmed: "Confirmed",
        checkedIn: "Checked In",
        checkedOut: "Checked Out",
        cancelled: "Cancelled"
      },
      table: {
        code: "ID",
        customer: "Customer",
        room: "Room",
        checkIn: "Check-in",
        checkOut: "Check-out",
        status: "Status",
        payment: "Payment",
        actions: "Actions",
        loading: "Loading dataset...",
        empty: "No bookings found.",
        btnCheckIn: "Check-in",
        btnCheckOut: "Check-out",
        btnDetail: "Detail",
        btnDelete: "Delete"
      },
      pagination: {
        prev: "Previous",
        next: "Next",
        pageOf: "Page {current} of {total}"
      }
  },
  rooms: {
    title: "Resort Room Map",
    subtitle: "Monitor current room status and handle quick operations.",
    btnCreate: "+ Add Room",
    loading: "Loading room list...",
    empty: "No matching rooms found.",
    filter: {
      all: "All Rooms",
      available: "Available",
      booked: "Booked",
      occupied: "Occupied",
      maintenance: "Maintenance"
    },
    card: {
      roomPrefix: "Room",
      type: "Type:",
      price: "Price:",
      status: "Status:",
      btnQuickAction: "Quick Action",
      btnDetail: "View Detail"
    },
    title: "Room Management",
    totalPrefix: "Total:",
    totalSuffix: "rooms",
    btnExportTxt: "Export TXT",
    btnExportExcel: "Export Excel",
    btnCreate: "+ Add Room",
    statusExporting: "Exporting...",
    alertNoData: "No room data available to export!",
    alertError: "An error occurred while fetching room data!",
    deleteTitle: "Confirm Delete",
    deleteDesc: "Are you sure you want to delete this room? This action cannot be undone.",
    deleteCancel: "Cancel",
    deleteConfirm: "Delete",
    errorDefault: "An error occurred",
    excelHeaders: {
      stt: "No.",
      roomNumber: "Room No.",
      floorNumber: "Floor No.",
      roomType: "Room Type Name",
      price: "Room Price / Night (VND)",
      capacity: "Capacity (Guests)",
      status: "Current Status"
    },
    txtHeaders: {
      roomNumber: "Room No.",
      floorNumber: "Floor No.",
      roomType: "Room Type",
      status: "Status",
      price: "Base Price"
    },
    allFloors: "All Floors",
    floorPrefix: "Floor",
    tableHeaders: {
      roomNumber: "Room No.",
      floor: "Floor",
      roomType: "Room Type",
      price: "Price/Night",
      status: "Status",
      actions: "Actions"
    },
    actionButtons: {
      edit: "Edit",
      delete: "Delete"
    }
  },
    customers: {
    title: "Customer Management",
    totalPrefix: "Total:",
    totalSuffix: "customers",
    btnCreate: "+ Add Customer",
    btnExportTxt: "Export TXT",
    btnExportExcel: "Export Excel",
    statusProcessing: "Processing...",
    alertNoData: "No customer data available to export!",
    alertError: "An error occurred while fetching data!",
    loading: "Loading customer list...",
    empty: "No matching customers found.",
    searchPlaceholder: "Search by name...",
    btnSearch: "Search",
    btnClearSearch: "Clear search",
    errorDefault: "An error occurred",
    deleteTitle: "Confirm Delete",
    deleteDesc: "Are you sure you want to delete this customer?",
    deleteCancel: "Cancel",
    deleteConfirm: "Delete",
    loyaltyPoints: "Loyalty Points",

    // BỔ SUNG KHỐI NÀY VÀO TRONG CUSTOMERS
    tableHeaders: {
      fullName: "Full Name",
      phone: "Phone Number",
      email: "Email",
      actions: "Actions"
    },

    excelHeaders: {
      stt: "No.",
      customerId: "Customer ID",
      fullName: "Full Name",
      phone: "Phone Number",
      email: "Email"
    },
    txtHeaders: {
      customerId: "Customer ID",
      fullName: "Full Name",
      phone: "Phone Number",
      email: "Email"
    },
    modal: {
      createTitle: "Add Customer",
      editTitle: "Edit: {name}",
      labelFullName: "Full Name",
      labelPhone: "Phone Number",
      labelEmail: "Email",
      saving: "Saving...",
      btnSave: "Save",
      btnUpdate: "Update"
    },
    actionButtons: {
    edit: "Edit",
    delete: "Delete"
  }
  }
};

export default en;