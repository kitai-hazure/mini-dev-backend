import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    JwtModule.register({
      secret: 'thisisadarksecret',
    }),
  ],
})
export class UserModule {}
