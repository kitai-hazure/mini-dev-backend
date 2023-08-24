import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getUserFromToken } from '../service/firebase-service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtServ: JwtService) {}
  async canActivate(context: ExecutionContext) {
    try {
      const ctx = context.switchToHttp();
      const req = ctx.getRequest();
      if (!req.headers.authorization) return false;
      const token = req.headers.authorization.split(' ')[1];
      const payload = this.jwtServ.verify(token);

      const user = await getUserFromToken(payload.uid);
      if (!user) return false;
      console.log('USER FROM TOKEN: ', user);
      req.user = user;
      if (payload) {
        return true;
      }
      return false;
    } catch (err) {
      console.log('ERROR IN AUTH GUARD: ', err);
      return false;
    }
  }
}
