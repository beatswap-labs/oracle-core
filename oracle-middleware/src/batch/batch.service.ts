import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment-timezone';
import { CanisterService } from '../service/canister.service';
import { AppService } from '../app.service';
import * as httpMocks from 'node-mocks-http';
import { EventEmitter } from 'stream';



const web3Router = require('../web3/web.js').default;

interface rightHolderReq {
            neighboring_token_address: string;
            neighboring_holder_staked_address: string;
            staked_amount: string;
            verification_date: string;
            neighboring_holder_staked_mainnet: string;
        };

@Injectable()
export class BatchService {

    constructor(private configService: ConfigService, private canisterService: CanisterService, private appService: AppService) {}
    private readonly logger = new Logger(BatchService.name);

    async addDailyRightsHolder() {
        const OWNER_KEY = this.configService.get<string>('OWNER_KEY');

        if(!OWNER_KEY){
            this.logger.error('Cannot find OWNER_KEY');
            throw new Error('Cannot find OWNER_KEY');
        }

        const musicInfo = await this.canisterService.oracleActor.getMusicWorkInfos();
        const now = moment().tz('Asia/Seoul');

        for(let i = 0; i < musicInfo.length; i++) {
            this.logger.log(`musicInfo length ${musicInfo[i].idx}`);
            const data = await this.requestHolderRetry(web3Router, musicInfo, i);
            if (!data) {
                continue;
            }

            const reqData: rightHolderReq[] = [];

            for(let j = 0; j < data.length; j++) {
                reqData.push({ neighboring_token_address: musicInfo[i].op_neighboring_token_address, neighboring_holder_staked_address: data[j].userMetaId, staked_amount: data[j].userStakingAmount.toString(), verification_date: now.add(1,'day').format('YYYY-MM-DD'), neighboring_holder_staked_mainnet: 'Optimism'})
            }
            
            try {
                this.logger.log(`addRightsHolder reqData ::: ${JSON.stringify(reqData)}`);
                const res = await this.canisterService.holderActor.addDailyRightsHoldersData(OWNER_KEY, JSON.stringify(reqData));
                this.logger.log('reponse ::',res);
            } catch (err) {
                this.logger.error(`addDailyRightsHolder rate ::: ${JSON.stringify(reqData)}`, err.message);
            }
        }
    }
    

    async addDailyTransactionSnap(date: string, cnt: number = 0) {
        const OWNER_KEY = this.configService.get<string>('OWNER_KEY');

        if(!OWNER_KEY){
            this.logger.error('Cannot find OWNER_KEY');
            throw new Error('Cannot find OWNER_KEY');
        }

        const dailyTransactionCnt = await this.appService.getTotalTransactionScan();
        const transactionSnapTotal = await this.canisterService.memberSnapActor.getMonthlyTransactionSnapsWithTotal("20");

        cnt = Number(dailyTransactionCnt.totalTransaction) - Number(transactionSnapTotal.total);
        this.logger.log(`addDailyTransactionSnap cnt ::: ${cnt}`);
        const res = await this.canisterService.memberSnapActor.addDailyTransactionSnap(OWNER_KEY, date, cnt);
        this.logger.log('reponse ::',res);
    }

    async addDailyMemberSnap(date: string, cnt: number = 0) {
        const OWNER_KEY = this.configService.get<string>('OWNER_KEY');

        if(!OWNER_KEY){
            this.logger.error('Cannot find OWNER_KEY');
            throw new Error('Cannot find OWNER_KEY');
        }
        const memberTotalCount = await this.appService.getRWAContributors();
        const memberSnapTotal = await this.canisterService.memberSnapActor.getMonthlyMemberSnapsWithTotal("20");

        cnt = Number(memberTotalCount) - Number(memberSnapTotal.total);
        this.logger.log(`addDailyMemberSnap cnt ::: ${cnt}`);
        const res = await this.canisterService.memberSnapActor.addDailyMemberSnap(OWNER_KEY, date, cnt);
        this.logger.log('reponse ::',res);
    }

    async addDailyRoyaltySnap(date: string, cnt: number = 0) {
        const OWNER_KEY = this.configService.get<string>('OWNER_KEY');

        if(!OWNER_KEY){
            this.logger.error('Cannot find OWNER_KEY');
            throw new Error('Cannot find OWNER_KEY');
        }   

        const dailyTotalRoyalty = await this.appService.getTotalSupply();
        const royaltySnapTotal = await this.canisterService.memberSnapActor.getMonthlyRoyaltySnapsWithTotal("20"); 

        cnt = Number(dailyTotalRoyalty.totalSupplyByDoller) - Number(royaltySnapTotal.total);
        this.logger.log(`addDailyRoyaltySnap cnt ::: ${cnt}`);
        const res = await this.canisterService.memberSnapActor.addDailyRoyaltySnap(OWNER_KEY, date, cnt);
        this.logger.log('reponse ::',res);
    }

    async addPaykhanMusicWorkInfo(): Promise<any> {
        const OWNER_KEY = this.configService.get<string>('OWNER_KEY');
        const paykhanSongUrl = this.configService.get<string>('PAYKHAN_SONG_URL');

        if(!OWNER_KEY && !paykhanSongUrl){
            this.logger.error('Cannot find Config SET');
            throw new Error('Cannot find Config SET');
        }

        const res = await this.canisterService.oracleActor.getMusicWorkInfosByOwner(OWNER_KEY);

        const lastMusicIdx = res[0].idx;
        this.logger.log(`last idx ::: ${lastMusicIdx}`);

        const url = paykhanSongUrl!+lastMusicIdx;
       
        try {
            const response = await fetch(url);
            const data = (await response.text()).replaceAll('hanshop.s3.ap-northeast-2.amazonaws.com','resource.beatswap.io');
            if(data == '[]') {
                return {response: 'Nothing to update'};
            }
            this.logger.log(`req data ::: ${data}`);
            
            await this.canisterService.oracleActor.getMusicInfoByPaykhanData(OWNER_KEY, data);
            for(let i = 0; i < JSON.parse(data).length; i++) {
                this.logger.log(`added idx ::: ${JSON.parse(data)[i].idx}`);
                await this.appService.addRightsHolder(Number(JSON.parse(data)[i].idx));
            }   
            
        } catch(error) {
            this.logger.log(error);
        }
        return this.addPaykhanMusicWorkInfo();
    }

    async requestHolderRetry(web3Router, musicInfo, i, maxRetry = 3, delayMs = 3000) {
            for (let attempt = 1; attempt <= maxRetry; attempt++) {
                try {
                    const req = httpMocks.createRequest({
                        method: 'GET',
                        url: '/getStaker',
                        query: { contract_address: musicInfo[i].op_neighboring_token_address },
                    });
                    this.logger.log(`song contract_address ${musicInfo[i].op_neighboring_token_address}`);
    
                    const res = httpMocks.createResponse({ eventEmitter: EventEmitter });
    
                    await new Promise((resolve, reject) => {
                        res.on('end', resolve);
                        res.on('finish', resolve);
                        res.on('error', reject);
    
                        web3Router.handle(req, res, (err: any) => {
                            if (err) return reject(err);
    
                            setImmediate(() => {
                                if (!res.writableEnded) {
                                    reject(new Error('Router not Response'));
                                }
                            });
                        });
                    });
                    return res._getData();
    
                } catch (err) {
                    this.logger.error(`getStaker attempt ${attempt}/${maxRetry} failed: ${err.message}`);
    
                    if (attempt < maxRetry) {
                        // 3 seconds delay before retrying
                        await new Promise(r => setTimeout(r, delayMs));
                    } else {
                        this.logger.error(`getStaker failed after ${maxRetry} attempts. Skipping...`);
                        return null;
                    }
                }
            }
        }
}