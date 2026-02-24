import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class IplWhitelist {
  @PrimaryGeneratedColumn()
  ipl_whitelist_idx: number;

  @Column({ unique: true })
  principal: string;

  @Column({ unique: true })
  address: string;

  @Column({ unique: true })
  private_key: string;

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;
}
