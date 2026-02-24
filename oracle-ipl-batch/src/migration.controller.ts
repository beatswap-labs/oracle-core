import { Controller, Post, Body, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { beatSwapDto } from './dto/beatSwapDto';

@Controller('migration')
export class MigrationController {
    constructor(private readonly appService: AppService) {}

    private readonly logger = new Logger(MigrationController.name);

    @Post('test')
    async test() {
        return { status: 'success' };
    }
    
    //token transaction
    @Post('getMigration')
    async getMigration(@Body() body: beatSwapDto) {
        this.logger.log(`getTokenTransaction Call::: page: ${body.startIdx}, ${body.endIdx},cnt: ${body.cnt}`);


        return this.appService.getMigration(body.startIdx, body.endIdx, body.cnt);
    }
}