import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Get,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { IChatType } from 'src/types/chat.type';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/auth/google')
  create(@Body('idtoken') idtoken: string) {
    return this.userService.create(idtoken);
  }
  @Get('/fetch')
  @UseGuards(AuthGuard)
  fetch(@Request() req) {
    return req.user;
  }

  @Get('/get/chats')
  @UseGuards(AuthGuard)
  getChats(@Request() req) {
    return this.userService.getChats(req.user);
  }

  @Post('/add/chat')
  @UseGuards(AuthGuard)
  addChat(@Request() req, @Body() chat: IChatType) {
    return this.userService.addChat(chat, req.user);
  }
}
