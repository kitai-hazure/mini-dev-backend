import { Module } from '@nestjs/common';
import { DataIngestorService } from './data_ingestor.service';
import { DataIngestorController } from './data_ingestor.controller';

@Module({
  controllers: [DataIngestorController],
  providers: [DataIngestorService],
})
export class DataIngestorModule {}
