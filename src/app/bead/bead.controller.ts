import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  Logger,
  Param,
  Put,
  Delete,
  UseInterceptors,
  HttpException,
  HttpStatus,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { BeadsService } from './bead.service';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { createBeadDto, PagingQueryDto, BeadUpdateDto } from './bead.dto';
import { MessageResponseInterceptor, ResponseInterceptor } from 'src/helpers/interceptors/respone.interceptor';
import { ResponseMessage } from 'src/helpers/decorators/response.message';
import { diskStorage } from 'multer';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

@Controller('beads')
@ApiTags('beads')
export class BeadsController {
  private readonly logger = new Logger(BeadsController.name);

  constructor(private beadService: BeadsService) {}

  @Post('/create')
  @UseInterceptors(ResponseInterceptor)
  @ResponseMessage('bead created.')
  async createBead(@Body() beadl: createBeadDto) {
    const bead = await this.beadService.createBead(beadl);
    return {
      ...bead,
      qrCodeUrl: bead.qrCode,
    };
  }

  @Get('/getall')
  @UseInterceptors(ResponseInterceptor)
  @ResponseMessage('bead fetched.')
  async getAllBead(@Query() query: PagingQueryDto) {
    this.logger.log('[getAll: bead');
    const bead = await this.beadService.getAllBead(query);
    return bead;
  }

  @Get('/getById/:id')
  @UseInterceptors(ResponseInterceptor)
  @ResponseMessage('bead fetched')
  async getById(@Param('id') id: string) {
    const bead = await this.beadService.getById(id);
    if (!bead) {
      throw new HttpException('bead not found', HttpStatus.BAD_REQUEST);
    }
    return bead;
  }

  @Get('/by-thread/:threadId')
  @UseInterceptors(ResponseInterceptor)
  @ResponseMessage('beads by thread fetched')
  async getBeadsByThread(
    @Param('threadId') threadId: string,
    @Query('page_no') pageNo: string,
    @Query('page_size') pageSize: string,
  ) {
    return await this.beadService.getBeadsByThreadId(threadId, Number(pageNo), Number(pageSize));
  }

  @Put('/updateBead/:id')
  @UseInterceptors(MessageResponseInterceptor)
  @ResponseMessage('user updated')
  async updateBead(@Param('id') id: string, @Body() beadl: BeadUpdateDto) {
    const updatedBead = await this.beadService.updateBead(id, beadl);
    return updatedBead;
  }

  @Delete('/deleteBead/:id')
  @UseInterceptors(MessageResponseInterceptor)
  @ResponseMessage('user removed')
  async deleteBead(@Param('id') id: string): Promise<string> {
    const bead = await this.beadService.DeleteBead(id);
    if (!bead) {
      throw new HttpException('bead not found', HttpStatus.BAD_REQUEST);
    }
    return 'bead removed';
  }

  @Post('/uploadImage/:id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      storage: diskStorage({
        destination: './assets/images',
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  async uploadImagesToBead(@Param('id') id: string, @UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new HttpException('No files uploaded', HttpStatus.BAD_REQUEST);
    }

    const imagePaths = files.map(file => `assets/images/${file.filename}`);
    return await this.beadService.addImages(id, imagePaths);
  }

  // @Delete('/deleteAll')
  // @UseInterceptors(MessageResponseInterceptor)
  // @ResponseMessage('All beads removed')
  // async deleteAllBeads(): Promise<string> {
  //   await this.beadService.removeAllBeads();
  //   return 'All beads removed';
  // }
}
