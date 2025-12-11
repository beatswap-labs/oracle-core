import { Injectable, Logger } from '@nestjs/common';
import { WorkerPool } from '../workers/worker-pool';

@Injectable()
export class WorkerService {
    private workerPool = new WorkerPool(5); // worker pool size

    private readonly logger = new Logger(WorkerService.name);
    
    async mintToken(id: string, partnerIdx: number, mintType: string, amount: number): Promise<any> {
        
        this.logger.log(`mintToken called with id: ${id}, partnerIdx: ${partnerIdx}, mintType: ${mintType}, amount: ${amount}`);
        return this.workerPool.runServiceTask({ id, partnerIdx, mintType, amount });
    }

    async mintTokenForOracle(principal: string, mintType: string, amount: number): Promise<any> {
        this.logger.log(`mintTokenForOracle called with principal: ${principal}, mintType: ${mintType}, amount: ${amount}`);
        return this.workerPool.runServiceTask({ principal, mintType, amount });
    }

    async getPrincipalById(partnerIdx: number, id: string): Promise<any> {
        this.logger.log(`getPrincipalById called with partnerIdx: ${partnerIdx}, id: ${id}`);
        return this.workerPool.runUserTask({ partnerIdx, id });
    }   


    async userPrincipalMigration(startIdx: number, endIdx: number): Promise<any> {
        this.logger.log(`userPrincipalMigration start`);
        return this.workerPool.runUserTask({ migration: true, startIdx, endIdx });
    }  
}
