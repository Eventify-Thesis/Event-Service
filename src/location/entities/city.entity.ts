import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { District } from './district.entity';

@Entity('cities')
export class City {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'origin_id' })
  originId: number;

  @Column({ length: 40 })
  name: string;

  @Column({ length: 40, name: 'name_en' })
  nameEn: string;

  @Column({ length: 20 })
  type: string;

  @Column({ length: 20, name: 'type_en' })
  typeEn: string;

  @Column({ length: 20, nullable: true, name: 'short_name' })
  shortName: string;

  @Column({ name: 'country_id' })
  countryId: number;

  @Column()
  sort: number;

  @Column({ default: 1 })
  status: number;

  @Column({ length: 100, name: 'location_id' })
  locationId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
