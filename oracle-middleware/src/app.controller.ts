import { Controller, Get, Post, Body, Req, Logger, ValidationPipe } from '@nestjs/common';
import { AppService } from './app.service';
import { oracleDto } from './dto/oracleDto';
import { Request } from 'express';
import * as moment from 'moment-timezone';

@Controller('oracle')
export class AppController {
    constructor(private readonly appService: AppService) {}

    private readonly logger = new Logger(AppController.name);

    @Get('test')
    async test() {
        return { status: 'success' };
    }

    //Music info list
    @Post('getMusicWorkInfos')
    async getMusicWorkInfos(@Req() req: Request) {
        
        this.logger.log(`getMusicWorkInfos Call ip :: ${req.socket.remoteAddress}`);

        return this.appService.getMusicWorkInfosByOwner();
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

    //Music Add
    // @Post('addMusicWorkInfo')
    // async addMusicWorkInfo(@Body() body: oracleDto) {
    //     this.logger.log(`addMusicWorkInfo Call title : ${body.title}`);

    //     try {
    //         await this.appService.addMusicWorkInfo(body);
    //     } catch(e) {
    //         console.log("error", e.getMessage);
    //         return { success: false };
    //     }
    //     return { success: true };
    // }

    @Post('updateMusicWorkInfo')
    async updateMusicWorkInfo(@Body() body: oracleDto) {
        this.logger.log(`updateMusicWorkInfo Call title : ${body.idxList} / ${body.unlock_count_list}`);

        try {
            await this.appService.updateMusicWorkInfo(body.idxList, body.unlock_count_list);
            return { success: true };
        } catch(e) {
            console.log("error", e);
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
            console.log("error", e.getMessage);
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
            console.log("error", e.getMessage);
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
            console.log("error",e);
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
            console.log("error",e);
            return { success: false };
        }

    }


    @Post('addUserPlayData')
    async addUserPlayData(@Body() body: oracleDto) {
        this.logger.log(`addUserPlayData Call partnerIdx :: ${body.partnerIdx}, idx :: ${body.id} musicIdx :: ${body.idx}`);

        try {
            const data = await this.appService.addUserPlayData(body.partnerIdx, body.id, body.idx);

             return { success: true , data};
        } catch(e) {
            console.log("error",e);
            return { success: false };
        }

    }

    @Post('addRightsHolder')
    async addRightsHolder() {
        try {
            const response = await this.appService.addRightsHolder();
            this.logger.log(response);
        }   catch(e) {
            console.log("error",e);
            return { success: false };
        }

        return { success: true };
    }

    @Post('addDailyRightsHolder')
    async addDailyRightsHolder() {
        const response = await this.appService.addDailyRightsHolder();
    }


    @Post('addPaykhanMusicWorkInfo')
    async addPaykhanMusicWorkInfo(@Body() body: oracleDto) {
        const response = await this.appService.addPaykhanMusicWorkInfo(body.idx);
        return response;
    }

    // @Post('addPartnerUnlockInfo')
    // async addPartnerUnlockInfo(@Body() body: oracleDto) {
    //     const response = await this.appService.addPartnerUnlockInfo(body.partnerIdx, body.idx);
    //     return response;
    // }

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


    //addPrincipal batch
    // @Post('addPrincipalbatch')
    // async addPrincipalbatch(@Body() body: oracleDto) {
    //     this.logger.log(`addPrincipal Call ::  ${body.partnerIdx} || ${body.idx}`);
    //     const response = await this.appService.addPrincipalBatch(body.partnerIdx, body.idx);
    //     return response;
    // }


    //기존 결제건 pending처리
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

    //getPrincipalById
    @Post('getPrincipalById')
    async getPrincipalById(@Body() body: oracleDto) {
        this.logger.log(`getPrincipalById Call ::: ${body.partnerIdx} /  ${body.id}`);
        return this.appService.getPrincipalByOraId(body.partnerIdx, body.id);
    }


    @Post('addMint')
    async addMint(@Body() body: oracleDto) {
        this.logger.log(`addMint Call :: Tpye :: ${body.mintType} ID :: ${body.id} partnerIdx :: ${body.partnerIdx} amount :: ${body.amount}`);
        try {
            const response = await this.appService.iplMint(body.id, body.partnerIdx, body.mintType, body.amount);
            return { success: true , response};
        } catch(e) {
            console.log("error",e);
            return { success: false };
        }
    }


    //addIplMintbatch batch
    @Post('addIplMintbatch')
    async addIplMintbatch(@Body() body: oracleDto) {
        this.logger.log(`addIplMintbatch Call ::  ${body.partnerIdx} || ${body.idx}`);
        const response = await this.appService.addIplMintbatch(body.partnerIdx, body.idx);
        return response;
    }
}