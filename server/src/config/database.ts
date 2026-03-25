import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mbri-website';
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 2000;

export async function connectDatabase(): Promise<void> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('✅ MongoDB 连接成功');
      return;
    } catch (error) {
      console.error(`❌ MongoDB 连接失败 (第 ${attempt}/${MAX_RETRIES} 次):`, (error as Error).message);
      if (attempt === MAX_RETRIES) {
        console.error('❌ MongoDB 连接已用尽重试次数，退出');
        process.exit(1);
      }
      console.log(`⏳ ${RETRY_DELAY_MS / 1000}s 后重试...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
}
