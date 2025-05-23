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

@Injectable()
export class ThreadsService {
  private readonly logger = new Logger(ThreadsService.name);
  constructor(@InjectModel(Thread.name) private threadModel: Model<Thread>) {}

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

  async addMemberToThread(threadId: string, userId: string): Promise<Thread> {
    const thread = await this.threadModel.findById(threadId);
    if (!thread) {
      throw new HttpException('Thread not found', HttpStatus.NOT_FOUND);
    }

    // Check if user is already a member
    if (!thread.members.includes(userId)) {
      thread.members.push(userId);
      await thread.save();
    }

    return thread;
  }

  // async removeAllThreads(): Promise<void> {
  //   await this.threadModel.deleteMany({}, { $set: { is_deleted: true } });
  // }
}
