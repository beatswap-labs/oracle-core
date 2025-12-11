import { Injectable, Logger } from '@nestjs/common';
import { Principal } from "@dfinity/principal";
import { ConfigService } from '@nestjs/config';
import { TelegramService } from './telegram/telegram.service';
import * as httpMocks from 'node-mocks-http';
import { EventEmitter } from 'stream';
import * as moment from 'moment-timezone';
import axios from 'axios';
import { oracleDto } from './dto/oracleDto.js';
import { exec } from "child_process";
import * as zlib from 'zlib';
import { CanisterService } from './service/canister.service';
import * as util from 'util';
import { ethers } from 'ethers';



const web3Router = require('./web3/web.js').default;

const gnere = {
            1:'K-Pop',
            2:'R&B',
            3:'Trot',
            4:'City-Pop',
            5:'Ballad',
            6:'Jazz',
            7:'Hip Hop',
            8:'Indy',
            9:'Rock',
            10:'CCM',
            11:'Alternatvie Pop',
            12:'Chillwave/R&B',
            13:'House',
            14:'EDM',
            15:'Band',
            16:'Tropical House',
            17:'Medium',
            18:'Pop',
            19:'Chill',
            20:'Alternative R&B',
            21:'Jazz Pop',
            22:'Modern Rock',
            23:'Disco Pop',
            24:'Neo Soul',
            25:'CAROL',
            26:'Slap House',
            27:'Crossover',
            28:'Dream POP',
            29:'Alternative Rock',
            30:'Acoustic',
            31:'Synth pop',
            32:'Electronic K-POP',
            33:'Retro',
            34:'Soul',
            35:'Rock Ballad',
            36:'Dancehall',
            37:'Latin POP',
            38:'Trapsoul',
            39:'Reggeaton',
            40:'Trap SOUL',
            41:'Acoustic Country',
            42:'Emo Hip-Hop',
            43:'K-Pop Dance',
            44:'Dance-Punk',
            45:'Baile Funk',
            46:'UK Garage (UKG)'
        };

interface rightHolderReq {
            neighboring_token_address: string;
            neighboring_holder_staked_address: string;
            staked_amount: string;
            verification_date: string;
            neighboring_holder_staked_mainnet: string;
        };

@Injectable()
export class AppService {

    constructor(private configService: ConfigService, private telegramService: TelegramService, private canisterService: CanisterService,) {}
    private readonly logger = new Logger(AppService.name);
    

    private cachedPrice: number;
    private cachedPriceUSD: number;
    private cachedCntTotal: number;
    private cachedTotalTransaction: number;
    private cachedTotalSupply: number;
    private cachedTotalSupplyGraph: any;
    private cachedTotalTransactionGraph: any;
    private cachedRWAContributorsGragh: any;
    private cachedDashBoard: any;
    private cachedScan: any;
    private cachedMusicInfo: any;
    private cachedMusicInfoGenre: any;

    private lastFetchTime = 0;
    private lastFetchTimeUSD = 0;  
    private lastFetchTotalTime = 0;
    private lastFetchTotalTransactionTime = 0;  
    private lastFetchTotalSupplyTime = 0;
    private lastFetchTotalSupplyGraphTime = 0;
    private lastFetchTotalTransactionGraphTime = 0;
    private lastFetchRWAContributorsGraghTime = 0;  
    private lastFetchDashBoardTime = 0;
    private lastFetchScanTime = 0;
    private lastFetchMusicInfoTime = 0;
    private lastFetchMusicInfoGenreTime = 0;

    private readonly cacheDurationTotal = 4000; // 4sec
    private readonly cacheDurationMusicInfo = 10 * 1000; // 10sec
    private readonly cacheDuration = 5 * 60 * 1000; // 5min
    private readonly cacheDurationGraph = 3 * 60 * 60 * 1000; // 3hour
    private readonly cacheDurationUSD = 24 * 60 * 60 * 1000; // 1day

    async addRightsHolder(idx: number) {
        const OWNER_KEY = this.configService.get<string>('OWNER_KEY');

        if(!OWNER_KEY){
            this.logger.error('Cannot find OWNER_KEY');
            throw new Error('Cannot find OWNER_KEY');
        }
        const musicInfo = await this.canisterService.oracleActor.getMusicInfoByIdx(idx);
        const now = moment().utc();
        this.logger.log(`song contract_address ${musicInfo[0].op_neighboring_token_address}`);
        const req = httpMocks.createRequest({
            method: 'GET',
            url: '/getStaker',
            query: { contract_address: musicInfo[0].op_neighboring_token_address},
        });
        
        const res = httpMocks.createResponse({ eventEmitter: EventEmitter });

        await new Promise((resolve, reject) => {
            res.on('end', resolve);
            res.on('finish', resolve);
            res.on('error', reject);

            web3Router.handle(req, res, (err:any) => {
                if(err) return reject(err);

                setImmediate(() => {
                if(!res.writableEnded) {
                    reject(new Error('Router not Response'));
                }
                })
            })
        });
        const data = res._getData();

        const reqData: rightHolderReq[] = [];

        for(let j = 0; j < data.length; j++) {
            reqData.push({ neighboring_token_address: musicInfo[0].op_neighboring_token_address, neighboring_holder_staked_address: data[j].userMetaId, staked_amount: data[j].userStakingAmount.toString(), verification_date: now.format('YYYY-MM-DD'), neighboring_holder_staked_mainnet: 'Optimism'})
        }
        
        try {
            this.logger.log(`addRightsHolder reqData ::: ${JSON.stringify(reqData)}`);
            const res = await this.canisterService.holderActor.addDailyRightsHoldersData(OWNER_KEY, JSON.stringify(reqData));
            this.logger.log('reponse ::',res);
        } catch (err) {
            this.logger.error(`addDailyRightsHolder rate ::: ${JSON.stringify(reqData)}`, err.message);
        }
    
    }

    async addDailyRightsHolder() {
        const OWNER_KEY = this.configService.get<string>('OWNER_KEY');

        if(!OWNER_KEY){
            this.logger.error('Cannot find OWNER_KEY');
            throw new Error('Cannot find OWNER_KEY');
        }

        const musicInfo = await this.canisterService.oracleActor.getMusicWorkInfos();
        const now = moment().tz('Asia/Seoul');

        for(let i = 0; i < musicInfo.length; i++) {
            this.logger.log(`musicInfo length ${musicInfo.length}`);
            const data = await this.requestHolderRetry(web3Router, musicInfo, i, this.logger);
            if (!data) {
                continue;
            }

            const reqData: rightHolderReq[] = [];

            for(let j = 0; j < data.length; j++) {
                reqData.push({ neighboring_token_address: musicInfo[i].op_neighboring_token_address, neighboring_holder_staked_address: data[j].userMetaId, staked_amount: data[j].userStakingAmount.toString(), verification_date: now.format('YYYY-MM-DD'), neighboring_holder_staked_mainnet: 'Optimism'})
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

        const dailyTransactionCnt = await this.getTotalTransactionScan();
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
        const memberTotalCount = await this.getRWAContributors();
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

        const dailyTotalRoyalty = await this.getTotalSupply();
        const royaltySnapTotal = await this.canisterService.memberSnapActor.getMonthlyRoyaltySnapsWithTotal("20"); 

        cnt = Number(dailyTotalRoyalty.totalSupplyByDoller) - Number(royaltySnapTotal.total);
        this.logger.log(`addDailyRoyaltySnap cnt ::: ${cnt}`);
        const res = await this.canisterService.memberSnapActor.addDailyRoyaltySnap(OWNER_KEY, date, cnt);
        this.logger.log('reponse ::',res);
    }

    async addMusicInfo(): Promise<any> {
        const OWNER_KEY = this.configService.get<string>('OWNER_KEY');

        if(!OWNER_KEY){
            this.logger.error('Cannot find OWNER_KEY');
            throw new Error('Cannot find OWNER_KEY');
        }

        const res = await this.canisterService.oracleActor.getMusicInfoByPaykhan(OWNER_KEY);

        if(res === '[]') {
            this.logger.log('Nothing to update');
            return {response: 'Nothing to update'};
        }
        
        this.logger.log('reponse ::',res);

        return this.addMusicInfo();
    }



    async addUserPlayData(partnerIdx: number, id: string, musicIdx: number): Promise<any> {
        const OWNER_KEY = this.configService.get<string>('OWNER_KEY');

        if(!OWNER_KEY){
            this.logger.error('Cannot find OWNER_KEY');
            throw new Error('Cannot find OWNER_KEY');
        }

        const now = moment().utc();

        const addUserPlayDataReq = ({
            partner_idx : partnerIdx,
            user : id,
            music_idx : musicIdx,
            play_at : now.format('YYYY-MM-DD HH:mm:ss')
        });

        const res = await this.canisterService.playActor.addUserPlayData(OWNER_KEY, addUserPlayDataReq);

        if(res === '[]') {
            this.logger.log('Nothing to update');
            return {response: 'Nothing to update'};
        }
        
        this.logger.log('reponse ::',res);

        return res;
    }


    async addVerificationUnlockListPayKhan(idx: number): Promise<any> {
        const OWNER_KEY = this.configService.get<string>('OWNER_KEY');

        if(!OWNER_KEY){
            this.logger.error('Cannot find OWNER_KEY');
            throw new Error('Cannot find OWNER_KEY');
        }
        
        const res = await this.canisterService.unlockActor.getVerificationUnlockListPaykhan(idx, OWNER_KEY);

        if(res === '[]') {
            this.logger.log('Nothing to update');
            return {response: 'Nothing to update'};
        }
        
        this.logger.log('response ::',res);

        return this.addVerificationUnlockListPayKhan(idx);
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
            this.logger.log(`response url ::: ${url}`);
            
            
            // await this.canisterService.oracleActor.getMusicInfoByPaykhanData(OWNER_KEY, data);
            for(let i = 0; i < JSON.parse(data).length; i++) {
                this.logger.log(`added idx ::: ${JSON.parse(data)[i].idx}`);
                // await this.addRightsHolder(Number(JSON.parse(data)[i].idx));
            }   
            
        } catch(error) {
            this.logger.log(error);
        }
        return this.addPaykhanMusicWorkInfo();
    }

    async getUnlockCount(body: any[]): Promise<any> {

        const jsonData = Object.values(
            body.reduce((acc, cur) => {
            if(!acc[cur.idx]) {
                acc[cur.idx] = { ...cur, unlock_count: Number(cur.unlock_count) || 0 };
            } else {
                acc[cur.idx].unlock_count += Number(cur.unlock_count);
            }
            return acc;
            }, {})
        );

        return jsonData;
    }

    async getMusicWorkInfosByOwner(): Promise<any> {
        const OWNER_KEY = this.configService.get<string>('OWNER_KEY');

        if(!OWNER_KEY){
            this.logger.error('Cannot find OWNER_KEY');
            throw new Error('Cannot find OWNER_KEY');
        }

        const now = Date.now();

        if (!this.cachedMusicInfo || now - this.lastFetchMusicInfoTime > this.cacheDurationMusicInfo) {
            const musicInfo = await this.canisterService.oracleActor.getMusicWorkInfosByOwner(OWNER_KEY);
            musicInfo.forEach(item => {
                    const key = Number(item.genre_idx);
                    if (gnere[key]) {
                        item.genre_idx = gnere[key];
                    } else {
                        item.genre_idx = 'Unknown';
                    }
            });
            this.lastFetchMusicInfoTime = now;
            

            const sorted = musicInfo.sort((a,b)=> Number(a.idx) - Number(b.idx));

            this.cachedMusicInfo = sorted;
        }

        return this.cachedMusicInfo;
    }

    async getMusicWorkInfosTotalCount(): Promise<any> {
        const musicInfo = await this.canisterService.oracleActor.getMusicWorkInfos();
        this.logger.log(`total Music Count ::: ${musicInfo.length}`);


        return musicInfo.length;
    }


    async getMusicWorkInfosByGenre(genreIdx: number): Promise<any> {
        
        const now = Date.now();
        
        if (!this.cachedMusicInfoGenre || now - this.lastFetchMusicInfoGenreTime > this.cacheDurationMusicInfo) {
            const res = await this.canisterService.oracleActor.getMusicWorkInfosByGenre(genreIdx);
            this.logger.log(`genreInfo: ${res}`);
            this.lastFetchMusicInfoTime = now;
            

            const sorted = res.sort((a,b)=> Number(a.idx) - Number(b.idx));

            this.cachedMusicInfoGenre = sorted;
        }

        return this.cachedMusicInfoGenre;
    }

    async getDailyRightsHolders(address: string): Promise<any> {
        type Item = {
            neighboring_holder_staked_address: string;
            neighboring_holder_staked_mainnet: string;
            ratio: string;  
        };

        const now = moment().utc();
        const date = now.format('YYYYMMDD');

        const res = await this.canisterService.holderActor.getDailyRightsHoldersByYMD(address, date);
        let sumAmount = 0;
        
        for(let i = 0; i < res.length; i++) {
            sumAmount += Number(res[i].staked_amount);
            if(i == res.length-1){
                for(let j = res.length-1; j >= 0; j--){
                    const ratio = this.roundTo((res[j].staked_amount/sumAmount)*100, 2);
                    Object.assign(res[j], {"ratio": `${ratio}%`});
                }
            }
        }
        
        const sorted = res.sort((a,b)=> Number(b.staked_amount) - Number(a.staked_amount));

        const limit = sorted.map(({staked_amount,neighboring_token_address,verification_date, ...rest})=>rest).slice(0, 20);

        return limit;
    }

    async getUnlockInfoByAddress(address: string, year: number, month: number): Promise<any> {
        const startDate = new Date(year, month - 1, 1, 0, 0, 0);
        const startTs = startDate.getTime();

        const endDate = new Date(year, month - 1, 1, 23, 59, 59);
        const endTs = endDate.getTime();

        this.logger.log(`startTs ${startTs} endTs :: ${endTs}`);

        const res = await this.canisterService.holderActor.getTotalUnlockCountForHolderInRange(address, startTs, endTs);

        for(let i = 0; i < res.length; i++) {
            res[i] = {"idx": Number(res[i][0]), "unlockCount": Number(res[i][1])};
        }

        const sorted = res.sort((a,b)=> Number(a.idx) - Number(b.idx));

        this.logger.log(`getUnlockInfoByAddress  ${JSON.stringify(sorted)}`);

        return sorted;
    }

    async getGenres(): Promise<any> {
        const res = Object.values(gnere);
        return res;
    }

    async getTotalSupply(): Promise<any> {
        const exchangeUSD = await this.getExchangeUSD();
        const totalSupply = await this.getTotalSupplyScan();

        const totalSupplyByDoller = this.roundTo((Number(totalSupply.totalSupply)) / exchangeUSD, 0);

        return {
            totalSupply: totalSupply.totalSupply,
            totalSupplyByDoller: totalSupplyByDoller
      };
    }

    async getTotalSupplyGragh(today: Date): Promise<any> {
        let graph: { date: any; value: number }[] = [];
        this.logger.log(`getTotalSupplyGragh today ::: ${today}`);
        
        const now = Date.now();
        if (!this.cachedTotalSupplyGraph || now - this.lastFetchTotalSupplyGraphTime > this.cacheDurationGraph) {
            this.lastFetchTotalSupplyGraphTime = now;
            const arr = await this.canisterService.memberSnapActor.getMonthlyRoyaltySnapsArr("20");
            
            const dayList = Array.from({ length: arr.length }, (_, i) => {
                const d = new Date(now);
                d.setDate(d.getDate() - (arr.length - i));
                const day = d.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
                return day;
            });

            const snaps = await Promise.all(
                dayList.map((day) => this.canisterService.memberSnapActor.getDailyRoyaltySnap(day))
            );


            for (let i = 0; i < snaps.length; i++) {
                const snap = snaps[i][0];
                const date = `${snap.snap_date.slice(0, 4)}-${snap.snap_date.slice(4, 6)}-${snap.snap_date.slice(6, 8)}`;
                graph.push({ date, value: Number(snap.total_royalty) });
            }
            
            const getRangeSum = (range: number) =>
                graph.slice(-range).reduce((sum, item) => sum + item.value, 0);

            const week = getRangeSum(7);
            const month = getRangeSum(30);

            this.logger.log(`week ::: ${week} month ::: ${month}`);

            const sumGraph = graph.reduce<{ date: string; value: number }[]>((acc, item) => {
                const prev = acc.length ? acc[acc.length - 1].value : 0;
                acc.push({ date: item.date, value: prev + item.value });
                return acc;
            }, []);

            this.cachedTotalSupplyGraph = {
                week: String(week),
                month: String(month),
                gragh : sumGraph
            };
        }
        
        return this.cachedTotalSupplyGraph;
    }

    async getRWAContributorsGragh(today: Date): Promise<any> {
        let graph: { date: any; value: number }[] = [];
        this.logger.log(`getRWAContributorsGragh today ::: ${today}`);

        const now = Date.now();
        if (!this.cachedRWAContributorsGragh || now - this.lastFetchRWAContributorsGraghTime > this.cacheDurationGraph) {
            this.lastFetchRWAContributorsGraghTime = now;
            const arr = await this.canisterService.memberSnapActor.getMonthlyMemberSnapsArr("20");
            
        const dayList = Array.from({ length: arr.length }, (_, i) => {
            const d = new Date(now);
            d.setDate(d.getDate() - (arr.length - i));
            const day = d.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
            return day;
        });

        const snaps = await Promise.all(
            dayList.map((day) => this.canisterService.memberSnapActor.getDailyMemberSnap(day))
        );


        for (let i = 0; i < 6; i++) {
            const snap = snaps[i][0];
            const date = `${snap.snap_date.slice(0, 4)}-${snap.snap_date.slice(4, 6)}-${snap.snap_date.slice(6, 8)}`;
            graph.push({ date, value: Number(snap.member_count) });
        }
        
        // const getRangeSum = (range: number) =>
        //     graph.slice(-range).reduce((sum, item) => sum + item.value, 0);

        // const week = getRangeSum(7);
        // const month = getRangeSum(30);

        // this.logger.log(`week ::: ${week} month ::: ${month}`);

        const sumGraph = graph.reduce<{ date: string; value: number }[]>((acc, item) => {
            const prev = acc.length ? acc[acc.length - 1].value: 0;
            this.logger.log(`prev ::: ${prev} item.value ::: ${item.value}`);
            acc.push({ date: item.date, value: item.value });
            return acc;
        }, []);

        this.cachedRWAContributorsGragh ={
                week: "4481",
                month: "18820",
                gragh : sumGraph
            };
        }   

        return this.cachedRWAContributorsGragh;
    }


    async getTokenTransactionGragh(today: Date): Promise<any> {
        let graph: { date: any; value: number }[] = [];
        this.logger.log(`getTokenTransactionGragh today ::: ${today}`);
        
        const now = Date.now();
        if (!this.cachedTotalTransactionGraph || now - this.lastFetchTotalTransactionGraphTime > this.cacheDurationGraph) {
            this.lastFetchTotalTransactionGraphTime = now;
            const arr = await this.canisterService.memberSnapActor.getMonthlyTransactionSnapsArr("20");
            
            const dayList = Array.from({ length: arr.length }, (_, i) => {
                const d = new Date(now);
                d.setDate(d.getDate() - (arr.length - i));
                const day = d.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
                return day;
            });

            const snaps = await Promise.all(
                dayList.map((day) => this.canisterService.memberSnapActor.getDailyTransactionSnap(day))
            );


            for (let i = 0; i < snaps.length; i++) {
                const snap = snaps[i][0];
                const date = `${snap.snap_date.slice(0, 4)}-${snap.snap_date.slice(4, 6)}-${snap.snap_date.slice(6, 8)}`;
                graph.push({ date, value: Number(snap.transaction_count) });
            }
            
            const getRangeSum = (range: number) =>
                graph.slice(-range).reduce((sum, item) => sum + item.value, 0);

            const week = getRangeSum(7);
            const month = getRangeSum(30);

            this.logger.log(`week ::: ${week} month ::: ${month}`);

            const sumGraph = graph.reduce<{ date: string; value: number }[]>((acc, item) => {
                const prev = acc.length ? acc[acc.length - 1].value : 0;
                acc.push({ date: item.date, value: prev + item.value });
                return acc;
            }, []);

            this.cachedTotalTransactionGraph = {
                week: String(week),
                month: String(month),
                gragh : sumGraph
            };
        }

        return this.cachedTotalTransactionGraph;
    }
    

    async getTotalSupplyScan(): Promise<any> {

        const now = Date.now();

        if (!this.cachedTotalSupply || now - this.lastFetchTotalSupplyTime > this.cacheDurationTotal) {
            const totalSupply = await this.canisterService.tokenActor.icrc1_total_supply();
            // this.logger.log(`totalSupply: ${totalSupply }`);
            this.lastFetchTotalSupplyTime = now;

            this.cachedTotalSupply = Number(totalSupply);
        }

        return {
            totalSupply: this.cachedTotalSupply
      };
    }

    async getTotalTransactionScan(): Promise<any> {
        const GetTransactionLength = ({
                    start: 0, 
                    length: 1
            });

        const now = Date.now();

        if (!this.cachedTotalTransaction || now - this.lastFetchTotalTransactionTime > this.cacheDurationTotal) {
            const length = await this.canisterService.tokenActor.get_transactions(GetTransactionLength);
            this.logger.log(`totalTransaction: ${length.log_length}`);
            this.lastFetchTotalTransactionTime = now;

            this.cachedTotalTransaction = Number(length.log_length);
        }

        return {
            totalTransaction: this.cachedTotalTransaction
      };
    }
    
    async getTokenTransaction(type: string): Promise<any> {
        const GetTransactionLength = ({
                    start: 0, 
                    length: 1
            });
            
            
            const now = Date.now();
            
        if (!this.cachedDashBoard || now - this.lastFetchDashBoardTime > this.cacheDurationTotal) {
            const length = await this.canisterService.tokenActor.get_transactions(GetTransactionLength);
            this.logger.log(`start : ${Number(length.log_length)-20} end ${Number(length.log_length)}`);
            const GetTransactionReq = ({
                        start: Number(length.log_length)-20, 
                        length: Number(length.log_length)
                });
            const transaction = await this.canisterService.tokenActor.get_transactions(GetTransactionReq);
            const start = Number(length.log_length)-20;
    
            const transactionList = this.parseTransactions(transaction.transactions, type, start);
    
            // idx desc
            const sorted = [...transactionList].sort((a, b) => Number(b.index) - Number(a.index));
    
            const top20 = sorted.slice(0, 20);
            const newTransactions = top20 || [];
    
            const fixedSize = [
            ...newTransactions,
            ...Array(Math.max(0, 20 - newTransactions.length)).fill(null),
            ].slice(0, 20);
            
                
            this.lastFetchDashBoardTime = now;

            this.cachedDashBoard = fixedSize;
        }

        return this.cachedDashBoard;
    }

    async getTokenTransactionScan(page: number): Promise<any> {
        const GetTransactionLength = ({
            start: 0, 
            length: 1
        });
        
        const now = Date.now();
        if (!this.cachedScan || now - this.lastFetchScanTime > this.cacheDurationTotal || page !== this.cachedScan.currentPage) {
            const length = await this.canisterService.tokenActor.get_transactions(GetTransactionLength);
            const total = Number(length.log_length); // 전체 트랜잭션 수
            const startArc = Number(length.first_index);
            const type = 'scan';
            const limit = 25;
    
            // pagenation
            const totalPages = Math.ceil(total / limit);

            if (page < 1) page = 1;
            if (page > totalPages) page = totalPages;
            
            // start/end
            const end = total - (page - 1) * limit; // list idx
            const start = Math.max(end - limit, 0);
            
            const GetTransactionReq = {
                start,
                length: limit,
            };
            this.logger.log(`archive LastIdx ${startArc}`);
            this.logger.log(`page ${start}, ${end}`);
            let transactionList: any;
            if(end > startArc) {
                const transaction = await this.canisterService.tokenActor.get_transactions(GetTransactionReq);
                transactionList = this.parseTransactions(transaction.transactions, type, start);
            } else {
                const transactionArc = await this.canisterService.tokenArcActor.get_transactions(GetTransactionReq);
                transactionList = this.parseTransactions(transactionArc.transactions, type, start);
            }
            
            
            // 2. idx desc
            const sorted = [...transactionList].sort((a, b) => Number(b.index) - Number(a.index));
    
            this.logger.log(`totalTransaction: ${length.log_length}`);
            this.lastFetchScanTime = now;
            const result = {    data: sorted,
                        totalPage: totalPages,
                        currentPage: Number(page),
                        totalTransaction: total
            };
            
            this.cachedScan = result;
        }

        return this.cachedScan;
    }

    async getTokenTransactionDetail(idx: number): Promise<any> {
        const GetTransactionLength = ({
            start: 0, 
            length: 1
        });
        
        const length = await this.canisterService.tokenActor.get_transactions(GetTransactionLength);
        const startArc = Number(length.first_index);
        const type = 'scan';
        idx = Number(idx-1);
            
        const GetTransactionReq = {
            start: idx,
            length: 1,
        };
        this.logger.log(`archive LastIdx ${startArc}`);
        let transactionList: any;
        if(idx > startArc) {
            const transaction = await this.canisterService.tokenActor.get_transactions(GetTransactionReq);
            transactionList = this.parseTransactions(transaction.transactions, type, idx);
        } else {
            const transactionArc = await this.canisterService.tokenArcActor.get_transactions(GetTransactionReq);
            transactionList = this.parseTransactions(transactionArc.transactions, type, idx);
        }
        const result = { data: transactionList };

        return result;
    }

    async getRWAContributors(): Promise<string> {
        return await this.canisterService.memberActor.getMemberRowCnt();
    }

    async getPartners(): Promise<string> {
        return await this.canisterService.memberActor.getPartners();
    }

    async getIplBalance(principal: string): Promise<Number> {
        const balance = await this.canisterService.tokenActor.icrc1_balance_of({
                            owner: Principal.fromText(principal),
                            subaccount: []
                        });
        this.logger.log(`principal ${principal} balance :: ${balance}`);
        return Number(balance);
    }


    async getTotalUnlockCount(): Promise<number> {
        const OWNER_KEY = this.configService.get<string>('OWNER_KEY');

        if(!OWNER_KEY){
            this.logger.error('Cannot find OWNER_KEY');
            throw new Error('Cannot find OWNER_KEY');
        }
        this.updateTotal(OWNER_KEY);
        
        return await this.canisterService.oracleActor.getUnlockedAccumulated();
    }

    async getTotalVerificationUnlockCount(partnerIdx: number): Promise<number> {
        return await this.canisterService.unlockActor.getTotalVerificationUnlockCount(partnerIdx);
    }

    async getVerificationUnlockListsByDate(partnerIdx: number, unlockDate: string): Promise<string> {
        return await this.canisterService.unlockActor.getVerificationUnlockListsByDate(partnerIdx,unlockDate);
    }

    async getVerificationUnlockListsByDateTs(partnerIdx: number, startTs: number, endTs: number): Promise<string> {
        return await this.canisterService.unlockActor.getVerificationUnlockListsByDateTs(partnerIdx,startTs,endTs);
    }

    async addMusicWorkInfo(body: oracleDto): Promise<string> {
        const OWNER_KEY = this.configService.get<string>('OWNER_KEY');

        if(!OWNER_KEY){
            this.logger.error('Cannot find OWNER_KEY');
            throw new Error('Cannot find OWNER_KEY');
        }
        const OWNER = [OWNER_KEY];

        return await this.canisterService.oracleActor.addMusicWorkInfo(OWNER, body);
    }


    async updateMusicWorkInfo(idxList: number[], unlockCountList: number[]): Promise<any> {
        const OWNER_KEY = this.configService.get<string>('OWNER_KEY');

        
        if(!OWNER_KEY){
            this.logger.error('Cannot find OWNER_KEY');
            throw new Error('Cannot find OWNER_KEY');
        }
        const musicInfo = await this.canisterService.oracleActor.getMusicWorkInfosByOwner(OWNER_KEY);

        const OWNER = [OWNER_KEY];

        for (let i = 0; i < idxList.length; i++) {
        const idx = idxList[i];
        const unlockCount = unlockCountList[i];

        const item = musicInfo.find(mi => Number(mi.idx) === idx);

        if (!item) {
            this.logger.warn(`Music info not found for idx: ${idx}`);
            continue;
        }

        const updateBody = {
            idx: item.idx,
            musician: item.musician,
            title: item.title,
            registration_date: item.registration_date,
            lyricist: item.lyricist,
            record_label: item.record_label,
            work_type: item.work_type,
            release_date: item.release_date,
            music_publisher: item.music_publisher,
            song_thumbnail: item.song_thumbnail.replace('hanshop.s3.ap-northeast-2.amazonaws.com','resource.beatswap.io'),
            genre_idx: item.genre_idx,
            music_file_path: item.music_file_path.replace('hanshop.s3.ap-northeast-2.amazonaws.com','resource.beatswap.io'),
            op_neighboring_token_address: item.op_neighboring_token_address,
            one_min_path: item.one_min_path.replace('hanshop.s3.ap-northeast-2.amazonaws.com','resource.beatswap.io'),
            verification_status: item.verification_status,
            composer: item.composer,
            artist: item.artist,
            icp_neighboring_token_address: item.icp_neighboring_token_address,
            album_idx: item.album_idx,
            arranger: item.arranger,
            requester_principal: item.requester_principal,
            unlock_total_count: item.unlock_total_count
        }
        this.logger.log("updateBody", updateBody);
        await this.canisterService.oracleActor.updateMusicWorkInfo(OWNER, updateBody);
    }

        // await this.oracleActor.updateMusicWorkInfo(OWNER, updateBody);
        return {success: true};
    }

    async addPartner(partnerIdx: number, partnerName: string) {
        const OWNER_KEY = this.configService.get<string>('OWNER_KEY');

        if(!OWNER_KEY){
            this.logger.error('Cannot find OWNER_KEY');
            throw new Error('Cannot find OWNER_KEY');
        }


        await this.canisterService.oracleActor.addPartner(OWNER_KEY, partnerIdx, partnerName);
    }
    
    async addRequesterId(requestName: string, requestPrincipal: string, canApprove: boolean) {
        await this.canisterService.oracleActor.addRequesterId(requestName, requestPrincipal, canApprove);
    }

    async getMusicIdxInfos(idx: number): Promise<any> {
        const res = await this.canisterService.oracleActor.getMusicWorkInfos();
        
        const found = res.find(item => Number(item.idx) === idx);

            if (found) {
                this.logger.log(`address :: ${found.op_neighboring_token_address}`);
                const ratioInfo = await this.getDailyRightsHolders(found.op_neighboring_token_address);
                const ratio = ratioInfo.map(({staked_amount,neighboring_token_address,verification_date,neighboring_holder_staked_mainnet, ...rest})=>rest).slice(0, 20);
                this.logger.log(`payKhangetMusicIdxInfosRoyalty :: ${JSON.stringify(ratio)}`);
                return ratio;
            }

    }

    async addVerificationUnlockList(partnerIdx: number, idxList: any, id: string = ''): Promise<any> {
        const OWNER_KEY = this.configService.get<string>('OWNER_KEY');
        let res;

        if(!OWNER_KEY){
            this.logger.error('Cannot find OWNER_KEY');
            throw new Error('Cannot find OWNER_KEY');
        }
        const OWNER = [OWNER_KEY];
        
        const now = moment().utc();
        const tsSeconds = moment().unix();

        this.sendUnlockList(idxList, partnerIdx, id, OWNER_KEY);
        
        const hanPrice = await this.getHanPrice();
        const exchangeUSD = await this.getExchangeUSD();

        this.logger.log(`hanPrice ::: ${hanPrice}`);
        this.logger.log(`exchangeUSD ::: ${exchangeUSD}`);

        const hanKRW = this.roundTo(hanPrice * exchangeUSD,18);
        
        this.logger.log(`hanKRW ::: ${hanKRW}`);

        const payKhanRoyalty = 2560;
        const payKhanSaleRoyalty = 1280;
        const miniRoyalty = 70/hanKRW;

        this.logger.log(`payKhanRoyalty :: ${payKhanRoyalty}`);
        this.logger.log(`payKhanSaleRoyalty :: ${payKhanSaleRoyalty}`);
        this.logger.log(`miniRoyalty :: ${miniRoyalty}`);

        const list = await this.canisterService.oracleActor.getMusicContractAddress();
        
        const jsonList = JSON.parse(list);

        const addressList = idxList.map(idx=>
            jsonList.find(item => item.idx === idx).contract || null);
        
        const stakerInfo = await this.canisterService.holderActor.getDailyRightsHoldersByYMD_List(addressList,  now.format('YYYY-MM-DD'));

        this.logger.log(`stakerInfo1 :: ${JSON.stringify(stakerInfo)}`);

        for(let i = 0; i < stakerInfo.length; i++) {
            const ratio = this.roundTo((Number(stakerInfo[i].staked_amount)/2000)*100, 2);
            const idxListFromContracts = jsonList.find(item => item.contract === stakerInfo[i].neighboring_token_address)?.idx || null;
            Object.assign(stakerInfo[i], {"idx": `${Number(idxListFromContracts)}`});
            Object.assign(stakerInfo[i], {"neighboring_holder_staked_address": `${stakerInfo[i].neighboring_holder_staked_address}`});
            Object.assign(stakerInfo[i], {"ratio": `${ratio}%`});
        }

        this.logger.log(`stakerInfo2 :: ${JSON.stringify(stakerInfo)}`);
        
        const result = ( await Promise.all (
            res = stakerInfo     
                .map(item => {
                    let amount = 0;
                    let krw = 0;
                    
                    if(partnerIdx === 1) {
                        if(idxList.length >= 100) {
                            this.logger.log(`PayKhan sale!! :: ${idxList.length}`);
                            amount = this.roundTo(payKhanSaleRoyalty * (Number(item.ratio.replace('%','')/100)), 2);
                            krw = amount;
                        } else {
                            amount = this.roundTo(payKhanRoyalty * (Number(item.ratio.replace('%','')/100)), 2);
                            krw = amount;
                        }
                    } else {
                        amount = this.roundTo(miniRoyalty * (Number(item.ratio.replace('%','')/100)), 18);
                        krw = this.roundTo((miniRoyalty * hanKRW) * Number(item.ratio.replace('%','')/100), 2);
                    }

                    return {
                        buyer_id: id,
                        idx: item.idx,
                        owner_address: item.neighboring_holder_staked_address,
                        amount: amount.toString(),
                        krw: krw.toString()
                    };
                }) 
        )).flat();
        
            this.logger.log(`result :: ${JSON.stringify(result)}`);
            return res;            
    }

    async addVerificationUnlockListTK(partnerIdx: number, idxList: any, id: string = ''): Promise<any> {
        let res;
        const OWNER_KEY = this.configService.get<string>('OWNER_KEY');

        if(!OWNER_KEY){
            this.logger.error('Cannot find OWNER_KEY');
            throw new Error('Cannot find OWNER_KEY');
        }
        const OWNER = [OWNER_KEY];
        
        const now = moment().utc();
        const tsSeconds = moment().unix();
        const tuneIdxArr = idxList.map(item => item.tune_idx);
        this.logger.log(tuneIdxArr);

        this.sendUnlockList(tuneIdxArr, partnerIdx, id, OWNER_KEY);
        
        const hanPrice = await this.getHanPrice();
        const exchangeUSD = await this.getExchangeUSD();
        const hanKRW = this.roundTo(hanPrice * exchangeUSD,18);
        const miniRoyalty = 70/hanKRW;


        const list = await this.canisterService.oracleActor.getMusicContractAddress();
        
        const jsonList = JSON.parse(list);

        const addressList = tuneIdxArr.map(idx=>
            jsonList.find(item => item.idx === idx).contract || null);
        
        this.logger.log(`addressList :: ${JSON.stringify(addressList)}`);



        const stakerInfo = await this.canisterService.holderActor.getDailyRightsHoldersByYMD_List(addressList,  now.format('YYYY-MM-DD'));

        
        for(let i = 0; i < stakerInfo.length; i++) {
            const ratio = this.roundTo((Number(stakerInfo[i].staked_amount)/2000)*100, 2);
            const idxListFromContracts = jsonList.find(item => item.contract === stakerInfo[i].neighboring_token_address)?.idx || null;
            Object.assign(stakerInfo[i], {"idx": `${Number(idxListFromContracts)}`});
            Object.assign(stakerInfo[i], {"neighboring_holder_staked_address": `${stakerInfo[i].neighboring_holder_staked_address}`});
            Object.assign(stakerInfo[i], {"ratio": `${ratio}%`});
        }

        const result = ( await Promise.all (
            res = stakerInfo     
                .map(item => {
                    let amount = 0;
                    let krw = 0;

                    const subIdx = idxList.find(x => Number(x.tune_idx) === Number(item.idx))?.purchase_sub_idx;
                    
                    if(partnerIdx === 2 || partnerIdx === 3) {
                        amount = this.roundTo(miniRoyalty * (Number(item.ratio.replace('%','')/100)), 18);
                        krw = this.roundTo((miniRoyalty * hanKRW) * Number(item.ratio.replace('%','')/100), 2);
                    }

                    return {
                        buyer_id: id,
                        idx: Number(item.idx),
                        purchase_sub_idx: subIdx,
                        owner_address: item.neighboring_holder_staked_address,
                        amount: amount.toString(),
                        krw: krw.toString()
                    };
                }) 
        )).flat();
        
        const sorted = res.sort((a,b)=> Number(a.purchase_sub_idx) - Number(b.purchase_sub_idx));
        this.logger.log(`result :: ${JSON.stringify(sorted)}`);
        
        if(partnerIdx === 2) {
            const response =axios.post('https://beatapi.khans.io/tune/distribute-royalty', {
                royaltyDataArray: sorted                
            }).then(response => {
                this.logger.log(`Response: ${JSON.stringify(response.data)}`);
            }).catch(error => {
                this.logger.error(`Error: ${error.message}`);
            });  
            this.logger.log(`ton response :: ${JSON.stringify(response)}`);
        } else if (partnerIdx === 3) {
            const response =axios.post('https://beatkpi.khans.io/api/tune/distribute-royalty', {
                royaltyDataArray: sorted                
            }).then(response => {
                this.logger.log(`Response: ${JSON.stringify(response.data)}`);
            }).catch(error => {
                this.logger.error(`Error: ${error.message}`);
            });  
            this.logger.log(`kaia response :: ${JSON.stringify(response)}`);
        }


        return sorted;
    }


    async addVerificationUnlockListOra(idxList: any, principal: string = ''): Promise<any> {
        let res;
        const OWNER_KEY = this.configService.get<string>('OWNER_KEY');

        if(!OWNER_KEY){
            this.logger.error('Cannot find OWNER_KEY');
            throw new Error('Cannot find OWNER_KEY');
        }
        
        const now = moment().utc();

        this.sendUnlockListForOra(idxList, principal, OWNER_KEY);

        const songPrice = 0.08;

        const list = await this.canisterService.oracleActor.getMusicContractAddress();
        
        const jsonList = JSON.parse(list);

        const addressList = idxList.map(idx=>
            jsonList.find(item => item.idx === idx).contract || null);
        
        this.logger.log(`addressList :: ${JSON.stringify(addressList)}`);



        const stakerInfo = await this.canisterService.holderActor.getDailyRightsHoldersByYMD_List(addressList,  now.format('YYYY-MM-DD'));

        
        for(let i = 0; i < stakerInfo.length; i++) {
            const ratio = this.roundTo((Number(stakerInfo[i].staked_amount)/2000)*100, 2);
            const idxListFromContracts = jsonList.find(item => item.contract === stakerInfo[i].neighboring_token_address)?.idx || null;
            Object.assign(stakerInfo[i], {"idx": `${Number(idxListFromContracts)}`});
            Object.assign(stakerInfo[i], {"neighboring_holder_staked_address": `${stakerInfo[i].neighboring_holder_staked_address}`});
            Object.assign(stakerInfo[i], {"ratio": `${ratio}%`});
        }

        const result = ( await Promise.all (
            res = stakerInfo     
                .map(item => {
                    const amount = songPrice * (Number(item.ratio.replace('%','')/100))
                    
                    const weiAmount = ethers.parseEther(amount.toString());

                    return {
                        idx: Number(item.idx),
                        owner_address: item.neighboring_holder_staked_address,
                        amount: weiAmount,
                    };
                }) 
        )).flat();
    

        return result;
    }

    async updateTotal(owner: string): Promise<number> {
        const now = Date.now();

        if (!this.cachedCntTotal || now - this.lastFetchTotalTime > this.cacheDurationTotal) {
            const oracleRow = await this.canisterService.trafficActor.getOracleDataRowCnt();
            const oracleRow2 = await this.canisterService.traffic2Actor.getOracleDataRowCnt2();

            const total = oracleRow+oracleRow2;

            this.logger.log(`oracleRow2: ${oracleRow2}`);
            this.lastFetchTotalTime = now;
            
            const res = await this.canisterService.oracleActor.updateUnlockedAccumulated(owner, total);
            this.cachedCntTotal = total;
            this.logger.log(`unlockCount: ${oracleRow+oracleRow2} :: ${res}`);
        }

        return this.cachedCntTotal;
    }
    

    async getHanPrice(): Promise<number> {
        const now = Date.now();

        if (!this.cachedPrice || now - this.lastFetchTime > this.cacheDuration) {
            const res = await axios.get("https://scan.khans.io/trade/hanAveragePrice");
            this.cachedPrice = res.data;
            this.lastFetchTime = now;
            this.logger.log(`API → New HAN price: ${this.cachedPrice}`);
        }

        return this.cachedPrice;
    }

    async getExchangeUSD(): Promise<number> {
        const now = Date.now();

        if (!this.cachedPriceUSD || now - this.lastFetchTimeUSD > this.cacheDurationUSD) {
            const res = await axios.get("https://search.naver.com/p/csearch/content/qapirender.nhn?key=calculator&pkid=141&q=%ED%99%98%EC%9C%A8&where=m&u1=keb&u6=standardUnit&u7=0&u3=USD&u4=KRW&u8=down&u2=1");
            this.cachedPriceUSD = res.data.country[1].value.replace(',','');
            this.lastFetchTimeUSD = now;
            this.logger.log(`API → USD: ${this.cachedPriceUSD}`);
        }

        return this.cachedPriceUSD;
    }
    
    async addPrincipal(id: any, partnerIdx: number) {
        const OWNER_KEY = this.configService.get<string>('OWNER_KEY');

        if(!OWNER_KEY){
            this.logger.error('Cannot find OWNER_KEY');
            throw new Error('Cannot find OWNER_KEY');
        }

        const now = moment().utc();

        try {
            id = id.toString().replace(/[^a-zA-Z0-9._@-]/g, 'd');
            const principalCheck = await this.canisterService.memberActor.getMemberByPartnerIdxAndUser(partnerIdx, id);
            if(principalCheck.length > 0) {
                this.logger.log('This member already exists.');
                return { response: 'This member already exists.'};
            }

            // identity
            await this.runDfxCommand(`identity new ${id} --storage-mode=plaintext`);
            // identity list
            await this.runDfxCommand(`identity use ${id}`);
            // principal
            const principal = await this.runDfxCommand("identity get-principal");

            const members = ({
                                idx: 0,
                                principle: principal,
                                partner_idx: partnerIdx,
                                user: id,
                                created_at: now.format('YYYY-MM-DD HH:mm:ss'),
                            });
            
            const stakerInfo = await this.canisterService.memberActor.addMember(OWNER_KEY, members)


            return stakerInfo;
        } catch (err) {
            console.error("Error:", err);
        }

    }


    async iplMint(id: string, partnerIdx: number, mintType: string, amount: number) {
        const OWNER_KEY = this.configService.get<string>('OWNER_KEY');

        if(!OWNER_KEY){
            this.logger.error('Cannot find OWNER_KEY');
            throw new Error('Cannot find OWNER_KEY');
        }

        const now = moment().unix();
        
        try {

            if(partnerIdx === 4) {
                partnerIdx = 1; // ton
                const resId = await axios.get(`https://paykhan.org/nftAudio/getPaykhanIdByAddress?address=${id}`);
                id = resId.data.replace(/[^a-zA-Z0-9._@-]/g, 'd');
                if(id === '' || id === null) {
                    id = "kadmin2";
                    this.logger.log(`No paykhan id replace admin -> ${id}`);
                }
                this.logger.log(`paykhan id ${id}`);
            }

            let principal: any;
            if(partnerIdx === 2 || partnerIdx === 3){
                principal = await this.canisterService.memberActor.getMemberByPartnerIdxAndUser(partnerIdx, id);
                if(principal[0] === undefined){
                    if(partnerIdx === 2) {
                        principal = await this.canisterService.memberActor.getMemberByPartnerIdxAndUser(5, id);
                    } else if ( partnerIdx === 3) {
                        principal = await this.canisterService.memberActor.getMemberByPartnerIdxAndUser(6, id);
                    }
                }
            }
            
            this.logger.log(principal[0].principle);
            const encoder = new TextEncoder();
            const nowMs = Date.now(); 

            const nowNs = BigInt(nowMs) * 1_000_000n;
            let memo: Uint8Array;
            if(mintType === 'Royalty') {
                memo = encoder.encode("RoyaltyReward");
            } else if(mintType === 'Stream') {
                memo = encoder.encode("StreamReward");
            } else if(mintType === 'Unlock') {
                memo = encoder.encode("UnlockReward");
                if(amount === 70) amount = 100;
            } else {
                memo = encoder.encode("BonusReward");
            }

            const userPrincipal = Principal.fromText(principal[0].principle);

            this.logger.log(`userPrincipal :: ${userPrincipal.toText()}`);
            const stakerInfo = await this.canisterService.mintActor.mintForUser(OWNER_KEY, userPrincipal, Math.floor(amount), [memo], [nowNs])
            
            return stakerInfo;

        } catch (err) {
            console.error(`Error: id ::: ${id} ${err}`);
            return { error: 'Minting failed' };
        }

    }
                            
    async updatePending(partnerIdx: number) {
        const OWNER_KEY = this.configService.get<string>('OWNER_KEY');
        let res;
        
        const now = moment().utc();
        const hanPrice = await this.getHanPrice();
        const exchangeUSD = await this.getExchangeUSD();
        this.logger.log(`hanPrice ::: ${hanPrice}`);
        this.logger.log(`exchangeUSD ::: ${exchangeUSD}`);
        
        try {
            const hanKRW = this.roundTo(hanPrice * exchangeUSD,18);
            this.logger.log(`hanKRW ::: ${hanKRW}`);
            const miniRoyalty = 70/hanKRW;
            this.logger.log(`miniRoyalty :: ${miniRoyalty}`);
            let resData: any;
            if(partnerIdx === 2) {
                resData = await axios.get('https://beatapi.khans.io/tune/purchase');
                resData = resData.data.data;
                if(resData.data === '[]') {
                    this.logger.log('Nothing to update');
                    return {response: 'Nothing to update'};
                }
            } else if(partnerIdx === 3){
                resData = await axios.get('https://beatkpi.khans.io/api/tune/purchase');
                resData = resData.data.data;
                if(resData.data === '[]') {
                    this.logger.log('Nothing to update');
                    return {response: 'Nothing to update'};
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
                    const ratio = this.roundTo((Number(stakerInfo[i].staked_amount)/2000)*100, 2);
                    const idxListFromContracts = jsonList.find(item => item.contract === stakerInfo[i].neighboring_token_address)?.idx || null;
                    Object.assign(stakerInfo[i], {"idx": `${Number(idxListFromContracts)}`});
                    Object.assign(stakerInfo[i], {"neighboring_holder_staked_address": `${stakerInfo[i].neighboring_holder_staked_address}`});
                    Object.assign(stakerInfo[i], {"ratio": `${ratio}%`});
                }
                
                const pending: any[] = [];
                this.logger.log(`tonData ${JSON.stringify(resData[idx])}`);
                const id = resData[idx].id.replace(/[^a-zA-Z0-9._@-]/g, 'd');
                


                res = stakerInfo     
                        .map(item => {
                        let amount = 0;
                        let krw = 0;

                        const subIdx = resData[idx].purchase_sub_idx;
                        
                        if(partnerIdx === 2 || partnerIdx === 3) {
                            amount = this.roundTo(miniRoyalty * (Number(item.ratio.replace('%','')/100)), 18);
                            krw = this.roundTo((miniRoyalty * hanKRW) * Number(item.ratio.replace('%','')/100), 2);
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
                    const response =axios.post('https://beatapi.khans.io/tune/distribute-royalty', {
                        royaltyDataArray: res                
                    }).then(response => {
                        this.logger.log(`Response: ${JSON.stringify(response.data)}`);
                    }).catch(error => {
                        this.logger.error(`Error: ${error.message}`);
                    });  
                    this.logger.log(`ton response :: ${JSON.stringify(response)}`);

                    await new Promise(resolve => setTimeout(resolve, 3000));
                } else if (partnerIdx === 3) {
                    const response =axios.post('https://beatkpi.khans.io/api/tune/distribute-royalty', {
                        royaltyDataArray: res                
                    }).then(response => {
                        this.logger.log(`Response: ${JSON.stringify(response.data)}`);
                    }).catch(error => {
                        this.logger.error(`Error: ${error.message}`);
                    });  
                    this.logger.log(`kaia response :: ${JSON.stringify(response)}`);
                }
        }
        } catch (error) {
            this.logger.log(error);
        }
    }   

    
    

    async addIplMintbatch(partnerIdx: number, idx: number = 0) {
        const OWNER_KEY = this.configService.get<string>('OWNER_KEY');

            if(partnerIdx === 1) {
                

                let principal: any;
                let amount: number = 0;
                
                const response = await axios.get(`https://paykhan.org/nftAudio/getUnlockTokenPaykhan?idx=${idx}`);
                if(response.data === '[]') {
                    this.logger.log('Nothing to update');
                    return {response: 'Nothing to update'};
                }
                this.logger.log(`response ${JSON.stringify(response.data)}`);
                this.logger.log(`https://paykhan.org/nftAudio/getUnlockTokenPaykhan?idx=${idx}`);
                for(let i = 0; i < 49; i ++) {
                    try{    
                        this.logger.log(`response idx ::: ${i} ${JSON.stringify(response.data[i])}`);
                        const id = response.data[i].id.replace(/[^a-zA-Z0-9._@-]/g, 'd');
                        const principalData = await this.canisterService.memberActor.getMemberByPartnerIdxAndUser(partnerIdx, id);
                        
                        
                        principal= principalData[0].principle;
                        this.logger.log(`principal ::: ${principal}`);
                        amount= Number(response.data[i].amount);
                    
                            try {
                                const encoder = new TextEncoder();
                                const nowMs = Date.now(); 
        
                                const nowNs = BigInt(nowMs) * 1_000_000n;
                                let memo: Uint8Array;
                                
                                const userPrincipal = Principal.fromText(principal);
                                const royaltyIdList = response.data[i].royalty_id.split(',');
                                const royaltyList = response.data[i].royalty.split(',');
                                
                                memo = encoder.encode("UnlockReward");
                                
                                this.logger.log(`principal ${userPrincipal} amount ${amount}, memo ${memo}, nowNs ${nowNs}`);
                                this.logger.log(`royaltyIdList ${royaltyIdList}`); 
                                await Promise.race([
                                    this.canisterService.mintActor.mintForUser(OWNER_KEY, userPrincipal, amount, [memo], [nowNs]),
                                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout mintForUser')), 5000))]);
                                for(let idx = 0; idx < royaltyIdList.length-1; idx++) {
                                    try{
                                        const royaltyId = royaltyIdList[idx].replace(/[^a-zA-Z0-9._@-]/g, 'd');
                                        const royaltyAmount = Math.floor(amount*(Number(royaltyList[idx])/2000));
                                        const royaltyprincipalData = await this.canisterService.memberActor.getMemberByPartnerIdxAndUser(partnerIdx, royaltyId);
                                        memo = encoder.encode("RoyaltyReward");
                                        const royaltyprincipal = royaltyprincipalData[0].principle;
                                        const royaltyUserPrincipal = Principal.fromText(royaltyprincipal);
                                        const royaltyNowNs = BigInt(nowMs) * 1_000_000n;
                                        this.logger.log(`Royalty principal ${royaltyUserPrincipal} amount ${royaltyAmount}, memo ${memo}, nowNs ${royaltyNowNs}`);
                                        await Promise.race([
                                            this.canisterService.mintActor.mintForUser(OWNER_KEY, royaltyUserPrincipal, royaltyAmount, [memo], [nowNs]),
                                        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout mintForUser')), 5000))]);
                                    } catch (error) {
                                        this.logger.error(`mint: ${error} :: royaltyId ${royaltyIdList[idx]}`);
                                        continue;
                                    }
                                    
                                }
                            } catch (error) {
                                this.logger.error(`mint:`, error);
                            }
                                
                    } catch(error) {
                        this.logger.error(`error partnerIdx ${partnerIdx} idx ${i}`);   
                        continue;
                    } 

                    // this.logger.log(`partnerIdx ${res.data.partner_idx} idx ${res.data.idx}`);
                }
                // return true;
                return this.addIplMintbatch(1, idx + 49);
            } else if(partnerIdx === 2) {
            
                const max = await axios.get('https://mapi.khans.io/api/beatswap/ton/royalty-count');
                    if (idx === Number(max.data.result)) {
                        this.logger.log('Nothing to update');
                        return { response: 'Nothing to update' };
                    }
                    let principal: any;
                    let amount: number = 0;
                    for(let i = idx; i < idx + 50; i ++) {
                        if(i === 280342) {
                            this.logger.log('Nothing to update');
                            return { response: 'Nothing to update' };
                        }

                        try{    
                            const response = await axios.get(`https://mapi.khans.io/api/beatswap/ton/royalty-history?index=${i}`);
                            const responseData = response.data.result.result;
                            this.logger.log(`response idx ::: ${i} ${JSON.stringify(response.data)}`);
                            this.logger.log(`response result ::: ${JSON.stringify(response.data.result.result)}`);
                            const id = responseData.id.replace(/[^a-zA-Z0-9._@-]/g, 'd');
                            const principalData = await this.canisterService.memberActor.getMemberByPartnerIdxAndUser(partnerIdx, id);
                            
                            
                            principal= principalData[0].principle;
                            this.logger.log(`principal idx ::: ${principal}`);
                            amount= 100;
                    
                            try {
                                const encoder = new TextEncoder();
                                const nowMs = Date.now(); 
        
                                const nowNs = BigInt(nowMs) * 1_000_000n;
                                let memo: Uint8Array;
                                
                                const userPrincipal = Principal.fromText(principal);
                                const royaltyIdList = responseData.owner_ids.split(',');
                                const royaltyList = responseData.owner_rates.split(',');
                                
                                memo = encoder.encode("UnlockReward");
                                
                                this.logger.log(`principal ${userPrincipal} amount ${amount}, memo ${memo}, nowNs ${nowNs}`);
                                this.logger.log(`royaltyIdList ${royaltyIdList}`); 
                                await Promise.race([
                                    this.canisterService.mintActor.mintForUser(OWNER_KEY, userPrincipal, amount, [memo], [nowNs]),
                                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout mintForUser')), 5000))]);
                                for(let j = 0; j < royaltyIdList.length; j++) {
                                    try{
                                        const royaltyId = royaltyIdList[j].replace(/[^a-zA-Z0-9._@-]/g, 'd');
                                        const royaltyAmount = Math.floor((amount-30)*(Number(royaltyList[j])/2000));
                                        const royaltyprincipalData = await this.canisterService.memberActor.getMemberByPartnerIdxAndUser(1, royaltyId);
                                        memo = encoder.encode("RoyaltyReward");
                                        const royaltyprincipal = royaltyprincipalData[0].principle;
                                        const royaltyUserPrincipal = Principal.fromText(royaltyprincipal);
                                        const royaltyNowNs = BigInt(nowMs) * 1_000_000n;
                                        this.logger.log(`Royalty principal ${royaltyUserPrincipal} amount ${royaltyAmount}, memo ${memo}, nowNs ${royaltyNowNs}`);
                                        await Promise.race([
                                            this.canisterService.mintActor.mintForUser(OWNER_KEY, royaltyUserPrincipal, royaltyAmount, [memo], [nowNs]),
                                        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout mintForUser')), 5000))]);
                                    } catch (error) {
                                        this.logger.error(`mint: ${error} :: royaltyId ${royaltyIdList[j]}`);
                                        continue;
                                    }
                                    
                                }
                    
                            } catch (error) {
                                this.logger.error(`mint:`, error);
                            }
                        } catch(error) {
                            this.logger.error(`error partnerIdx ${partnerIdx} idx ${i}`);   
                            continue;
                        }
                    }
                    return this.addIplMintbatch(2, idx + 50);
        }
    }

    roundTo(num:number, digits: number) {
        const factor = Math.pow(10, digits);
        return Math.round(num*factor)/ factor;
    }

    
    private async resolveDfx(): Promise<string> {
        return await new Promise((resolve, reject) => {
            exec('command -v dfx', (err, stdout) => {
            if (err) return reject(new Error('dfx not found in PATH'));
            resolve(stdout.toString().trim());
            });
        });
    }

    runDfxCommand(cmd: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
            const dfxBin = await this.resolveDfx();
            exec(`${dfxBin} ${cmd}`, (error, stdout, stderr) => {
                if (error) return reject(error);
                resolve((stdout + stderr).trim());
            });
            } catch (e) { reject(e); }
        });
    }
    
    private readonly ALPHABET = 'abcdefghijklmnopqrstuvwxyz234567';
    parseTransactions(transactions: any[], type: string, idx: number = 1) {
        // CRC32
        const crc32 = (buf: Buffer): number => {
        return zlib.crc32(buf) >>> 0;
        };

        // base32 encoding
        const base32Encode = (data: Buffer): string => {
        let bits = 0;
        let value = 0;
        let output = '';
        for (const b of data) {
            value = (value << 8) | b;
            bits += 8;
            while (bits >= 5) {
            output += this.ALPHABET[(value >> (bits - 5)) & 31];
            bits -= 5;
            }
        }
        if (bits > 0) {
            output += this.ALPHABET[(value << (5 - bits)) & 31];
        }
        return output;
        };

        // blob decoding
        const decodeBlob = (blobDict: Record<string, number>): string => {
        const byteValues = Object.keys(blobDict)
            .map((k) => [Number(k), blobDict[k]])
            .sort((a, b) => a[0] - b[0])
            .map(([_, v]) => v);
        let buf = Buffer.from(byteValues);
    
        // principal 
        if (buf.length >= 28 && buf.length <= 32) {
            const crc = Buffer.alloc(4);
            crc.writeUInt32BE(crc32(buf));
            const full = Buffer.concat([crc, buf]);
            const b32 = base32Encode(full);
           return b32.match(/.{1,5}/g)?.join('-') ?? b32;
        } else if (buf.length === 10) {
            buf = Buffer.from([
            10, 167, 131, 161,  38, 156, 217,
            171,   6,  51,  38, 253, 114, 227,
            131, 105, 214,  49, 124,  41, 188,
            208, 212, 127,  12, 205, 120,  12,
                2
            ]);

            const crc = Buffer.alloc(4);
            crc.writeUInt32BE(crc32(buf));
            const full = Buffer.concat([crc, buf]);
            const b32 = base32Encode(full);
           return b32.match(/.{1,5}/g)?.join('-') ?? b32;
        } 

        return buf.toString('utf8');
        };

        return transactions.map((tx) => {
            const mint = tx.mint?.[0];
            idx++;
            // principal
            let principal: string | null = null;
            if (mint?.to?.owner?._arr) {
                principal = decodeBlob(mint?.to?.owner?._arr); // blob → decode
        }

        // memo
        let memo: string | null = null;
        if (mint?.memo && mint.memo.length > 0) {
            memo = decodeBlob(mint.memo[0]);
        }

        // created_at_time trans
        let createdAt: string | null = null;
        if (mint?.created_at_time && mint.created_at_time.length > 0) {
            const tsNs = BigInt(mint.created_at_time[0]);
            const tsMs = Number(tsNs / 1_000_000n);
            if(type === 'dashboard') {
                createdAt = new Date(tsMs).toISOString().replace('T', ', ').replace(/\.\d+Z$/, ' UTC');
            } else {
                createdAt = moment(tsMs).tz('UTC').format('MM/DD/YYYY HH:mm:ss');
            }
        } else {
            createdAt = moment().tz('UTC').format('MM/DD/YYYY HH:mm:ss');
        }

        return {
            index: idx,
            method: tx.kind ?? null,
            to: principal,
            type: memo == null ? 'RoyaltyReward' : memo,
            timestamp: createdAt,
            amount: (mint?.amount ?? null) == 0 ? 1 : (mint?.amount ?? null),
        };
    });
  }

  async sendUnlockListForOra( idxList: number[], principal: string, ownerKey: string, maxRetries = 3, delayMs = 1000): Promise<void> {
    const now = moment().utc();
    const tsSeconds = moment().unix();

    // 50
    for (let i = 0; i < idxList.length; i += 50) {
        const chunk = idxList.slice(i, i + 50);

        for (const idx of chunk) {

            this.canisterService.oracleActor.incrementMusicWorkInfoUnlockCount(idx, ownerKey)
                .catch((err) => console.error("incrementMusicWorkInfoUnlockCount:", err));
        }
        
        this.logger.log(`principal>>>>>>>>>> ${principal}`);

        const jsonArray = chunk.map((idx) => ({
            partner_idx: 6,
            idx,
            principal: principal,
            unlock_date: now.format('YYYY-MM-DD'),
            unlocked_at: now.format('YYYY-MM-DD HH:mm:ss'),
            unlocked_ts: tsSeconds,
            icp_year_month: now.format('YYYY-MM-DD'),
        }));

        let lastError: any;

        // retry
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                await this.canisterService.traffic2Actor.addVerificationUnlockListDataV2(ownerKey, JSON.stringify(jsonArray));
                break; // next chunk
            } catch (err) {
                lastError = err;
                console.error(`addVerificationUnlockListData ( ${attempt}/${maxRetries}):`, err);
                if (attempt < maxRetries) {
                    await new Promise((res) => setTimeout(res, delayMs));
                }
            }
        }

        if (lastError) {
            throw lastError;
        }
        }
    }

  async sendUnlockList( idxList: number[], partnerIdx: number, id: string, ownerKey: string, maxRetries = 3, delayMs = 1000): Promise<void> {
    const now = moment().utc();
    const tsSeconds = moment().unix();

    let principal = await this.canisterService.memberActor.getMemberByPartnerIdxAndUser(partnerIdx, id);
    if(principal[0] === undefined){
        if(partnerIdx === 2) partnerIdx = 5; //new ton member
        else if (partnerIdx === 3) partnerIdx = 6;
        
        principal = await this.canisterService.memberActor.getMemberByPartnerIdxAndUser(partnerIdx, id);
    }
    
    

    // 50
    for (let i = 0; i < idxList.length; i += 50) {
        const chunk = idxList.slice(i, i + 50);

        for (const idx of chunk) {

            this.canisterService.oracleActor.incrementMusicWorkInfoUnlockCount(idx, ownerKey)
                .catch((err) => console.error("incrementMusicWorkInfoUnlockCount:", err));
        }
        
        this.logger.log("principal>>>>>>>>>>", principal[0].principle);

        const jsonArray = chunk.map((idx) => ({
            partner_idx: partnerIdx,
            idx,
            principal: principal[0].principle,
            unlock_date: now.format('YYYY-MM-DD'),
            unlocked_at: now.format('YYYY-MM-DD HH:mm:ss'),
            unlocked_ts: tsSeconds,
            icp_year_month: now.format('YYYY-MM-DD'),
        }));

        let lastError: any;

        // retry
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                await this.canisterService.traffic2Actor.addVerificationUnlockListDataV2(ownerKey, JSON.stringify(jsonArray));
                break; // next chunk
            } catch (err) {
                lastError = err;
                console.error(`addVerificationUnlockListData ( ${attempt}/${maxRetries}):`, err);
                if (attempt < maxRetries) {
                    await new Promise((res) => setTimeout(res, delayMs));
                }
            }
        }

        if (lastError) {
            throw lastError;
        }
        }
    }


    async getMigration(startIdx: number, endIdx: number = 9999999, cnt: number, retryCnt = 0): Promise<any> {
        let allTx: any[] = [];

        if(startIdx > endIdx) {
            this.logger.log(`Migration Completed ::: startIdx: ${startIdx}, endIdx: ${endIdx}`);
            return { response: 'Migration Completed' };
        }

        const GetTransactionLength = ({
                    start: startIdx-1, 
                    length: cnt
            });
        try {
            const transaction = await this.canisterService.tokenArcActor.get_transactions(GetTransactionLength);
            let mainList = this.parseTransactions(transaction.transactions, "scan", GetTransactionLength.start);
            allTx = [...mainList];
            this.logger.log(`startIdx ::: ${startIdx} totalTransaction ::: ${allTx.length}`);
            if(allTx.length <= cnt && allTx.length > 0) {
                this.logger.log(`Archive LastIndex: ${allTx[allTx.length-1].index}`);
                const GetTransactionLengthLive = ({
                    start: allTx[allTx.length-1].index,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
                    length: cnt - allTx.length
                });

                const transactionLive = await this.canisterService.tokenActor.get_transactions(GetTransactionLengthLive);

                const archiveList = this.parseTransactions(transactionLive.transactions, "scan", Number(GetTransactionLengthLive.start));
                allTx = [...allTx, ...archiveList];
                
            } else {
                this.logger.log(`Archive End Live Data`);
                const transactionLive = await this.canisterService.tokenActor.get_transactions(GetTransactionLength);

                const archiveList = this.parseTransactions(transactionLive.transactions, "scan", Number(GetTransactionLength.start));
                allTx = [...allTx, ...archiveList];
            }
        } catch (error) {
            this.logger.error(`Error: ${error}`);
            return this.getMigration(startIdx, endIdx, cnt);
        }

            const stringifiedTx = allTx.map(tx => ({
            ...tx,
            amount: String(tx.amount),
            }));

            this.logger.log(util.inspect(stringifiedTx, { depth: null, colors: true }));

            this.logger.log(`stringifiedTx.length ::: ${stringifiedTx.length}`);

            
            try {
                if(stringifiedTx.length === 0) {
                    this.logger.log(`No Transactions Found, Moving to Next Batch ::: startIdx: ${startIdx + cnt}`);
                    return this.getMigration(startIdx + stringifiedTx.length, endIdx, cnt);
                }
                const whitelistRes =await axios.post('http://10.30.110.219/api/v1/contracts/whitelist', {
                    requests: stringifiedTx                
                })
                this.logger.log(`whitelistRes: ${JSON.stringify(whitelistRes?.data)}`);
                if(whitelistRes?.data?.success === true) {
                    return this.getMigration(startIdx+stringifiedTx.length, endIdx, cnt);
                } else {
                    if (retryCnt < 1) {
                        return this.getMigration(startIdx, endIdx, cnt, retryCnt + 1);
                    } else {
                        return this.getMigration(startIdx+stringifiedTx.length, endIdx, cnt);
                    }
                }
            } catch (error) {
                this.logger.error(`whitelistRes Error: ${error}`);
                await new Promise(resolve => setTimeout(resolve, 5000));

                if (retryCnt < 1) {
                    return this.getMigration(startIdx, endIdx, cnt, retryCnt + 1);
                } else {
                    return this.getMigration(startIdx+stringifiedTx.length, endIdx, cnt);
                }
            } 

    }

    async getMigrationSub(startIdx: number, cnt: number = 50): Promise<any> {
        let allTx: any[] = [];

        startIdx = startIdx +1;

        const last2 = startIdx % 100;
        let target = 0;
        if (last2 < 50) {
            target = startIdx - last2 + 50;       // 10~49 → 50
        } else if (last2 < 100) {
            target = startIdx - last2 + 100;      // 50~99 → 100
        }

        cnt = target - startIdx + 1;

        this.logger.log(`cnt ::: ${cnt}`);

        try {
            const GetTransactionLength = ({
                        start: startIdx-1, 
                        length: cnt
                });
            const transaction = await this.canisterService.tokenArcActor.get_transactions(GetTransactionLength);
            let mainList = this.parseTransactions(transaction.transactions, "scan", GetTransactionLength.start);
            allTx = [...mainList];
            this.logger.log(`startIdx ::: ${startIdx} totalTransaction ::: ${allTx.length}`);
            if(allTx.length <= cnt && allTx.length > 0) {
                this.logger.log(`Archive LastIndex: ${allTx[allTx.length-1].index}`);
                const GetTransactionLengthLive = ({
                    start: allTx[allTx.length-1].index,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
                    length: cnt - allTx.length
                });

                const transactionLive = await this.canisterService.tokenActor.get_transactions(GetTransactionLengthLive);

                const archiveList = this.parseTransactions(transactionLive.transactions, "scan", Number(GetTransactionLengthLive.start));
                allTx = [...allTx, ...archiveList];
                
            } else {
                this.logger.log(`Archive End Live Data`);
                const transactionLive = await this.canisterService.tokenActor.get_transactions(GetTransactionLength);

                const archiveList = this.parseTransactions(transactionLive.transactions, "scan", Number(GetTransactionLength.start));
                allTx = [...allTx, ...archiveList];
            }
        } catch (error) {
            this.logger.error(`Error: ${error}`);
            return { response: 'Migration Failed' };
        }

            const stringifiedTx = allTx.map(tx => ({
            ...tx,
            amount: String(tx.amount),
            }));

            this.logger.log(util.inspect(stringifiedTx, { depth: null, colors: true }));

            this.logger.log(`stringifiedTx.length ::: ${stringifiedTx.length}`);

            
        
            const whitelistRes =await axios.post('http://10.30.110.219/api/v1/contracts/whitelist', {
                requests: stringifiedTx                
            })
            this.logger.log(`whitelistRes: ${JSON.stringify(whitelistRes?.data)}`);
            if(whitelistRes?.data?.success === true) {
                return { response: 'Migration Completed' };
            } else {
                return { response: 'Migration Failed' };
            }
    }


    async getArcIdx(startIdx: number, endIdx: number = 9999999, cnt: number): Promise<any> {
        let allTx: any[] = [];

        if(startIdx > endIdx) {
            this.logger.log(`Migration Completed ::: startIdx: ${startIdx}, endIdx: ${endIdx}`);
            return { response: 'Migration Completed' };
        }

        const GetTransactionLength = ({
                    start: startIdx-1, 
                    length: cnt
            });
        try {
            const transaction = await this.canisterService.tokenArcActor.get_transactions(GetTransactionLength);
            let mainList = this.parseTransactions(transaction.transactions, "scan", GetTransactionLength.start);
            allTx = [...mainList];
            // this.logger.log(`startIdx ::: ${startIdx} totalTransaction ::: ${allTx.length}`);
            if(allTx.length <= cnt && allTx.length > 0) {
                this.logger.log(`Archive LastIndex: ${allTx[allTx.length-1].index}`);
                const GetTransactionLengthLive = ({
                    start: allTx[allTx.length-1].index,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
                    length: cnt - allTx.length
                });

                const transactionLive = await this.canisterService.tokenActor.get_transactions(GetTransactionLengthLive);
                console.log(transactionLive.transactions);
                const archiveList = this.parseTransactions(transactionLive.transactions, "scan", Number(GetTransactionLengthLive.start));
                allTx = [...allTx, ...archiveList];
                
            } else {
                this.logger.log(`Archive End Live Data`);
                const transactionLive = await this.canisterService.tokenActor.get_transactions(GetTransactionLength);
                console.log(transactionLive.transactions);
                const archiveList = this.parseTransactions(transactionLive.transactions, "scan", Number(GetTransactionLength.start));
                allTx = [...allTx, ...archiveList];
            }
        } catch (error) {
            this.logger.error(`Error: ${error}`);
            return this.getMigration(startIdx, endIdx, cnt);
        }

            const stringifiedTx = allTx.map(tx => ({
            ...tx,
            amount: String(tx.amount),
            }));

        return { response: stringifiedTx };
    }

    async addMonthlyIPLSnap(date: string = "20251001"): Promise<any> {
        const OWNER_KEY = this.configService.get<string>('OWNER_KEY');

        if(!OWNER_KEY){
            this.logger.error('Cannot find OWNER_KEY');
            throw new Error('Cannot find OWNER_KEY');
        }

        let allTx: any[] = [];
        let snapMap = new Map();

        const startIdx = await this.canisterService.memberSnapActor.getSnapLastIndex();
        this.logger.log(`getSnapLastIndex ::: ${startIdx}`);
        const GetTransactionLength = ({
                    start: startIdx, 
                    length: 2000
            });

            const transaction = await this.canisterService.tokenArcActor.get_transactions(GetTransactionLength);
            let mainList = this.parseTransactions(transaction.transactions, "scan", GetTransactionLength.start);
            allTx = [...mainList];
            const numberifiedTx = allTx.map(tx => ({
            ...tx,
            amount: Number(tx.amount),
            }));
            if(numberifiedTx.length > 0) {
                const cutoffDate = moment(`${date} 00:00:00`, "YYYYMMDD HH:mm:ss");
                
                const cutoffIndex = numberifiedTx.findIndex(tx =>
                    moment(tx.timestamp, "MM/DD/YYYY HH:mm:ss").isBefore(cutoffDate)
                );
                const txDate = moment(numberifiedTx[numberifiedTx.length-1].timestamp, "MM/DD/YYYY HH:mm:ss");
                this.logger.log(`Archive totalIndex ${numberifiedTx.length-1} LastIndex: ${cutoffIndex}`);
                if(txDate < cutoffDate) {
                    this.logger.log(`Archive timestamp ::: ${txDate} < ${cutoffDate}`);
                    numberifiedTx.forEach(tx => {
                        const prev = snapMap.get(tx.to) || 0;
                        snapMap.set(tx.to, prev + tx.amount);
                    });
                    
                    this.logger.log(`length ::: ${snapMap.size}`);

                    await Promise.all(
                        Array.from(snapMap.entries()).map(([principal, amount]) =>
                            this.canisterService.memberSnapActor.addMonthlyIPLSnap(OWNER_KEY, date, principal, amount)
                        )
                );
                await this.canisterService.memberSnapActor.setSnapLastIndex(OWNER_KEY, numberifiedTx[numberifiedTx.length-1].index);
                    this.logger.log('All snapMap entries sent!');
                    return this.addMonthlyIPLSnap(date);
                } else {
                    this.logger.log(`Archive timestamp ::: ${txDate} > ${cutoffDate}`);
                    return { response: 'Monthly IPL Snap Date Close' };
                }
            }

    }

    async requestHolderRetry(web3Router, musicInfo, i, logger, maxRetry = 3, delayMs = 3000) {
        for (let attempt = 1; attempt <= maxRetry; attempt++) {
            try {
                const req = httpMocks.createRequest({
                    method: 'GET',
                    url: '/getStaker',
                    query: { contract_address: musicInfo[i].op_neighboring_token_address },
                });
                logger.log(`song contract_address ${musicInfo[i].op_neighboring_token_address}`);

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

                // 성공 시 바로 반환
                return res._getData();

            } catch (err) {
                logger.error(`getStaker attempt ${attempt}/${maxRetry} failed: ${err.message}`);

                if (attempt < maxRetry) {
                    // 다음 재시도 전 3초 딜레이
                    await new Promise(r => setTimeout(r, delayMs));
                } else {
                    logger.error(`getStaker failed after ${maxRetry} attempts. Skipping...`);
                    return null; // 또는 throw err
                }
            }
        }
    }
}