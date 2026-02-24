import { Module } from '@nestjs/common';
import { MigrationController } from './migration.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { BatchSchedule } from './batch/batch.shedule';
import { BatchService } from './batch/batch.service';
import { CanisterService } from './service/canister.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [MigrationController],
  providers: [BatchSchedule, BatchService, AppService, CanisterService],
})
export class AppModule {}
