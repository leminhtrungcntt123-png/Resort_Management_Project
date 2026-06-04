import * as XLSX from 'xlsx';

/**
 * Hàm xuất dữ liệu ra file .TXT
 * @param data Mảng dữ liệu gốc
 * @param title Tiêu đề nằm ở đầu file TXT
 * @param fileName Tên file khi tải về (không cần ghi đuôi .txt)
 */
export const exportToTxt = (data: any[], title: string, fileName: string) => {
  let textContent = `${title.toUpperCase()}\n`;
  textContent += "====================================\n\n";

  data.forEach((item, index) => {
    textContent += `[Mục số: ${index + 1}]\n`;
    Object.keys(item).forEach((key) => {
      // Tự động duyệt qua tất cả các trường dữ liệu
      textContent += `${key}: ${item[key]}\n`;
    });
    textContent += "------------------------------------\n";
  });

  // Tạo file blob hỗ trợ tiếng Việt không bị lỗi font (utf-8)
  const blob = new Blob([textContent], { type: "text/plain;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${fileName}.txt`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Hàm xuất dữ liệu ra file Excel (.xlsx)
 * @param formattedData Mảng dữ liệu ĐÃ ĐƯỢC ĐỔI TÊN CỘT THÀNH TIẾNG VIỆT
 * @param sheetName Tên của tab sheet trong Excel
 * @param fileName Tên file khi tải về (không cần ghi đuôi .xlsx)
 */
export const exportToExcel = (formattedData: any[], sheetName: string, fileName: string) => {
  // Chuyển đổi dữ liệu JSON thành một Worksheet
  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  // Tạo một Workbook mới (file excel trống)
  const workbook = XLSX.utils.book_new();
  // Nối worksheet vào workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  // Tiến hành tải file về máy
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};