import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegrafModule } from 'nestjs-telegraf';
import { AppUpdate } from './bot/app.update';
import { AppService } from './bot/app.service';
import { ConfigModule } from '@nestjs/config'
import { User } from './bot/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal:true}),
    TelegrafModule.forRoot({
      token: '8344132477:AAH1On8dasFmGAUTWmi5j_h-1Imjod2EdXE',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres', 
      password: '10102376', 
      database: 'fast_food_db', 
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, 
    }),
    TypeOrmModule.forFeature([User])
  ],
  providers: [AppUpdate,AppService ],
})
export class AppModule {}