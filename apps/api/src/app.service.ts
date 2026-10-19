import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getSystemStatus() {
    return {
      name: 'Địa Chính Số API Engine',
      version: '1.0.0',
      status: 'HEALTHY',
      timestamp: new Date().toISOString(),
      standards: [
        'Luật Đất đai 2024',
        'Hệ quy chiếu VN-2000',
        'Cơ chế Khóa giao dịch thời gian thực (Atomic Lock 90m)',
        'Định danh thửa đất quốc gia chuẩn hóa',
      ],
    };
  }
}
