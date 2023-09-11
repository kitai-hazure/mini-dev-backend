import { Module } from '@nestjs/common';
import { DataIngestorService } from './data_ingestor.service';
import { DataIngestorController } from './data_ingestor.controller';
import { UserService } from 'src/user/user.service';
import { JwtModule } from '@nestjs/jwt';
import { ENV } from 'src/constants/env';
@Module({
  controllers: [DataIngestorController],
  providers: [DataIngestorService, UserService],
  imports: [
    JwtModule.register({
      secret: ENV.JWT_SECRET,
    }),
  ],
})
export class DataIngestorModule {}
