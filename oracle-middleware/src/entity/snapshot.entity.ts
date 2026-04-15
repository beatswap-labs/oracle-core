import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class IplSnapshot {
  @PrimaryGeneratedColumn()
  idx: number;

  @Column()
  month: string;

  @Column({ unique: true })
  address: string;

  @Column()
  balance: string;
  
  @Column()
  amount: string;

  @Column()
  share: string;

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;
}
