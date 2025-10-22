import { Controller, Get, Post, Body, Query, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { beatSwapDto } from './dto/beatSwapDto';

@Controller('beatswap')
export class BeatSwapController {
    constructor(private readonly appService: AppService) {}

    private readonly logger = new Logger(BeatSwapController.name);

    @Get('test')
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
        return this.appService.getPrincipalById(body.partnerIdx, body.id);
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

    //token transaction
    @Get('getTokenTransactionScan')
    async getTokenTransactionScan(@Query('page') page = 1) {
        this.logger.log(`getTokenTransaction Call::: page: ${page}`);


            return this.appService.getTokenTransactionScan(page);
    }

    //token transaction
    @Post('getMigration')
    async getMigration(@Body() body: beatSwapDto) {
        this.logger.log(`getTokenTransaction Call::: page: ${body.startIdx}, cnt: ${body.cnt}`);


            return this.appService.getMigration(body.startIdx, body.cnt);
    }


    //addPrincipal
    @Post('addPrincipal')
    async addPrincipal(@Body() body: beatSwapDto) {
        this.logger.log(`addPrincipal Call ::  ${body.id}`);
        try {
        const response = await this.appService.addPrincipal(body.id, body.partnerIdx);
        return { success: true , response};
        } catch(e) {
            console.log("error",e);
            return { success: false };
        }
    }

}