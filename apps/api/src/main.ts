import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cấu hình CORS cho Frontend Next.js
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Đặt tiền tố API chuẩn v1
  app.setGlobalPrefix('api/v1');

  // Khởi tạo tài liệu Swagger OpenAPI
  const config = new DocumentBuilder()
    .setTitle('ĐỊA CHÍNH SỐ - Sổ Đỏ Số & Cơ Sở Dữ Liệu Thửa Đất Thời Gian Thực')
    .setDescription(
      'Hệ thống quản lý thông tin địa chính, vòng đời thửa đất, khóa giao dịch phòng ngừa rủi ro và dịch vụ công đất đai trực tuyến.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 [Địa Chính Số] Backend API đang chạy tại: http://localhost:${port}/api/v1`);
  console.log(`📑 [Địa Chính Số] Swagger API Docs sẵn sàng tại: http://localhost:${port}/api/docs`);
}

bootstrap();
