import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getUserFromToken } from 'service/firebase-service';

@Injectable()
export class UserService {
  constructor(private jwtService: JwtService) {}
  async create(idtoken: string) {
    const user = await getUserFromToken(idtoken);
    const payload = {
      email: user.email,
      uid: user.uid,
    };

    const jwt = await this.jwtService.sign(payload);

    return jwt;
  }
}
