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
  ParseIntPipe,
} from '@nestjs/common';
import { ThreadsService } from './thread.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import {
  AddMembersDto,
  CreateBeadPurchaseRequestDto,
  CreateInviteDto,
  CreateMembershipRequestDto,
  createThreadDto,
  GetMembershipRequestsDto,
  PagingQueryDto,
  RespondToBeadPurchaseRequestDto,
  RespondToInviteDto,
  RespondToMembershipRequestDto,
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
  async getAllThread(
    @Query('page_size', ParseIntPipe) page_size: number,
    @Query('page_number', ParseIntPipe) page_number: number,
  ) {
    this.logger.log('[getAll: thread');
    const thread = await this.threadService.getAllThread(page_size, page_number);
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

  @Get('/get-invitations-by-email/:email')
  @UseInterceptors(ResponseInterceptor)
  @ResponseMessage('Thread invitations fetched by email')
  async getInvitationsByEmail(@Param('email') email: string) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const invitations = await this.threadService.getInvitationsByEmail(email);
    return invitations;
  }

  @Post('/request-bead-purchase')
  @UseInterceptors(ResponseInterceptor)
  @ResponseMessage('Bead purchase request submitted')
  async requestBeadPurchase(@Body() purchaseRequest: CreateBeadPurchaseRequestDto, @Req() req: Request) {
    // const buyerId = (req.user as any)?._id;
    // if (!buyerId) {
    //   throw new BadRequestException('Authentication required');
    // }

    return await this.threadService.createBeadPurchaseRequest(
      purchaseRequest.threadId,
      purchaseRequest.beadId,
      purchaseRequest.buyerId,
      purchaseRequest.offerPrice,
      purchaseRequest.message,
    );
  }

  @Get('/bead-purchase-requests/:beadId')
  @UseInterceptors(ResponseInterceptor)
  @ResponseMessage('Bead purchase requests fetched successfully')
  async getBeadPurchaseRequests(@Param('beadId') beadId: string) {
    return await this.threadService.getBeadPurchaseRequests(beadId);
  }

  @Post('/respond-to-bead-purchase')
  @UseInterceptors(ResponseInterceptor)
  @ResponseMessage('Bead purchase request response processed')
  async respondToBeadPurchase(@Body() body: RespondToBeadPurchaseRequestDto, @Req() req: Request) {
    // const userId = (req.user as any)?._id; // Uncomment if you want to verify the responder is the owner
    // if (!userId) {
    //   throw new BadRequestException('Authentication required');
    // }

    return await this.threadService.respondToBeadPurchase(body.requestId, body.accept, body.responseMessage);
  }

  @Get('/thread-purchase-requests/:threadId')
  @UseInterceptors(ResponseInterceptor)
  @ResponseMessage('Thread purchase requests fetched successfully')
  async getThreadPurchaseRequests(@Param('threadId') threadId: string) {
    return await this.threadService.getThreadPurchaseRequests(threadId);
  }

  @Get('/bead-requests/:email')
  @UseInterceptors(ResponseInterceptor)
  async getBeadRequestsByEmail(@Param('email') email: string) {
    return await this.threadService.getBeadPurchaseRequestsByEmail(email);
  }

  @Post('/membership-request')
  @UseInterceptors(ResponseInterceptor)
  @ResponseMessage('Membership request created successfully')
  async createMembershipRequest(@Body() createRequestDto: CreateMembershipRequestDto) {
    return await this.threadService.createMembershipRequest(
      createRequestDto.threadId,
      createRequestDto.userId,
      createRequestDto.message,
    );
  }

  @Post('/respond-to-membership-request')
  @UseInterceptors(ResponseInterceptor)
  @ResponseMessage('Membership request response processed')
  async respondToMembershipRequest(@Body() respondDto: RespondToMembershipRequestDto) {
    return await this.threadService.respondToMembershipRequest(
      respondDto.requestId,
      respondDto.threadId,
      respondDto.userId,
      respondDto.accept,
      respondDto.responseMessage,
    );
  }

  @Get('/membership-requests/by-owner-email')
  @UseInterceptors(ResponseInterceptor)
  @ResponseMessage('Membership requests fetched successfully')
  async getRequestsByOwnerEmail(@Query('email') email: string) {
    return await this.threadService.getRequestsByOwnerEmail(email);
  }

  // @Delete('/deleteAll')
  // @UseInterceptors(MessageResponseInterceptor)
  // @ResponseMessage('All threads removed')
  // async deleteAllThreads(): Promise<string> {
  //   await this.threadService.removeAllThreads();
  //   return 'All threads removed';
  // }
}
