import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class IplMonthlySnapshots {
  @PrimaryGeneratedColumn()
  idx: number;

  @Column({ unique: true })
  month: string;

  @Column()
  total_supply: string;
  
  @Column()
  btx_distribution: number;

  @Column()
  round_id: number;

  @Column()
  status: string;

  @Column()
  created_at: Date;
}