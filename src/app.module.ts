import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataIngestorModule } from './data_ingestor/data_ingestor.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';

@Module({
  imports: [ConfigModule.forRoot(), DataIngestorModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
