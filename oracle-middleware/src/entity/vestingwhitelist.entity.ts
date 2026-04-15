import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class VestingWhitelists {
  @PrimaryGeneratedColumn()
  vesting_whitelist_idx: number;

  @Column()
  pool_id: number;

  @Column()
  round_id: number;

  @Column()
  address: string;
  
  @Column()
  amount: string;

  @Column()
  proof: string;

  @Column()
  status: string;

  @Column()
  created_at: Date;
}
