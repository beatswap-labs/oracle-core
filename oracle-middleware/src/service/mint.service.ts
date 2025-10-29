import { Injectable, Logger } from '@nestjs/common';
import { WorkerPool } from '../workers/worker-pool';

@Injectable()
export class MintService {
    private workerPool = new WorkerPool(4); // worker pool size

    private readonly logger = new Logger(MintService.name);
    
    async mintToken(id: string, partnerIdx: number, mintType: string, amount: number): Promise<any> {
        
        this.logger.log(`MintService mintToken called with id: ${id}, partnerIdx: ${partnerIdx}, mintType: ${mintType}, amount: ${amount}`);
        return this.workerPool.runTask({ id, partnerIdx, mintType, amount });
    }
}
