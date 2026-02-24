import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class VestingWhitelistsTemp {
  @PrimaryGeneratedColumn()
  idx: number;

  @Column()
  id: string;

  @Column()
  address: string;
  
  @Column()
  amount: string;

  @Column()
  created_at: Date;
}
