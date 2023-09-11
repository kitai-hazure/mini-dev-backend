import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  Request,
} from '@nestjs/common';
import { DataIngestorService } from './data_ingestor.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UserService } from 'src/user/user.service';
import { AuthGuard } from 'guards/auth.guard';
import { IChatType } from 'types/chat.type';

@Controller('data-ingestor')
export class DataIngestorController {
  constructor(
    private readonly dataIngestorService: DataIngestorService,
    private readonly userService: UserService,
  ) {}

  @Post('ingest')
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('files'))
  injectFile(@UploadedFiles() files: Array<Express.Multer.File>) {
    // this file will be a json file
    return this.dataIngestorService.injectFile(files);
  }

  @Post('query')
  @UseGuards(AuthGuard)
  async query(@Request() req, @Body() query) {
    const res = await this.dataIngestorService.query(query);
    const chat: IChatType = {
      chatBody: query,
    };
    await this.userService.addChat(chat, req.user);
    return {
      message: res,
    };
  }
}
