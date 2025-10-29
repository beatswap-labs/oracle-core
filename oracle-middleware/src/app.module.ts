import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { BeatSwapController } from './beatswap.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { BatchService } from './batch/batch.service';
import { TelegramService } from './telegram/telegram.service';
import { MintService } from './service/mint.service';
import { CanisterService } from './service/canister.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController, BeatSwapController],
  providers: [BatchService, AppService, TelegramService, CanisterService, MintService],
})
export class AppModule {}
