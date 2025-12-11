import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as moment from 'moment-timezone';
import { AppService } from '../app.service';

@Injectable()
export class BatchService {
    private readonly logger = new Logger(BatchService.name);

    constructor(private readonly appService: AppService) {};

    // @Cron('0 10 0 * * *') //Daily 00:10
    async addDailyRightsHolder() {
        const now = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
        this.logger.log(`addDailyRightsHolder Batch Start : ${now} (KST)`);


        await this.appService.addDailyRightsHolder();
    }


    // @Cron('0 5 0 * * *') //Daily 00:05
    async addDailyMemberSnap() {
        const now = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
        const date = moment().tz('Asia/Seoul').subtract(1, 'day').format('YYYYMMDD');
        this.logger.log(`addDailyMemberSnap Batch Start : ${now} (KST)`);
        await this.appService.addDailyMemberSnap(date);
    }

    // @Cron('0 5 0 * * *') //Daily 00:05
    async addDailyTransactionSnap() {
        const now = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
        const date = moment().tz('Asia/Seoul').subtract(1, 'day').format('YYYYMMDD');
        this.logger.log(`addDailyTransactionSnap Batch Start : ${now} (KST)`);
        await this.appService.addDailyTransactionSnap(date);
    }

    // @Cron('0 5 0 * * *') //Daily 00:05
    async addDailyRoyaltySnap() {
        const now = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
        const date = moment().tz('Asia/Seoul').subtract(1, 'day').format('YYYYMMDD');
        this.logger.log(`addDailyRoyaltySnap Batch Start : ${now} (KST)`);
        await this.appService.addDailyRoyaltySnap(date);
    }

    // @Cron('0 30 10 * * *') //Daily 10:30
    async addDailySongUpdate() {
        const now = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
        this.logger.log(`addDailySongUpdate Batch Start : ${now} (KST)`);
        await this.appService.addPaykhanMusicWorkInfo();
    }
}