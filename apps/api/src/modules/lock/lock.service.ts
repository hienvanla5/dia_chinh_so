import { Injectable, Inject, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DRIZZLE, DrizzleDB } from '../../database/drizzle.provider';
import { REDIS_CLIENT } from '../../common/redis/redis.provider';
import Redis from 'ioredis';
import { parcels, transactionLocks } from '../../database/schema';
import { eq, and } from 'drizzle-orm';
import {
  ParcelLegalStatus,
  TransactionLockStatus,
  TRANSACTION_LOCK_CONFIG,
  CreateTransactionLockInput,
} from '@diachinhso/shared';
import { randomUUID } from 'crypto';

@Injectable()
export class LockService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  // 1. Khóa phiên giao dịch thời gian thực (Công chứng viên / Cán bộ ngân hàng)
  async acquireLock(data: CreateTransactionLockInput, userId: string, userName: string) {
    const [parcel] = await this.db.select().from(parcels).where(eq(parcels.id, data.parcelId)).limit(1);
    if (!parcel) {
      throw new NotFoundException(`Không tìm thấy thửa đất có ID: ${data.parcelId}`);
    }

    // Kiểm tra tính sẵn sàng giao dịch
    if (parcel.legalStatus !== ParcelLegalStatus.AVAILABLE) {
      throw new ConflictException(
        `Thửa đất đang không ở trạng thái sẵn sàng giao dịch! Trạng thái hiện tại: [${parcel.legalStatus}]`,
      );
    }

    const redisKey = `${TRANSACTION_LOCK_CONFIG.REDIS_LOCK_PREFIX}${parcel.id}`;
    const ttlSeconds = (data.durationMinutes || TRANSACTION_LOCK_CONFIG.DEFAULT_TTL_MINUTES) * 60;
    const sessionToken = randomUUID();

    // Sử dụng cơ chế nguyên tử (Atomic SET NX EX) của Redis
    const acquired = await this.redis.set(redisKey, sessionToken, 'EX', ttlSeconds, 'NX');
    if (!acquired) {
      const activeLock = await this.getActiveLock(data.parcelId);
      throw new ConflictException(
        `Thửa đất đang bị khóa bởi ${activeLock?.organizationName || 'tổ chức khác'}. Phiên khóa còn hiệu lực.`,
      );
    }

    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    // Lưu phiên khóa vào cơ sở dữ liệu PostgreSQL
    const [lockRecord] = await this.db
      .insert(transactionLocks)
      .values({
        parcelId: parcel.id,
        nationalCode: parcel.nationalCode,
        lockedByUserId: userId,
        lockedByUserName: userName,
        organizationName: data.organizationName,
        sessionToken,
        status: TransactionLockStatus.ACTIVE,
        expiresAt,
        durationMinutes: data.durationMinutes,
      })
      .returning();

    // Cập nhật trạng thái thửa đất sang LOCKED
    await this.db
      .update(parcels)
      .set({ legalStatus: ParcelLegalStatus.LOCKED, updatedAt: new Date() })
      .where(eq(parcels.id, parcel.id));

    // Phát sự kiện Pub/Sub thời gian thực
    await this.redis.publish(
      TRANSACTION_LOCK_CONFIG.REDIS_PUBSUB_CHANNEL,
      JSON.stringify({
        event: 'PARCEL_LOCKED',
        parcelId: parcel.id,
        nationalCode: parcel.nationalCode,
        lockedBy: data.organizationName,
        expiresAt,
      }),
    );

    return lockRecord;
  }

  // 2. Mở khóa phiên giao dịch (Sau khi hoàn tất công chứng hoặc hủy giao dịch)
  async releaseLock(lockId: string, userId: string) {
    const [lock] = await this.db.select().from(transactionLocks).where(eq(transactionLocks.id, lockId)).limit(1);
    if (!lock) {
      throw new NotFoundException(`Không tìm thấy phiên khóa: ${lockId}`);
    }

    if (lock.status !== TransactionLockStatus.ACTIVE) {
      return lock;
    }

    // Xóa khóa trên Redis
    const redisKey = `${TRANSACTION_LOCK_CONFIG.REDIS_LOCK_PREFIX}${lock.parcelId}`;
    await this.redis.del(redisKey);

    // Cập nhật phiên khóa
    const [updatedLock] = await this.db
      .update(transactionLocks)
      .set({ status: TransactionLockStatus.RELEASED })
      .where(eq(transactionLocks.id, lockId))
      .returning();

    // Đưa trạng thái thửa đất về AVAILABLE
    await this.db
      .update(parcels)
      .set({ legalStatus: ParcelLegalStatus.AVAILABLE, updatedAt: new Date() })
      .where(eq(parcels.id, lock.parcelId));

    return updatedLock;
  }

  // 3. Tra cứu phiên khóa đang hoạt động của thửa đất
  async getActiveLock(parcelId: string) {
    const [lock] = await this.db
      .select()
      .from(transactionLocks)
      .where(and(eq(transactionLocks.parcelId, parcelId), eq(transactionLocks.status, TransactionLockStatus.ACTIVE)))
      .limit(1);
    return lock || null;
  }
}
