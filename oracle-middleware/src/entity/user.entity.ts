import { Entity, Index, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@Index('idx_user_id_partnerIdx', ['id', 'partnerIdx'])
export class OracleUserInfo {
  @PrimaryGeneratedColumn()
  idx: number;

  @Column()
  partnerIdx: number;

  @Column()
  id: string;

  @Column({ unique: true})
  principal: string;

  @Column()
  createdAt: Date;
}
