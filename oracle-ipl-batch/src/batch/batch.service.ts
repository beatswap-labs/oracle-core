import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment-timezone';
import { CanisterService } from '../service/canister.service';
import { AppService } from '../app.service';
import * as httpMocks from 'node-mocks-http';
import { EventEmitter } from 'stream';
import axios from 'axios';



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
        const verificationDate = now.clone().add(1, 'day');

        for(let i = 0; i < musicInfo.length; i++) {
            this.logger.log(`musicInfo length ${musicInfo[i].idx}`);
            const data = await this.requestHolderRetry(web3Router, musicInfo, i);
            if (!data) {
                continue;
            }

            const reqData: rightHolderReq[] = [];

            for(let j = 0; j < data.length; j++) {
                reqData.push({ neighboring_token_address: musicInfo[i].op_neighboring_token_address, neighboring_holder_staked_address: data[j].userMetaId, staked_amount: data[j].userStakingAmount.toString(), verification_date: verificationDate.format('YYYY-MM-DD'), neighboring_holder_staked_mainnet: 'Optimism'})
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


    async updatePending() {
        const TON_PURCHASE_URL = this.configService.get<string>('TON_PURCHASE_URL') || '';
        const KAIA_PURCHASE_URL = this.configService.get<string>('KAIA_PURCHASE_URL') || '';
        const TON_PENDING_URL = this.configService.get<string>('TON_PENDING_URL') || '';
        const KAIA_PENDING_URL = this.configService.get<string>('KAIA_PENDING_URL') || '';
        let res;
        
        const partnerIdxList = [2, 3]; // 2: TON, 3: KAIA

        const now = moment().utc();
        const hanPrice = await this.appService.getHanPrice();
        const exchangeUSD = await this.appService.getExchangeUSD();
        this.logger.log(`hanPrice ::: ${hanPrice}`);
        this.logger.log(`exchangeUSD ::: ${exchangeUSD}`);
        
        try {
            const hanKRW = this.appService.roundTo(hanPrice * exchangeUSD,18);
            this.logger.log(`hanKRW ::: ${hanKRW}`);
            const miniRoyalty = 70/hanKRW;
            this.logger.log(`miniRoyalty :: ${miniRoyalty}`);
            let resData: any;
            for (const partnerIdx of partnerIdxList) {
                if(partnerIdx === 2) {
                    resData = await axios.get(TON_PURCHASE_URL);
                    resData = resData.data.data;
                    if(resData.length === 0) {
                        this.logger.log('Nothing to update Ton');
                        continue;
                    }
                } else if(partnerIdx === 3){
                    resData = await axios.get(KAIA_PURCHASE_URL);
                    resData = resData.data.data;
                    if(resData.length === 0) {
                        this.logger.log('Nothing to update Kaia');
                        continue;
                    }
                }
                for(let idx = 0; idx < resData.length; idx ++) {
                    const list = await this.canisterService.oracleActor.getMusicContractAddress();
                    const jsonList = JSON.parse(list);

                    this.logger.log(resData[idx].tune_idx);
                    const addressList: any[] = [];

                    jsonList.filter(item => item.idx === resData[idx].tune_idx && item.contract)
                            .forEach(item => addressList.push(item.contract));
                        
                    this.logger.log("addressList", addressList);
                    
                    const stakerInfo = await this.canisterService.holderActor.getDailyRightsHoldersByYMD_List(addressList,  now.format('YYYYMMDD'));
            
                    
                    for(let i = 0; i < stakerInfo.length; i++) {
                        const ratio = this.appService.roundTo((Number(stakerInfo[i].staked_amount)/2000)*100, 2);
                        const idxListFromContracts = jsonList.find(item => item.contract === stakerInfo[i].neighboring_token_address)?.idx || null;
                        Object.assign(stakerInfo[i], {"idx": `${Number(idxListFromContracts)}`});
                        Object.assign(stakerInfo[i], {"neighboring_holder_staked_address": `${stakerInfo[i].neighboring_holder_staked_address}`});
                        Object.assign(stakerInfo[i], {"ratio": `${ratio}%`});
                    }
                
                    this.logger.log(`tonData ${JSON.stringify(resData[idx])}`);
                    const id = resData[idx].id.replace(/[^a-zA-Z0-9._@-]/g, 'd');
                    


                    res = stakerInfo     
                            .map(item => {
                            let amount = 0;
                            let krw = 0;

                            const subIdx = resData[idx].purchase_sub_idx;
                            
                            if(partnerIdx === 2 || partnerIdx === 3) {
                                amount = this.appService.roundTo(miniRoyalty * (Number(item.ratio.replace('%','')/100)), 18);
                                krw = this.appService.roundTo((miniRoyalty * hanKRW) * Number(item.ratio.replace('%','')/100), 2);
                            }
                            console.log("subIdx :: ", subIdx);
                            return {
                                buyer_id: id,
                                idx: Number(item.idx),
                                purchase_sub_idx: subIdx,
                                owner_address: item.neighboring_holder_staked_address,
                                amount: amount.toString(),
                                krw: krw.toString()
                        };
                    }); 
            
                    console.log("result :: ", JSON.stringify(res, null, 2));


                    if(partnerIdx === 2) {
                        const response =axios.post(TON_PENDING_URL, {
                            royaltyDataArray: res                
                        }).then(response => {
                            this.logger.log(`Response: ${JSON.stringify(response.data)}`);
                        }).catch(error => {
                            this.logger.error(`Error: ${error.message}`);
                        });  
                        this.logger.log(`ton response :: ${JSON.stringify(response)}`);

                        await new Promise(resolve => setTimeout(resolve, 3000));
                    } else if (partnerIdx === 3) {
                        const response =axios.post(KAIA_PENDING_URL, {
                            royaltyDataArray: res                
                        }).then(response => {
                            this.logger.log(`Response: ${JSON.stringify(response.data)}`);
                        }).catch(error => {
                            this.logger.error(`Error: ${error.message}`);
                        });  
                        this.logger.log(`kaia response :: ${JSON.stringify(response)}`);
                    }
                }
            }
        } catch (error) {
            this.logger.log(error);
        }
    }
}