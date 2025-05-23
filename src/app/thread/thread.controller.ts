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
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ThreadsService } from './thread.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { createThreadDto, PagingQueryDto, ThreadUpdateDto } from './thread.dto';
import { MessageResponseInterceptor, ResponseInterceptor } from 'src/helpers/interceptors/respone.interceptor';
import { ResponseMessage } from 'src/helpers/decorators/response.message';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { Req } from '@nestjs/common';
import { Request } from 'express';
import { ThreadVisibilityType } from '@app/helpers/types/thread';

@Controller('threads')
@ApiTags('threads')
@ApiBearerAuth('access-token')
export class ThreadsController {
  private readonly logger = new Logger(ThreadsController.name);

  constructor(private threadService: ThreadsService) {}

  @Post('/create')
  @UseInterceptors(ResponseInterceptor)
  @ResponseMessage('thread created.')
  async createThread(@Body() createThreadDto: createThreadDto, @Req() req: Request) {
    const ownerId = createThreadDto.ownerId || (req.user as any)?._id;

    if (!ownerId) {
      throw new BadRequestException('Owner ID is required');
    }

    const thread = await this.threadService.createThread({
      ...createThreadDto,
      ownerId,
    });

    return {
      ...(thread as any).toObject(),
      qrCodeUrl: thread.qrCode,
    };
  }

  @Get('/getall')
  @UseInterceptors(ResponseInterceptor)
  @ResponseMessage('thread fetched.')
  async getAllThread(@Query() query: PagingQueryDto) {
    this.logger.log('[getAll: thread');
    const thread = await this.threadService.getAllThread(query);
    return thread;
  }

  @Get('/getById/:id')
  @UseInterceptors(ResponseInterceptor)
  @ResponseMessage('thread fetched')
  async getById(@Param('id') id: string) {
    const thread = await this.threadService.getById(id);
    if (!thread) {
      throw new HttpException('thread not found', HttpStatus.BAD_REQUEST);
    }
    return thread;
  }

  @Get('/getByOwner/:ownerId')
@UseInterceptors(ResponseInterceptor)
@ResponseMessage('Threads fetched by owner ID')
async getThreadsByOwnerId(@Param('ownerId') ownerId: string) {
  if (!ownerId) {
    throw new BadRequestException('Owner ID is required');
  }

  const threads = await this.threadService.getThreadsByOwnerId(ownerId);
  return threads;
}


@Get('/getByMember/:memberId')
@UseInterceptors(ResponseInterceptor)
@ResponseMessage('Threads fetched by member ID')
async getThreadsByMemberId(@Param('memberId') memberId: string) {
  if (!memberId) {
    throw new BadRequestException('Member ID is required');
  }

  const threads = await this.threadService.getThreadsByMemberId(memberId);
  return threads;
}


  @Put('/updateThread/:id')
  @UseInterceptors(MessageResponseInterceptor)
  @ResponseMessage('user updated')
  async updateThread(@Param('id') id: string, @Body() threadl: ThreadUpdateDto) {
    const updatedThread = await this.threadService.updateThread(id, threadl);
    return updatedThread;
  }

  @Delete('/deleteThread/:id')
  @UseInterceptors(MessageResponseInterceptor)
  @ResponseMessage('user removed')
  async deleteThread(@Param('id') id: string): Promise<string> {
    const thread = await this.threadService.DeleteThread(id);
    if (!thread) {
      throw new HttpException('thread not found', HttpStatus.BAD_REQUEST);
    }
    return 'thread removed';
  }

  @Post('/uploadImage/:id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './assets/images',
        filename: (req, file, cb) => {
          cb(null, file.originalname);
        },
      }),
    }),
  )
  async uploadImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('File not provided', HttpStatus.BAD_REQUEST);
    }

    const avatar = `assets/images/${file.originalname}`;
    return await this.threadService.addImage(id, avatar);
  }

  @Post('/scan/:threadId')
  @UseInterceptors(ResponseInterceptor)
  @ResponseMessage('Successfully joined thread')
  async scanThread(
    @Param('threadId') threadId: string,
    @Req() req: Request, // Use @Req() decorator and type it with Request from express
  ) {
    // Assuming you have user information in req.user after authentication
    const userId = req.user._id; // Adjust based on your auth setup

    const thread = await this.threadService.addMemberToThread(threadId, userId);
    return thread;
  }

  // @Delete('/deleteAll')
  // @UseInterceptors(MessageResponseInterceptor)
  // @ResponseMessage('All threads removed')
  // async deleteAllThreads(): Promise<string> {
  //   await this.threadService.removeAllThreads();
  //   return 'All threads removed';
  // }
}
