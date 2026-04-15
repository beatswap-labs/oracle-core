import { Controller, Get, Post, Body, Req, Logger, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { WorkerService } from './service/worker.service';
import { oracleDto } from './dto/oracleDto';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment-timezone';

@Controller('oracle')
export class AppController {
    constructor(private configService: ConfigService, private readonly appService: AppService, private readonly workerService: WorkerService) {
        const list = this.configService.get<string>('BLOCK_PRINCIPAL');
        this.BLACKLISTED_PRINCIPALS = list ? [list] : [];
    }

    private readonly logger = new Logger(AppController.name);
    private preStreamRequests = new Map<string, number>(); // principal -> timestamp
    private streamRequests = new Map<string, number>(); // principal -> timestamp
    private REQUEST_INTERVAL = 43200000; // 12 hours
    private STREAM_INTERVAL = 12000; // 12 seconds
    private BLACKLISTED_PRINCIPALS: string[] = [];

    @Post('test')
    async test() {
        return { status: 'success' };
    }

    //Music info list
    @Post('getMusicWorkInfos')
    async getMusicWorkInfos(@Req() req: Request) {
        
        this.logger.log(`getMusicWorkInfos Call ip :: ${req.socket.remoteAddress}`);

        return this.appService.getMusicWorkInfosByOwner();
    }

     //Music info list
    @Post('getArtistMusicInfo')
    async getArtistMusicInfo(@Body() body: oracleDto) {
        
        this.logger.log(`getArtistMusicInfo artist :: ${body.nickname}`);

        return this.appService.getArtistMusicInfo(body.nickname);
    }

    //Music total count
    @Post('getMusicWorkInfosTotalCount')
    async getMusicWorkInfosTotalCount() {
        this.logger.log('getMusicWorkInfosTotalCount Call');
        return this.appService.getMusicWorkInfosTotalCount();
    }


    //Genre Search
    @Post('getGenres')
    async getGenres() {
        this.logger.log('getGenres Call');
        return this.appService.getGenres();
    }

    //Partner Search
    @Post('getPartners')
    async getPartners() {
        this.logger.log('getPartners Call');
        return this.appService.getPartners();
    }


    //Music Search for Genre
    @Post('getMusicWorkInfosByGenre')
    async getMusicWorkInfosByGenre(@Body() body: oracleDto) {
        this.logger.log(`getMusicWorkInfosByGenre Call genreIdx ::: ${body.genreIdx}`);
        return this.appService.getMusicWorkInfosByGenre(body.genreIdx);
    }

    //Daily Music Holder Search
    @Post('getDailyRightsHolders')
    async getDailyRightsHolders(@Body() body: oracleDto) {
        this.logger.log(`getDailyRightsHolders Call address ::: ${body.address}`);
        return this.appService.getDailyRightsHolders(body.address);
    }

    //Total unlock Count Search
    @Post('getTotalUnlockCount')
    async getTotalUnlockCount() {
        this.logger.log('getTotalUnlockCount Call');
        const totalCount = await this.appService.getTotalUnlockCount();
        this.logger.log(`totalCount ::: ${totalCount}`);
        return { totalCount : Number(totalCount) };
    }

    //site unlock Count Search
    @Post('getTotalVerificationUnlockCount')
    async getTotalVerificationUnlockCount(@Body() body: oracleDto) {
        this.logger.log('getTotalVerificationUnlockCount Call');
        const totalCount = await this.appService.getTotalVerificationUnlockCount(body.partnerIdx);
        this.logger.log(`totalCount ::: ${totalCount}`);
        return { totalCount : Number(totalCount) };
    }

    //Site Unlock Count 
    @Post('getVerificationUnlockListsByDate')
    async getVerificationUnlockListsByDate(@Body() body: oracleDto) {
        this.logger.log('getVerificationUnlockListsByDate Call');
        return await this.appService.getVerificationUnlockListsByDate(body.partnerIdx, body.unlock_date);
    }

    //TIMESTAMP Site Unlock Count
    @Post('getVerificationUnlockListsByTS')
    async getVerificationUnlockListsByTS(@Body() body: oracleDto) {
        this.logger.log('getVerificationUnlockListsByTS Call');
        return await this.appService.getVerificationUnlockListsByDateTs(body.partnerIdx, body.startTs, body.endTs);
    }

    @Post('updateMusicWorkInfo')
    async updateMusicWorkInfo(@Body() body: oracleDto) {
        this.logger.log(`updateMusicWorkInfo Call title : ${body.idxList}`);

        try {
            await this.appService.updateMusicWorkInfo(body.idxList);
            return { success: true };
        } catch(e) {
            this.logger.error("error", e);
            return { success: false };
        }
    }

    //Add Partner
    @Post('addPartner')
    async addPartner(@Body() body: oracleDto) {
        this.logger.log(`addPartner Call requestName :: ${body.partnerIdx}, requesterPrincipal :: ${body.partner_name}`);

        try {
            await this.appService.addPartner(body.partnerIdx, body.partner_name);
        } catch(e) {
            this.logger.error("error", e.getMessage);
            return { success: false };
        }
        return { success: true };
    }

    //Add Artist
    @Post('addRequesterId')
    async addRequesterId(@Body() body: oracleDto) {
        this.logger.log(`addRequesterId Call requestName :: ${body.requestName}, requesterPrincipal :: ${body.requester_principal}, canApprove :: ${body.can_approve}`);

        try {
            await this.appService.addRequesterId(body.requestName, body.requester_principal, body.can_approve);
        } catch(e) {
            this.logger.error("error", e.getMessage);
            return { success: false };
        }
        return { success: true };
    }

    //Add Partner Unlock
    @Post('addVerificationUnlockList')
    async addVerificationUnlockList(@Req() req: Request, @Body() body: oracleDto) {
        const clientIp = req.ip?.replace('::ffff:', '');
        this.logger.log(`addVerificationUnlockList Call partnerIdx :: ${body.partnerIdx}, idx :: ${body.idxList} id :: ${body.id} request IP :: ${clientIp}`);
            
        try {
            const data = await this.appService.addVerificationUnlockList(body.partnerIdx, body.idxList, body.id);

             return { success: true , data};
        } catch(e) {
            this.logger.error("error",e);
            return { success: false };
        }

    }

    //Add Partner Unlock
    @Post('addVerificationUnlockListTK')
    async addVerificationUnlockListTK(@Req() req: Request, @Body() body: oracleDto) {
        const clientIp = req.ip?.replace('::ffff:', '');
        this.logger.log(`addVerificationUnlockListTK Call partnerIdx :: ${body.partnerIdx}, idx :: ${JSON.stringify(body.idxList)} id :: ${body.id} request IP :: ${clientIp}`);
            
        try {
            const data = await this.appService.addVerificationUnlockListTK(body.partnerIdx, body.idxList, body.id);
            return { success: true , data};
        } catch(e) {
            this.logger.error("error",e);
            return { success: false };
        }

    }

    //Add Oracle Unlock
    @Post('addVerificationUnlockListOra')
    async addVerificationUnlockListOra(@Req() req: Request, @Body() body: oracleDto) {
        const clientIp = req.ip?.replace('::ffff:', '');
        this.logger.log(`addVerificationUnlockListOra Call idx :: ${JSON.stringify(body.idxList)} id :: ${body.principal} request IP :: ${clientIp}`);
            
        try {
            const data = await this.appService.addVerificationUnlockListOra(body.idxList, body.principal);
             return { success: true , data};
        } catch(e) {
            this.logger.error("error",e);
            return { success: false };
        }

    }

    //Add User Play Data
    @Post('addUserPlayData')
    async addUserPlayData(@Body() body: oracleDto) {
        this.logger.log(`addUserPlayData Call partnerIdx :: ${body.partnerIdx}, idx :: ${body.id} musicIdx :: ${body.idx}`);

        try {
            const data = await this.appService.addUserPlayData(body.partnerIdx, body.id, body.idx);
            return { success: true , data};
        } catch(e) {
            this.logger.error("error",e);
            return { success: false };
        }

    }

    @Post('addSongData')
    async addSongData(@Body() body: oracleDto) {
        this.logger.log(`addSongData Call songIdx :: ${body.idx}`);

        try {
            const data = await this.appService.addPaykhanMusicWorkInfo(body.idx);
            return { success: true , data};
        } catch(e) {
            this.logger.error("error",e);
            return { success: false };
        }

    }

    @Post('addMusicVideoData')
    async addMusicVideoData(@Body() body: oracleDto) {
        this.logger.log(`addMusicVideoData Call songIdx :: ${body.idx}`);

        try {
            const data = await this.appService.addMusicVideoData(body.idx);
            return { success: true , data};
        } catch(e) {
            this.logger.error("error",e);
            return { success: false };
        }

    }

    @Post('addDailyRightsHolder')
    async addDailyRightsHolder(@Body() body: oracleDto) {
        try {
            const response = await this.appService.addDailyRightsHolder();
            this.logger.log(response);
        }   catch(e) {
            this.logger.error("error",e);
            return { success: false };
        }

        return { success: true };
    }

    @Post('addRightsHolder')
    async addRightsHolder(@Body() body: oracleDto) {
        try {
            const response = await this.appService.addRightsHolder(body.idx);
            this.logger.log(response);
        }   catch(e) {
            this.logger.error("error",e);
            return { success: false };
        }

        return { success: true };
    }

    //unlock Count
    @Post('getUnlockCount')
    async getUnlockCount(@Body() body: any[]) {
        this.logger.log(body);
        const response = await this.appService.getUnlockCount(body);
        return response;
    }

    //unlock info for staking address 
    @Post('getUnlockInfoByAddress')
    async getUnlockInfoByAddress(@Body() body: oracleDto) {
        this.logger.log(`getUnlockInfoByAddress Call ::  ${body}`);
        const response = await this.appService.getUnlockInfoByAddress(body.address, body.year, body.month);
        return response;
    }


    //pending
    @Post('updatePending')
    async updatePending(@Body() body: oracleDto) {
        this.logger.log(`updatePending Call ::  ${body.partnerIdx}`);
        const response = await this.appService.updatePending(body.partnerIdx);
        return response;
    }

    @Post('getUtcUnix')
    async getUtcUnix() {
        
        const now = moment().unix();
        return now;
    }

    @Post('addMint')
    async addMint(@Body() body: oracleDto) {
        this.logger.log(`addMint Call :: Type :: ${body.mintType} ID :: ${body.id} partnerIdx :: ${body.partnerIdx} amount :: ${body.amount}`);

        if (this.BLACKLISTED_PRINCIPALS.includes(body.principal)) {
            this.logger.warn(`Blocked principal attempt: ${body.principal}`);
            return {
            success: false,
            message: 'This principal is blocked.',
            };
        }

        if(body.amount <= 0 || body.amount > 3000) {
            this.logger.log(`rejected principal ::: ${body.principal}`);
            return { error: 'reject request param' };
        }

        if(body.mintType === 'Stream') {
            const now = Date.now();
            const lastTime = this.streamRequests.get(body.principal) || 0;

            if (now - lastTime < this.STREAM_INTERVAL) {
                // duplicate request
                this.logger.log(`Duplicate mint request blocked for principal: ${body.principal}`);
                return { success: false, message: 'Too many requests' };
            }

            this.streamRequests.set(body.principal, now);
            
            //memory cleanup
            setTimeout(() => this.streamRequests.delete(body.principal), this.STREAM_INTERVAL);

                body.mintType = 'Stream';

        } 

        const res = await this.workerService.mintToken(body.id, body.partnerIdx, body.mintType, body.amount);
        return res;
    }

    @Post('addOracleMint')
    async addOracleMint(@Body() body: oracleDto) {
        this.logger.log(`addOracleMint Call :: Type :: ${body.mintType} ID :: ${body.principal} unlock_total_count :: ${body.unlock_total_count}`);

        if (this.BLACKLISTED_PRINCIPALS.includes(body.principal)) {
            this.logger.warn(`Blocked principal attempt: ${body.principal}`);
            return {
            success: false,
            message: 'This principal is blocked.',
            };
        }
    
        let amount;
        let res: any;
        
        if(body.mintType === 'preStream') {
            amount = 1;
            const now = Date.now();
            const lastTime = this.preStreamRequests.get(body.principal) || 0;

            if (now - lastTime < this.REQUEST_INTERVAL) {
                // duplicate request
                this.logger.log(`Duplicate mint request blocked for principal: ${body.principal}`);
                return { success: false, message: 'Too many requests' };
            }

            this.preStreamRequests.set(body.principal, now);
            
            //memory cleanup
            setTimeout(() => this.preStreamRequests.delete(body.principal), this.REQUEST_INTERVAL);

                body.mintType = 'Stream';

            res = await this.workerService.mintTokenForOracle(body.principal, body.mintType, amount);
            return res;
        } else {
            if(body.mintType === 'Unlock') {
                amount = 100;
                for (let i = 0; i < body.unlock_total_count; i++) {
                    res = await this.workerService.mintTokenForOracle(body.principal, body.mintType, amount);
                }
            } else if (body.mintType === 'Stream'){
                amount = 1;

                const now = Date.now();
                const lastTime = this.streamRequests.get(body.principal) || 0;

                if (now - lastTime < this.STREAM_INTERVAL) {
                    // duplicate request
                    this.logger.log(`Duplicate mint request blocked for principal: ${body.principal}`);
                    return { success: false, message: 'Too many requests' };
                }

                this.streamRequests.set(body.principal, now);
            
                //memory cleanup
                setTimeout(() => this.streamRequests.delete(body.principal), this.STREAM_INTERVAL);

                res = await this.workerService.mintTokenForOracle(body.principal, body.mintType, amount);
            }
            return res;
        }
    }


    //addIplMintbatch
    @Post('addIplMintbatch')
    async addIplMintbatch(@Body() body: oracleDto) {
        this.logger.log(`addIplMintbatch Call ::  ${body.partnerIdx} || ${body.idx}`);
        const response = await this.appService.addIplMintbatch(body.partnerIdx, body.idx);
        return response;
    }

    //addIplMintbatch
    @Post('addIplMintbatchMV')
    async addIplMintbatchMV(@Body() body: oracleDto) {
        this.logger.log(`addIplMintbatchMV Call ::  ${body.type} || ${body.idx}`);
        const response = await this.appService.addIplMintbatchMV(body.type, body.idx);
        return response;
    }

    //ipl balance
    @Post('getIplBalance')
    async getIplBalance(@Body() body: oracleDto) {
        this.logger.log(`getIplBalance Call ::: ${body.principal}`);
        return this.appService.getIplBalance(body.principal);
    }


    //ipl balance
    @Post('getIplHistory')
    async getIplHistory(@Body() body: oracleDto) {
        this.logger.log(`getIplHistory Call ::: ${body.idx}`);
        return this.workerService.getIplHistory(body.idx, 'getIplHistory');
    }

    //partnerIdx 1 address update
    @Post('updateAddress')
    async updateAddress(@Body() body: oracleDto) {
        this.logger.log(`updateAddress Call ::: ${body.id} || ${body.address})`);
        return this.workerService.updateAddress(body.id, body.address, 'updateAddress');
    }

    @Post('updateAddressBatch')
    async updateAddressBatch(@Body() body: oracleDto) {
        this.logger.log(`updateAddressBatch Call`);
        return this.workerService.updateAddressBatch('updateAddressBatch');
    }

    @Get('getStaker')
    async getStaker(@Query('contract_address') contractAddress: string) {
        return this.appService.getStaker(contractAddress);
    }

    @Post('getIpl')
    async getIpl(@Body() body: oracleDto) {
        return this.workerService.getIpl(body.year, body.month);
    }

    @Post('getSnapshotBalance')
    async getTestBalance(@Body() body: oracleDto) {
        return this.workerService.getSnapshotBalance(body.year, body.month, 'balance');
    }

    @Post('insertTemp') 
    async insertTemp(@Body() body: { ids: string[]; etherAmounts: string[] }) {
        const { ids, etherAmounts } = body;

        if (ids.length !== etherAmounts.length) {
            throw new Error('ids and etherAmounts list length not same');
        }

        this.logger.log(`insertTemp Call ::: count=${ids.length}`);

        const results: any[] = [];

        for (let i = 0; i < ids.length; i++) {
            const id = ids[i];
            const etherAmount = etherAmounts[i];

            this.logger.log(`insertTemp Item ::: ${id} || ${etherAmount}`);

            const result = await this.workerService.insertTemp(id, etherAmount, 'insertTemp');

            results.push(result);
        }

        return results;
    }

}