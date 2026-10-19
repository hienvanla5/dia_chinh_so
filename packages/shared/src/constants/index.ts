// Hệ quy chiếu tọa độ quốc gia VN-2000
export const VN2000_PROJECTION = {
  SRID_WGS84: 4326,
  SRID_VN2000_DEFAULT: 3405, // Phổ biến khu vực miền Bắc / Toàn quốc kinh tuyến trục 105
  SRID_VN2000_HANOI: 9210,   // Hà Nội ktt 105 độ 3 độ
  SRID_VN2000_HCM: 9214,     // TP.HCM ktt 105 độ 45' 3 độ
  SRID_VN2000_DANANG: 9211,  // Đà Nẵng ktt 107 độ 45' 3 độ
};

// Cấu hình thời gian khóa giao dịch (Transaction Lock)
export const TRANSACTION_LOCK_CONFIG = {
  DEFAULT_TTL_MINUTES: 90,     // 90 phút theo chuẩn phiên công chứng
  MIN_TTL_MINUTES: 15,
  MAX_TTL_MINUTES: 180,
  REDIS_LOCK_PREFIX: 'diachinhso:lock:parcel:',
  REDIS_PUBSUB_CHANNEL: 'diachinhso:events:parcel_locked',
};

// SLA thời gian xử lý hồ sơ dịch vụ công trực tuyến (Số ngày làm việc)
export const DOSSIER_SLA_DAYS = {
  TRANSFER: 10,       // Đăng ký chuyển nhượng quyền sử dụng đất
  SUBDIVISION: 15,    // Tách thửa / hợp thửa
  MORTGAGE: 1,        // Đăng ký thế chấp (xử lý ngay trong ngày)
  PURPOSE_CHANGE: 15, // Chuyển mục đích sử dụng đất
};

// Metadata các vai trò người dùng trong hệ thống
export const ROLE_METADATA = {
  COMMUNE_OFFICER: {
    code: 'VT-01',
    name: 'Cán bộ Địa chính xã/phường',
    description: 'Tiếp nhận hồ sơ hiện trạng, đo đạc và xác minh ranh giới thửa đất tại thực địa',
  },
  LAND_REGISTRAR: {
    code: 'VT-02',
    name: 'Văn phòng Đăng ký Đất đai',
    description: 'Thẩm định biến động, cấp đổi/cấp mới Giấy chứng nhận quyền sử dụng đất số',
  },
  LAND_USER: {
    code: 'VT-03',
    name: 'Chủ sử dụng đất (Dân/DN)',
    description: 'Tra cứu thông tin quy hoạch, xem sổ đỏ số, nộp hồ sơ biến động trực tuyến',
  },
  NOTARY_BANK: {
    code: 'VT-04',
    name: 'Công chứng viên & Cán bộ Tín dụng',
    description: 'Kiểm tra pháp lý thời gian thực, khóa phiên giao dịch, đăng ký thế chấp bảo đảm',
  },
  INSPECTOR: {
    code: 'VT-05',
    name: 'Thanh tra & Quản lý Quy hoạch',
    description: 'Giám sát biến động mục đích sử dụng, cảnh báo vi phạm trật tự xây dựng & lấn chiếm',
  },
  ADMIN: {
    code: 'VT-06',
    name: 'Quản trị viên Hệ thống',
    description: 'Quản trị phân quyền, cấu hình hệ quy chiếu VN-2000, kiểm toán hệ thống',
  },
};
