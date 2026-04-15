import { Entity, Index, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class VestingHistoryLog {
  @PrimaryGeneratedColumn()
  idx: number;

  @Column()
  event_type: string;

  @Column()
  pool_id: number;

  @Column()
  round_id: number;

  @Column()
  address: string;

  @Column()
  amount: string;

  @Column({ unique: true})
  block_number: string;

  @Column()
  created_at: Date;
}