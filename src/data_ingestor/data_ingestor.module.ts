import { Module } from '@nestjs/common';
import { DataIngestorService } from './data_ingestor.service';
import { DataIngestorController } from './data_ingestor.controller';
import { UserService } from 'src/user/user.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [DataIngestorController],
  providers: [DataIngestorService, UserService],
  imports: [
    JwtModule.register({
      secret: 'thisisadarksecret',
    }),
  ],
})
export class DataIngestorModule {}
