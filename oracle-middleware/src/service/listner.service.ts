// src/canisters/canister.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { startVestingListener } from 'src/web3/vesting';

@Injectable()
export class ListnerService {

    
    private readonly logger = new Logger(ListnerService.name); 

    async onModuleInit() {
        this.logger.log(`ListenerService OnModuleInit`);
        startVestingListener();
    }
}
