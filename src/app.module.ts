import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataIngestorModule } from './data_ingestor/data_ingestor.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DataIngestorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
