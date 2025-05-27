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
  BadRequestException,
} from '@nestjs/common';
import { ThreadsService } from './thread.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import {
  AddMembersDto,
  CreateInviteDto,
  createThreadDto,
  PagingQueryDto,
  RespondToInviteDto,
  ThreadUpdateDto,
} from './thread.dto';
import { MessageResponseInterceptor, ResponseInterceptor } from 'src/helpers/interceptors/respone.interceptor';
import { ResponseMessage } from 'src/helpers/decorators/response.message';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { Req } from '@nestjs/common';
import { Request } from 'express';

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

  @Post('/:threadId/add-members')
  @UseInterceptors(ResponseInterceptor)
  @ResponseMessage('Members added to thread successfully')
  async addMembersToThread(@Param('threadId') threadId: string, @Body() addMembersDto: AddMembersDto) {
    if (!threadId) {
      throw new BadRequestException('Thread ID is required');
    }

    const updatedThread = await this.threadService.addMembersToThread(threadId, addMembersDto.memberIds);
    return updatedThread;
  }

  @Delete('/:threadId/remove-members')
  @UseInterceptors(ResponseInterceptor)
  @ResponseMessage('Members removed from thread successfully')
  async removeMembersFromThread(@Param('threadId') threadId: string, @Body() removeMembersDto: AddMembersDto) {
    if (!threadId) {
      throw new BadRequestException('Thread ID is required');
    }

    const updatedThread = await this.threadService.removeMembersFromThread(threadId, removeMembersDto.memberIds);
    return updatedThread;
  }

  @Post('/create-invite')
  @UseInterceptors(ResponseInterceptor)
  @ResponseMessage('Invite created successfully')
  async createInvite(@Body() createInviteDto: CreateInviteDto, @Req() req: Request) {
    const result = await this.threadService.createInvite(createInviteDto.threadId, createInviteDto.email);

    return {
      inviteId: result.inviteId,
      token: result.token,
      // Include this in your frontend URL: `/accept-invite?token=${result.token}`
    };
  }

  @Post('/respond-to-invite')
  @UseInterceptors(ResponseInterceptor)
  @ResponseMessage('Invitation response processed')
  @ApiBody({ type: RespondToInviteDto })
  async respondToInvite(@Body() body: RespondToInviteDto, @Req() req: Request) {
    const userId = (req.user as any)?._id;
    // if (!userId) {
    //   throw new BadRequestException('Authentication required');
    // }

    return await this.threadService.respondToInvite(body.inviteId, userId, body.accept);
  }

  // @Delete('/deleteAll')
  // @UseInterceptors(MessageResponseInterceptor)
  // @ResponseMessage('All threads removed')
  // async deleteAllThreads(): Promise<string> {
  //   await this.threadService.removeAllThreads();
  //   return 'All threads removed';
  // }
}
