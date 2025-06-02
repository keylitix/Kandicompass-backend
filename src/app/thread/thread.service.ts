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
import { User } from '@app/models/user.schema';
import { BeadPurchaseRequest } from '@app/models/beadPurchaseRequest.schema';
import { Bead } from '@app/models/bead.schema';

@Injectable()
export class ThreadsService {
  private readonly logger = new Logger(ThreadsService.name);
  constructor(
    @InjectModel(Thread.name) private threadModel: Model<Thread>,
    @InjectModel('ThreadInvite') private inviteModel: Model<any>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Bead.name) private beadModel: Model<Bead>,
    @InjectModel(BeadPurchaseRequest.name) private beadPurchaseRequestModel: Model<BeadPurchaseRequest>,
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
    const qrCodeUrl = ` https://app.kandicompass.com/dashboard/thread/${threadId.toString()}?jt=HbdhyKPt5JK66yXIuo81ufgPRlOhivFiwj5PDVm2bmimcSEjWBOcQi`;
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

    const qrCodeUrl = ` https://app.kandicompass.com/dashboard/thread/${thread._id.toString()}?jt=HbdhyKPt5JK66yXIuo81ufgPRlOhivFiwj5PDVm2bmimcSEjWBOcQi`;
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
          totalMembers: { $size: '$members' },
          totalBeads: { $size: '$beads' },
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
      // {
      //   $lookup: {
      //     from: 'users',
      //     localField: 'ownerId',
      //     foreignField: '_id',
      //     as: 'owner',
      //   },
      // },
      // { $unwind: '$owner' },
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
          totalMembers: { $size: '$members' },
          totalBeads: { $size: '$beads' },
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
          totalMembers: { $size: '$members' },
          totalBeads: { $size: '$beads' },
        },
      },
    ]);

    return threads;
  }

  async getThreadsByMemberId(memberId: string): Promise<Thread[]> {
    const threads = await this.threadModel.aggregate([
      {
        $match: {
          members: new Types.ObjectId(memberId),
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
          totalMembers: { $size: '$members' },
          totalBeads: { $size: '$beads' },
        },
      },
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

    let userId = null;
    if (email) {
      const user = await this.userModel.findOne({ email });
      if (user) {
        userId = user._id;

        // ✅ Check for existing pending invite by threadId and userId
        const existingInvite = await this.inviteModel.findOne({
          threadId,
          userId,
          status: 'pending',
        });

        if (existingInvite) {
          throw new HttpException('A pending invite already exists for this user and thread', HttpStatus.CONFLICT);
        }
      } else {
        // ✅ Check for existing pending invite by threadId and email if user not found
        const existingInvite = await this.inviteModel.findOne({
          threadId,
          email,
          status: 'pending',
        });

        if (existingInvite) {
          throw new HttpException('A pending invite already exists for this email and thread', HttpStatus.CONFLICT);
        }
      }
    }

    const invite = await this.inviteModel.create({
      threadId,
      threadName: thread.threadName,
      email,
      userId,
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

  async respondToInvite(inviteId: string, _: string, accept: boolean) {
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
      if (!invite.userId) {
        throw new HttpException('Invite does not have a userId to add to the thread', HttpStatus.BAD_REQUEST);
      }

      const thread = await this.threadModel.findById(invite.threadId);

      if (!thread) {
        throw new HttpException('Thread not found', HttpStatus.NOT_FOUND);
      }

      // ✅ Check if user is already a member
      const isAlreadyMember = thread.members?.some(memberId => memberId.toString() === invite.userId.toString());

      if (isAlreadyMember) {
        // Update status just for recordkeeping
        invite.status = 'accepted';
        await invite.save();

        return {
          success: true,
          threadId: invite.threadId,
          status: 'accepted',
          message: 'User is already a member of the thread',
        };
      }

      // Add user to thread if not already a member
      await this.threadModel.findByIdAndUpdate(invite.threadId, {
        $addToSet: { members: new Types.ObjectId(invite.userId) },
      });
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

  async getInvitationsByEmail(email: string): Promise<any[]> {
    if (!email || !email.includes('@')) {
      throw new HttpException('Invalid email format', HttpStatus.BAD_REQUEST);
    }

    const invites = await this.inviteModel.aggregate([
      {
        $match: {
          email: email,
          // status: 'pending',
          // expiresAt: { $gt: new Date() } // Only include non-expired invites
        },
      },
      // {
      //   $lookup: {
      //     from: 'threads',
      //     localField: 'threadId',
      //     foreignField: '_id',
      //     as: 'threadId'
      //   }
      // },
      // { $unwind: '$threadId' },
      { $sort: { createdAt: -1 } },
    ]);

    if (!invites || invites.length === 0) {
      throw new HttpException('No pending invitations found for this email', HttpStatus.NOT_FOUND);
    }

    return invites;
  }

  async createBeadPurchaseRequest(
    threadId: string,
    beadId: string,
    buyerId: string,
    offerPrice: number,
    message?: string,
  ): Promise<any> {
    if (!Types.ObjectId.isValid(threadId) || !Types.ObjectId.isValid(beadId) || !Types.ObjectId.isValid(buyerId)) {
      throw new HttpException('Invalid ID format', HttpStatus.BAD_REQUEST);
    }

    const threadObjectId = new Types.ObjectId(threadId);
    const beadObjectId = new Types.ObjectId(beadId);
    const buyerObjectId = new Types.ObjectId(buyerId);

    const thread = await this.threadModel.findOne({
      _id: threadObjectId,
      beads: beadObjectId,
    });

    if (!thread) {
      throw new HttpException('Thread or bead not found', HttpStatus.NOT_FOUND);
    }

    const isMember = thread.members.some(member => {
      if (member instanceof Types.ObjectId) {
        return member.equals(buyerObjectId);
      } else {
        const m = member as { _id: Types.ObjectId };
        return m._id.equals(buyerObjectId);
      }
    });

    if (!isMember) {
      throw new HttpException('Buyer is not a member of this thread', HttpStatus.FORBIDDEN);
    }

    const existingRequest = await this.beadPurchaseRequestModel.findOne({
      beadId: beadObjectId,
      buyerId: buyerObjectId,
      status: 'pending',
    });

    if (existingRequest) {
      throw new HttpException('You already have a pending request for this bead', HttpStatus.CONFLICT);
    }

    const purchaseRequest = await this.beadPurchaseRequestModel.create({
      threadId: threadObjectId,
      beadId: beadObjectId,
      buyerId: buyerObjectId,
      offerPrice,
      message,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      success: true,
      requestId: purchaseRequest._id,
      message: 'Purchase request submitted successfully',
    };
  }

  async getBeadPurchaseRequests(beadId: string): Promise<any> {
    if (!Types.ObjectId.isValid(beadId)) {
      throw new HttpException('Invalid bead ID', HttpStatus.BAD_REQUEST);
    }

    return await this.beadPurchaseRequestModel.aggregate([
      {
        $match: {
          beadId: new Types.ObjectId(beadId),
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'buyerId',
          foreignField: '_id',
          as: 'buyer',
        },
      },
      { $unwind: '$buyer' },
      {
        $project: {
          _id: 1,
          offerPrice: 1,
          message: 1,
          status: 1,
          createdAt: 1,
          respondedAt: 1,
          responseMessage: 1,
          'buyer._id': 1,
          'buyer.fullName': 1,
          'buyer.profilePicture': 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
  }

  async respondToBeadPurchase(requestId: string, accept: boolean, responseMessage?: string): Promise<any> {
    if (!Types.ObjectId.isValid(requestId)) {
      throw new HttpException('Invalid request ID', HttpStatus.BAD_REQUEST);
    }

    const request = await this.beadPurchaseRequestModel.findById(requestId);
    if (!request) {
      throw new HttpException('Purchase request not found', HttpStatus.NOT_FOUND);
    }

    if (request.status !== 'pending') {
      throw new HttpException('Request has already been processed', HttpStatus.BAD_REQUEST);
    }

    const bead = await this.beadModel.findById(request.beadId);
    if (!bead) {
      throw new HttpException('Bead not found', HttpStatus.NOT_FOUND);
    }

    if (accept) {
      // Verify the buyer exists
      const buyerExists = await this.userModel.exists({ _id: request.buyerId });
      if (!buyerExists) {
        throw new HttpException('Buyer not found', HttpStatus.NOT_FOUND);
      }

      // Update the ownerId reference
      bead.ownerId = request.buyerId; // This should be a Types.ObjectId
      await bead.save();
    }

    // Update request status
    request.status = accept ? 'accepted' : 'rejected';
    request.responseMessage = responseMessage;
    request.respondedAt = new Date();
    await request.save();

    return {
      success: true,
      status: request.status,
      message: `Purchase request ${accept ? 'accepted' : 'rejected'}`,
      beadId: bead._id,
      newOwnerId: accept ? request.buyerId : bead.ownerId,
    };
  }

  async getThreadPurchaseRequests(threadId: string): Promise<any> {
    if (!Types.ObjectId.isValid(threadId)) {
      throw new HttpException('Invalid thread ID', HttpStatus.BAD_REQUEST);
    }

    return await this.beadPurchaseRequestModel.aggregate([
      {
        $match: {
          threadId: new Types.ObjectId(threadId),
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'buyerId',
          foreignField: '_id',
          as: 'buyer',
        },
      },
      { $unwind: '$buyer' },
      {
        $lookup: {
          from: 'beads',
          localField: 'beadId',
          foreignField: '_id',
          as: 'bead',
        },
      },
      { $unwind: '$bead' },
      {
        $project: {
          _id: 1,
          offerPrice: 1,
          message: 1,
          status: 1,
          createdAt: 1,
          respondedAt: 1,
          responseMessage: 1,
          'buyer._id': 1,
          'buyer.fullName': 1,
          'buyer.profilePicture': 1,
          'bead._id': 1,
          'bead.name': 1,
          'bead.image': 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
  }

  // async removeAllThreads(): Promise<void> {
  //   await this.threadModel.deleteMany({}, { $set: { is_deleted: true } });
  // }
}
