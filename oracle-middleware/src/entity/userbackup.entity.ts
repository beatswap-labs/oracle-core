import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class OracleUserInfoBackup {
  @PrimaryGeneratedColumn()
  idx: number;

  @Column()
  partnerIdx: number;

  @Column()
  id: string;

  @Column()
  evmAddress: string;

  @Column({ unique: true })
  principal: string;

  @Column()
  iplBalance: number;

  @Column()
  createdAt: Date;
}
