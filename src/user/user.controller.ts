import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Get,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'guards/auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/auth/google')
  create(@Request() req) {
    const idtoken = req.headers.idtoken;
    return this.userService.create(idtoken);
  }

  @Get('/fetch')
  @UseGuards(AuthGuard)
  fetch(@Request() req) {
    return req.user;
  }
}
