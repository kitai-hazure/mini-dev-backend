import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { DataIngestorService } from './data_ingestor.service';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('data-ingestor')
export class DataIngestorController {
  constructor(private readonly dataIngestorService: DataIngestorService) {}

  @Post('ingest')
  @UseInterceptors(FilesInterceptor('files'))
  injectFile(@UploadedFiles() files: Array<Express.Multer.File>) {
    // this file will be a json file
    return this.dataIngestorService.injectFile(files);
  }

  @Post('query')
  query(@Body() query) {
    return this.dataIngestorService.query(query);
  }
}
