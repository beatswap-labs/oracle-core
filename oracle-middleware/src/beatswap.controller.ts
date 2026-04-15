import { Controller, Get, Post, Body, Query, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { WorkerService } from './service/worker.service';
import { beatSwapDto } from './dto/beatSwapDto';

@Controller('beatswap')
export class BeatSwapController {
    constructor(private readonly appService: AppService, private readonly workerService: WorkerService) {}

    private readonly logger = new Logger(BeatSwapController.name);

    @Post('test')
    async test() {
        return { status: 'success' };
    }
    
    //IPL totalSupply
    @Post('getTotalSupply')
    async getTotalSupply() {
        this.logger.log('getTotalSupply Call');
        return this.appService.getTotalSupply();
    }


    //getTotalSupplyGragh
    @Post('getTotalSupplyGragh')
    async getTotalSupplyGragh(@Body() body: beatSwapDto) {
        this.logger.log('getTotalSupplyGragh Call');
        return this.appService.getTotalSupplyGragh(body.today);
    }

    //getRWAContributorsGragh
    @Post('getRWAContributorsGragh')
    async getRWAContributorsGragh(@Body() body: beatSwapDto) {
        this.logger.log('getRWAContributorsGragh Call');
        return this.appService.getRWAContributorsGragh(body.today);
    }

    //getTokenTransactionGragh
    @Post('getTokenTransactionGragh')
    async getTokenTransactionGragh(@Body() body: beatSwapDto) {
        this.logger.log('getTokenTransactionGragh Call');
        return this.appService.getTokenTransactionGragh(body.today);
    }

    //IPL totalSupply
    @Post('getTotalSupplyScan')
    async getTotalSupplyScan() {
        this.logger.log('getTotalSupplyScan Call');
        return this.appService.getTotalSupplyScan();
    }

    //IPL totalTransaction
    @Post('getTotalTransactionScan')
    async getTotalTransactionScan() {
        this.logger.log('getTotalTransactionScan Call');
        return this.appService.getTotalTransactionScan();
    }

    //getPrincipalById
    @Post('getPrincipalById')
    async getPrincipalById(@Body() body: beatSwapDto) {
        this.logger.log(`getPrincipalById Call ::: ${body.partnerIdx} /  ${body.id}`);

        return this.workerService.getPrincipalById(body.partnerIdx, body.id, 'getPrincipalById');
    }


    //getRwaContributors
    @Post('getRWAContributors')
    async getRWAContributors() {
        this.logger.log('getRwaContributors Call');
        return this.appService.getRWAContributors();
    }

    //token transaction
    @Post('getTokenTransaction')
    async getTokenTransaction(@Body() body: beatSwapDto) {
        this.logger.log(`getTokenTransaction Call::: ${body.type}`);
        return this.appService.getTokenTransaction("dashboard");
    }

    //token transaction Scan
    @Get('getTokenTransactionScan')
    async getTokenTransactionScan(@Query('page') page = 1) {
        this.logger.log(`getTokenTransaction Call::: page: ${page}`);


            return this.appService.getTokenTransactionScan(page);
    }

    //token transaction Detail
    @Post('getTokenTransactionDetail')
    async getTokenTransactionDetail(@Body() body: beatSwapDto) {
        this.logger.log(`getTokenTransaction Call::: page: ${body.idx}`);


            return this.appService.getTokenTransactionDetail(body.idx);
    }


    //token transaction
    @Post('getAddressInfo')
    async getAddressInfo(@Body() body: beatSwapDto) {
        this.logger.log(`getAddressInfo Call::: page: ${body.data}`);


        return this.workerService.getAddressInfo(body.data);
    }

    //token transaction
    @Post('getMigration')
    async getMigration(@Body() body: beatSwapDto) {
        this.logger.log(`getTokenTransaction Call::: page: ${body.startIdx}, ${body.endIdx},cnt: ${body.cnt}`);


        return this.appService.getMigration(body.startIdx, body.endIdx, body.cnt);
    }

    //addPrincipal
    @Post('addPrincipal')
    async addPrincipal(@Body() body: beatSwapDto) {
        this.logger.log(`addPrincipal Call ::  ${body.id}`);
        try {
        const response = await this.appService.addPrincipal(body.id, body.partnerIdx);
        return { success: true , response};
        } catch(e) {
            this.logger.error("error",e);
            return { success: false };
        }
    }

    @Post('getSnapshot')
    async getSnapshot(@Body() body: beatSwapDto) {
        this.logger.log(`getSnapshot Call ::  ${body.address}`);
        try {
        const response = await this.workerService.getSnapshot(body.address, "snapshot");
        return response;
        } catch(e) {
            this.logger.error("error",e);
            return { success: false };
        }
    }

    @Post('getVestingProof')
    async getVestingProof(@Body() body: beatSwapDto) {
        this.logger.log(`getVestingProof Call ::  ${body.address}`);
        try {
        const response = await this.workerService.getVestingProof(body.address, "vestingProof");
        return response;
        } catch(e) {
            this.logger.error("error",e);
            return { success: false };
        }
    }

    @Post('getVestingWhiteProof')
    async getVestingWhiteProof(@Body() body: beatSwapDto) {
        this.logger.log(`getVestingWhiteProof Call ::  ${body.address}`);
        try {
        const response = await this.workerService.getVestingWhiteProof(body.address, "whiteProof");
        return response;
        } catch(e) {
            this.logger.error("error",e);
            return { success: false };
        }
    }

    @Post('getVestingWhiteTemp')
    async getVestingWhiteTemp(@Body() body: beatSwapDto) {
        this.logger.log(`getVestingWhiteTemp Call ::  ${body.address}`);
        try {
        const response = await this.workerService.getVestingWhiteTemp(body.address, "whiteTemp");
        return response;
        } catch(e) {
            this.logger.error("error",e);
            return { success: false };
        }
    }


    @Post('getUserDashboard')
    async getUserDashboard(@Body() body: beatSwapDto) {
        this.logger.log(`getUserDashboard Call ::  ${body.address}`);
        try {
        const response = await this.workerService.getUserDashboard(body.address, "userDashboard");
        return response;
        } catch(e) {
            this.logger.error("error",e);
            return { success: false };
        }
    }

    @Post('getClaimableAmount')
    async getClaimableAmount(@Body() body: beatSwapDto) {
        this.logger.log(`getClaimableAmount Call ::  ${body.address}`);
        try {
            const response = await this.workerService.getClaimableAmount(body.address, "claimableAmount");
            return response;
        } catch (e) {
            this.logger.error("error", e);
            return { success: false };
        }
    }

    @Post('getClaimedTotal')
    async getClaimedTotal(@Body() body: beatSwapDto) {
        this.logger.log(`getClaimedTotal Call ::  ${body.address}`);
        try {
            const response = await this.workerService.getClaimedTotal(body.address, "claimedTotal");
            return response;
        } catch (e) {
            this.logger.error("error", e);
            return { success: false };
        }
    }

    @Post('getVestingHistory')
    async getVestingHistory(@Body() body: beatSwapDto) {
        this.logger.log(`getVestingHistory Call ::  ${body.address} ${body.type}`);
        try {
        const response = await this.workerService.getVestingHistory(body.address, 'history', body.type);
        return response;
        } catch(e) {
            this.logger.error("error",e);
            return { success: false };
        }
    }

    @Post('getBtxAllowance')
    async getBtxAllowance(@Body() body: beatSwapDto) {
        this.logger.log(`getBtxAllowance Call ::  ${body.address} ${body.owner} ${body.spender}`);
        try {
        const response = await this.workerService.getBtxAllowance('allowance', body.owner, body.spender);
        return response;
        } catch(e) {
            this.logger.error("error",e);
            return { success: false };
        }
    }

    //partnerIdx 2,5 address update
    @Post('evmAddressBinding')
    async evmAddressBinding(@Body() body: beatSwapDto) {
        this.logger.log(`evmAddressBinding Call ::: ${body.id} || ${body.address})`);
        return this.workerService.evmAddressBinding(body.id, body.address, 'evmAddressBinding');
    }

    //partnerIdx 2,5 evmAddressCompare
    @Post('evmAddressCompare')
    async evmAddressCompare(@Body() body: beatSwapDto) {
        this.logger.log(`evmAddressCompare Call ::: ${body.id} || ${body.address})`);
        return this.workerService.evmAddressCompare(body.id, body.address, 'evmAddressCompare');
    }

    //getTelegramAddress
    @Post('getTelegramAddress')
    async getTelegramAddress(@Body() body: beatSwapDto) {
        this.logger.log(`getTelegramAddress Call ::: ${body.id} /  ${body.address}`);
        if(body.id === '' || body.address === '') {
            return { success: false, response: 'bad Reqeust' };
        }
        
        return this.workerService.getTelegramAddress( body.id, body.address, 'getTelegramAddress');
    }
}