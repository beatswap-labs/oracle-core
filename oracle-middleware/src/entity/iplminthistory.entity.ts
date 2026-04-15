import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class IplMintHistory {
  @PrimaryGeneratedColumn()
  idx: number;

  @Column()
  principal: string;

  @Column()
  amount: string;

  @Column()
  reward_type: string;

  @Column()
  created_at: Date;
}