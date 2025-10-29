import { Test, TestingModule } from '@nestjs/testing';
import { CanisterService } from './canister.service';

describe('CanisterService', () => {
  let service: CanisterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CanisterService],
    }).compile();

    service = module.get<CanisterService>(CanisterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
