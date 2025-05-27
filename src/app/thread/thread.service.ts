import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Thread } from '../../models/thread.schema';
import { ThreadUpdateDto, createThreadDto } from './thread.dto';
import { Observable } from 'rxjs';
import { isValidString } from 'src/utils/string';
import * as QRCode from 'qrcode';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

@Injectable()
export class ThreadsService {
  private readonly logger = new Logger(ThreadsService.name);
  constructor(
    @InjectModel(Thread.name) private threadModel: Model<Thread>,
    @InjectModel('ThreadInvite') private inviteModel: Model<any>,
  ) {}

  private async generateQRCode(link: string, threadId: string): Promise<string> {
    try {
      const qrDir = path.join(process.cwd(), 'assets', 'qr');
      if (!fs.existsSync(qrDir)) {
        fs.mkdirSync(qrDir, { recursive: true });
      }

      const qrFilePath = path.join(qrDir, `${threadId}.png`);

      await QRCode.toFile(qrFilePath, link, {
        color: {
          dark: '#000',
          light: '#0000',
        },
      });

      return `assets/qr/${threadId}.png`;
    } catch (err) {
      this.logger.error(`Failed to generate QR code: ${err}`);
      throw new HttpException('QR code generation failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async build(model: createThreadDto) {
    const { threadName, visibility, description, members, ownerId, beads } = model;

    const thread = await new this.threadModel({
      threadName,
      visibility,
      description,
      members,
      ownerId,
      beads,
    }).save();

    const threadId = new Types.ObjectId().toString();
    const qrCodeUrl = `https://kandi-web.cradle.services/dashboard/thread/${threadId.toString()}`;
    const qrCode = await this.generateQRCode(qrCodeUrl, thread._id.toString());

    thread.qrCode = qrCode;
    await thread.save();
    return thread;
  }

  async createThread(createThreadDto: createThreadDto): Promise<Thread> {
    const { threadName, visibility, description, members, ownerId, beads } = createThreadDto;

    const thread = await new this.threadModel({
      threadName,
      visibility,
      description: description || '',
      members: members || [],
      ownerId,
      beads: beads || [],
    }).save();

    const qrCodeUrl = `https://kandi-web.cradle.services/dashboard/thread/${thread._id.toString()}`;
    const qrCode = await this.generateQRCode(qrCodeUrl, thread._id.toString());

    thread.qrCode = qrCode;
    await thread.save();

    return thread;
  }

  async getAllThread(queryParams: any): Promise<{
    data: Thread[];
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
  }> {
    let { page_no = '1', page_size = '50' } = queryParams;

    const page = Number(page_no);
    const limit = Number(page_size);
    const skip = (page - 1) * limit;

    const total = await this.threadModel.countDocuments({ is_deleted: false });

    const threads = await this.threadModel.aggregate([
      {
        $match: {
          is_deleted: false,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'ownerId',
          foreignField: '_id',
          as: 'ownerId',
        },
      },
      {
        $lookup: {
          from: 'beads',
          localField: 'beads',
          foreignField: '_id',
          as: 'beads',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'members',
          foreignField: '_id',
          as: 'members',
        },
      },
      {
        $addFields: {
          memberCount: { $size: '$members' },
        },
      },
      { $skip: skip },
      { $limit: limit },
    ]);

    return {
      data: threads,
      pagination: {
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string): Promise<Thread[]> {
    const thread = await this.threadModel.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(id),
          is_deleted: false,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'ownerId',
          foreignField: '_id',
          as: 'owner',
        },
      },
      { $unwind: '$owner' },
      {
        $lookup: {
          from: 'beads',
          localField: 'beads',
          foreignField: '_id',
          as: 'beads',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'members',
          foreignField: '_id',
          as: 'members',
        },
      },
    ]);
    return thread;
  }

  async getThreadsByOwnerId(ownerId: string): Promise<Thread[]> {
    if (!Types.ObjectId.isValid(ownerId)) {
      throw new HttpException('Invalid owner ID', HttpStatus.BAD_REQUEST);
    }

    const threads = await this.threadModel.aggregate([
      {
        $match: {
          ownerId: new Types.ObjectId(ownerId),
          is_deleted: false,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'ownerId',
          foreignField: '_id',
          as: 'owner',
        },
      },
      {
        $unwind: {
          path: '$owner',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'beads',
          localField: 'beads',
          foreignField: '_id',
          as: 'beads',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'members',
          foreignField: '_id',
          as: 'members',
        },
      },
      {
        $addFields: {
          memberCount: { $size: '$members' },
        },
      },
    ]);

    return threads;
  }

  async getThreadsByMemberId(memberId: string): Promise<Thread[]> {
    const threads = await this.threadModel.aggregate([
      {
        $match: {
          members: memberId,
          is_deleted: false,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'ownerId',
          foreignField: '_id',
          as: 'owner',
        },
      },
      {
        $unwind: {
          path: '$owner',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'beads',
          localField: 'beads',
          foreignField: '_id',
          as: 'beads',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'members',
          foreignField: '_id',
          as: 'members',
        },
      },
      // {
      //   $addFields: {
      //     memberCount: { $size: '$members' },
      //   },
      // },
    ]);

    return threads;
  }

  async updateThread<T>(id: T | string, model: ThreadUpdateDto): Promise<Thread> {
    const thread = await this.threadModel.findById({ _id: id });
    if (!thread) {
      throw new HttpException('thread not found', HttpStatus.BAD_REQUEST);
    }
    if (
      isValidString(
        model.threadName !== 'string' && model.threadName !== '' && model.threadName !== undefined && model.threadName,
      )
    ) {
      thread.threadName = model.threadName;
    }

    // if (
    //   isValidString(
    //     model.threadId !== 'string' && model.threadId !== '' && model.threadId !== undefined && model.threadId,
    //   )
    // ) {
    //   thread.threadId = model.threadId;
    // }

    // if (
    //   isValidString(
    //     model.charmLocation !== 'string' &&
    //     model.charmLocation !== '' &&
    //     model.charmLocation !== undefined &&
    //     model.charmLocation,
    //   )
    // ) {
    //   thread.charmLocation = model.charmLocation;
    // }

    await thread.save();
    return thread;
  }

  async DeleteThread(id: string): Promise<Thread | Observable<Thread | any>> {
    const thread = await this.threadModel.findByIdAndDelete(id);
    if (!thread) {
      throw new HttpException('Thread not found', HttpStatus.BAD_REQUEST);
    }

    return thread;
  }

  async addImage(id: string, avatar: string): Promise<Thread> {
    const user = await this.threadModel.findById(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }
    user.avatar = avatar;
    await user.save();
    return user;
  }

  async addMembersToThread(threadId: string, memberIds: string[]): Promise<Thread> {
    if (!Types.ObjectId.isValid(threadId)) {
      throw new HttpException('Invalid thread ID', HttpStatus.BAD_REQUEST);
    }

    const invalidMemberIds = memberIds.filter(id => !Types.ObjectId.isValid(id));
    if (invalidMemberIds.length > 0) {
      throw new HttpException(`Invalid member IDs: ${invalidMemberIds.join(', ')}`, HttpStatus.BAD_REQUEST);
    }

    const thread = await this.threadModel.findById(threadId);
    if (!thread) {
      throw new HttpException('Thread not found', HttpStatus.NOT_FOUND);
    }

    const memberObjectIds = memberIds.map(id => new Types.ObjectId(id));

    const existingMemberIds = thread.members.map(member => member.toString());
    const newMembers = memberObjectIds.filter(memberId => !existingMemberIds.includes(memberId.toString()));

    if (newMembers.length === 0) {
      throw new HttpException('All provided members are already in the thread', HttpStatus.BAD_REQUEST);
    }

    thread.members = [...thread.members, ...newMembers];
    await thread.save();

    return thread;
  }

  async removeMembersFromThread(threadId: string, memberIds: string[]): Promise<Thread> {
    if (!Types.ObjectId.isValid(threadId)) {
      throw new HttpException('Invalid thread ID', HttpStatus.BAD_REQUEST);
    }

    const invalidMemberIds = memberIds.filter(id => !Types.ObjectId.isValid(id));
    if (invalidMemberIds.length > 0) {
      throw new HttpException(`Invalid member IDs: ${invalidMemberIds.join(', ')}`, HttpStatus.BAD_REQUEST);
    }

    const thread = await this.threadModel.findById(threadId);
    if (!thread) {
      throw new HttpException('Thread not found', HttpStatus.NOT_FOUND);
    }

    const memberObjectIds = memberIds.map(id => new Types.ObjectId(id));

    thread.members = thread.members.filter(memberId => !memberObjectIds.some(id => id.equals(memberId)));

    await thread.save();
    return thread;
  }

  async createInvite(threadId: string, email?: string): Promise<{ inviteId: string; token: string }> {
    const thread = await this.threadModel.findById(threadId);
    if (!thread) {
      throw new HttpException('Thread not found', HttpStatus.NOT_FOUND);
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invite = await this.inviteModel.create({
      threadId,
      threadName: thread.threadName,
      email,
      token,
      expiresAt,
      status: 'pending',
      createdAt: new Date(),
    });

    return {
      inviteId: invite._id.toString(),
      token: invite.token,
    };
  }

  async respondToInvite(inviteId: string, userId: string, accept: boolean) {
    if (!Types.ObjectId.isValid(inviteId)) {
      throw new HttpException('Invalid invite ID format', HttpStatus.BAD_REQUEST);
    }

    const invite = await this.inviteModel.findById(inviteId);
    if (!invite) {
      throw new HttpException('Invite not found', HttpStatus.NOT_FOUND);
    }

    if (invite.status !== 'pending') {
      throw new HttpException('Invite already processed', HttpStatus.BAD_REQUEST);
    }

    if (new Date() > invite.expiresAt) {
      throw new HttpException('Invite has expired', HttpStatus.BAD_REQUEST);
    }

    if (accept) {
      await this.threadModel.findByIdAndUpdate(invite.threadId, { $addToSet: { members: new Types.ObjectId(userId) } });
    }

    invite.status = accept ? 'accepted' : 'declined';
    await invite.save();

    return {
      success: true,
      threadId: invite.threadId,
      status: invite.status,
    };
  }

  async getInviteById(inviteId: string): Promise<any> {
    if (!Types.ObjectId.isValid(inviteId)) {
      throw new HttpException('Invalid invite ID', HttpStatus.BAD_REQUEST);
    }

    const invite = await this.inviteModel.findById(inviteId);
    if (!invite) {
      throw new HttpException('Invite not found', HttpStatus.NOT_FOUND);
    }

    return invite;
  }

  // async removeAllThreads(): Promise<void> {
  //   await this.threadModel.deleteMany({}, { $set: { is_deleted: true } });
  // }
}
