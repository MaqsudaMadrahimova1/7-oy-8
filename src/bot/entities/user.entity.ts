import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint', unique: true }) 
  telegramId: number;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ type: 'jsonb', nullable: true })
  location: any;
}