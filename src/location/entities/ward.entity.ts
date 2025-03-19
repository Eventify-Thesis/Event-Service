import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { District } from './district.entity';

@Entity('wards')
export class Ward {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'name_en' })
  nameEn: string;

  @Column()
  type: string;

  @Column({ name: 'type_en' })
  typeEn: string;

  @Column({ name: 'district_id' })
  districtId: number;

  @Column({ default: 1 })
  status: number;

  @Column()
  sort: number;

  @Column({ name: 'origin_id' })
  originId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
