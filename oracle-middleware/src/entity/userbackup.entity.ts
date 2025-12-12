import { Entity, Index, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@Index('idx_user_id_partnerIdx', ['id', 'partnerIdx'])
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
