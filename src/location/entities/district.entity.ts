import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('districts')
export class District {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'name_en' })
  nameEn: string;

  @Column({ name: 'type' })
  type: string;

  @Column({ name: 'type_en' })
  typeEn: string;

  @Column({ name: 'city_id' })
  cityId: number;

  @Column()
  sort: number;

  @Column({ default: 1 })
  status: number;

  @Column({ nullable: true })
  location: string;

  @Column({ name: 'short_name' })
  shortName: string;

  @Column({ name: 'origin_id' })
  originId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
