import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Bead } from '../../models/bead.schema';
import { BeadUpdateDto, createBeadDto } from './bead.dto';
import { Observable } from 'rxjs';
import { isValidString } from 'src/utils/string';
import * as QRCode from 'qrcode';
import * as path from 'path';
import * as fs from 'fs';
import { Thread } from '@app/models/thread.schema';
import { FeedPost } from '@app/models/feed.schema';
import { User } from '@app/models/user.schema';
import { Like } from '@app/models/like.schema';
import { Comment } from '@app/models/comment.schema';

@Injectable()
export class BeadsService {
  private readonly logger = new Logger(BeadsService.name);
  constructor(
    @InjectModel(Bead.name) private beadModel: Model<Bead>,
    @InjectModel(Thread.name) private threadModel: Model<Thread>,
    @InjectModel(FeedPost.name) private feedPostModel: Model<FeedPost>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Like.name) private likeModel: Model<Like>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
  ) {}

  private async generateQRCode(beadData: any, beadId: string): Promise<string> {
    try {
      const qrDir = path.join(process.cwd(), 'assets', 'qr');
      if (!fs.existsSync(qrDir)) {
        fs.mkdirSync(qrDir, { recursive: true });
      }

      const dataString = beadData.link;

      const qrFilePath = path.join(qrDir, `${beadId}.png`);

      await QRCode.toFile(qrFilePath, dataString, {
        color: {
          dark: '#000',
          light: '#0000',
        },
      });

      return `assets/qr/${beadId}.png`;
    } catch (err) {
      this.logger.error(`Failed to generate QR code: ${err}`);
      throw new HttpException('QR code generation failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async build(model: createBeadDto) {
    if (model.threadId) {
      const threadExists = await this.threadModel.exists({ _id: model.threadId });
      if (!threadExists) {
        throw new HttpException('Thread not found', HttpStatus.BAD_REQUEST);
      }
    }

    const {
      beadName,
      beadType,
      description,
      material,
      color,
      size,
      shape,
      supplier,
      weight,
      finish,
      quantity,
      pricePerUnit,
      productCode,
      threadId,
      ownerId,
      ownershipHistory,
      stories,
      reviews,
    } = model;

    const bead = await new this.beadModel({
      beadName,
      beadType,
      description,
      material,
      color,
      size,
      shape,
      supplier,
      weight,
      finish,
      quantity,
      pricePerUnit,
      productCode,
      threadId,
      ownerId,
      ownershipHistory,
      stories,
      reviews,
    }).save();

    const link = `https://kandi-web.cradle.services/dashboard/charms/${bead._id.toString()}`;
    bead.link = link;

    const qrPath = await this.generateQRCode({ link }, bead._id.toString());
    bead.qrCode = qrPath;
    await bead.save();

    const user = await this.userModel.findOne({ _id: ownerId, is_deleted: false }).lean();

    await this.feedPostModel.create({
      type: 'bead_created',
      beadId: bead._id.toString(),
      beadName: bead.beadName,
      beadImage: bead.images?.[0] ?? '/bead-image.png',
      userId: bead.ownerId.toString(),
      content: [
        {
          type: 'text',
          content: bead.description || '',
        },
        ...(bead.images?.length
          ? [
              {
                type: 'image',
                content: bead.images[0],
              },
            ]
          : []),
      ],
      location: {
        lat: 0,
        lng: 0,
        address: 'Optional Location',
      },
    });

    if (model.threadId) {
      await this.threadModel.findByIdAndUpdate(model.threadId, { $addToSet: { beads: bead._id } }, { new: true });
    }

    return bead;
  }

  async createBead(model: createBeadDto): Promise<any> {
    const bead = await this.build(model);
    if (!bead) {
      throw new HttpException('bead not found', HttpStatus.BAD_REQUEST);
    }
    const plainBead = bead.toObject();
    return {
      ...plainBead,
      qrCodeUrl: plainBead.qrCode,
    };
  }

  async getAllBead(
    page_size: number,
    page_number: number,
  ): Promise<{
    data: Bead[];
    // pagination: {
    //   total: number;
    //   page: number;
    //   pageSize: number;
    //   totalPages: number;
    // };
  }> {
    // let { page_no = '1', page_size = '50' } = queryParams;

    // const page = Number(page_no);
    // const limit = Number(page_size);
    const skip = (page_number - 1) * page_size;

    const total = await this.beadModel.countDocuments({ is_deleted: false });

    const all_bead = await this.beadModel.aggregate([
      {
        $match: {
          is_deleted: false,
        },
      },
      {
        $lookup: {
          from: 'threads',
          localField: 'threadId',
          foreignField: '_id',
          as: 'threadId',
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
        $addFields: {
          thumbnail: {
            $cond: {
              if: { $gt: [{ $size: '$images' }, 0] },
              then: { $arrayElemAt: ['$images', 0] },
              else: null,
            },
          },
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: page_size,
      },
      // {
      //   $limit: limit,
      // },
    ]);
    return {
      data: all_bead,
      // pagination: {
      //   total,
      //   page,
      //   pageSize: limit,
      //   totalPages: Math.ceil(total / limit),
      // },
    };
  }

  async getById(id: string): Promise<Bead[]> {
    const bead = await this.beadModel.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(id),
        },
      },
      {
        $match: {
          is_deleted: false,
        },
      },
      {
        $lookup: {
          from: 'threads',
          localField: 'threadId',
          foreignField: '_id',
          as: 'threadId',
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
        $addFields: {
          thumbnail: {
            $cond: {
              if: { $gt: [{ $size: '$images' }, 0] },
              then: { $arrayElemAt: ['$images', 0] },
              else: null,
            },
          },
        },
      },
    ]);
    return bead;
  }

  async getBeadsByThreadId(
    threadId: string,
    page_no = 1,
    page_size = 50,
  ): Promise<{
    data: Bead[];
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
  }> {
    if (!Types.ObjectId.isValid(threadId)) {
      throw new HttpException('Invalid thread ID', HttpStatus.BAD_REQUEST);
    }

    const page = Number(page_no);
    const limit = Number(page_size);
    const skip = (page - 1) * limit;

    const total = await this.beadModel.countDocuments({
      threadId: new Types.ObjectId(threadId),
      is_deleted: false,
    });

    const beads = await this.beadModel.aggregate([
      {
        $match: {
          threadId: new Types.ObjectId(threadId),
          is_deleted: false,
        },
      },
      {
        $lookup: {
          from: 'threads',
          localField: 'threadId',
          foreignField: '_id',
          as: 'threadId',
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
        $addFields: {
          thumbnail: {
            $cond: {
              if: { $gt: [{ $size: '$images' }, 0] },
              then: { $arrayElemAt: ['$images', 0] },
              else: null,
            },
          },
        },
      },
      { $skip: skip },
      { $limit: limit },
    ]);

    return {
      data: beads,
      pagination: {
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateBead<T>(id: T | string, model: BeadUpdateDto): Promise<Bead> {
    const bead = await this.beadModel.findById({ _id: id });
    if (!bead) {
      throw new HttpException('bead not found', HttpStatus.BAD_REQUEST);
    }
    if (
      isValidString(
        model.beadName !== 'string' && model.beadName !== '' && model.beadName !== undefined && model.beadName,
      )
    ) {
      bead.beadName = model.beadName;
    }
    if (
      isValidString(
        model.beadType !== 'string' && model.beadType !== '' && model.beadType !== undefined && model.beadType,
      )
    ) {
      bead.beadType = model.beadType;
    }
    if (model.weight) {
      bead.weight = model.weight;
    }

    if (model.pricePerUnit) {
      bead.pricePerUnit = model.pricePerUnit;
    }

    if (model.quantity) {
      bead.quantity = model.quantity;
    }

    if (model.size) {
      bead.size = model.size;
    }
    if (
      isValidString(
        model.description !== 'string' &&
          model.description !== '' &&
          model.description !== undefined &&
          model.description,
      )
    ) {
      bead.description = model.description;
    }
    if (
      isValidString(
        model.material !== 'string' && model.material !== '' && model.material !== undefined && model.material,
      )
    ) {
      bead.material = model.material;
    }
    if (isValidString(model.shape !== 'string' && model.shape !== '' && model.shape !== undefined && model.shape)) {
      bead.shape = model.shape;
    }

    if (isValidString(model.finish !== 'string' && model.finish !== '' && model.finish !== undefined && model.finish)) {
      bead.finish = model.finish;
    }

    if (
      isValidString(
        model.productCode !== 'string' &&
          model.productCode !== '' &&
          model.productCode !== undefined &&
          model.productCode,
      )
    ) {
      bead.productCode = model.productCode;
    }

    if (
      isValidString(
        model.supplier !== 'string' && model.supplier !== '' && model.supplier !== undefined && model.supplier,
      )
    ) {
      bead.supplier = model.supplier;
    }
    await bead.save();
    return bead;
  }

  async DeleteBead(id: string): Promise<Bead | Observable<Bead | any>> {
    const bead = await this.beadModel.findByIdAndDelete(id);
    if (!bead) {
      throw new HttpException('Bead not found', HttpStatus.BAD_REQUEST);
    }

    return bead;
  }

  async addImages(id: string, newImages: string[]): Promise<Bead> {
    const bead = await this.beadModel.findById(id);
    if (!bead) {
      throw new HttpException('Bead not found', HttpStatus.BAD_REQUEST);
    }
    if (!Array.isArray(bead.images)) {
      bead.images = [];
    }
    if (bead.images.length + newImages.length > 5) {
      throw new HttpException('Cannot upload more than 5 images', HttpStatus.BAD_REQUEST);
    }
    bead.images.push(...newImages);
    await bead.save();
    return bead;
  }

  async exploreBeads(limit = 50) {
    const beads = await this.beadModel.aggregate([
      {
        $addFields: {
          ownershipLocationCount: {
            $size: {
              $filter: {
                input: '$ownershipHistory',
                as: 'owner',
                cond: {
                  $and: [
                    { $ne: ['$$owner.location', null] },
                    { $ne: ['$$owner.location.city', ''] },
                    { $ne: ['$$owner.location.country', ''] },
                  ],
                },
              },
            },
          },
        },
      },
      { $sort: { ownershipLocationCount: -1 } },
      { $limit: limit },
    ]);

    return beads;
  }

  async getFeedPosts(
    page_number: number = 1,
    page_size: number = 10,
  ): Promise<{
    data: FeedPost[];
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
  }> {
    const skip = (page_number - 1) * page_size;

    const total = await this.feedPostModel.countDocuments();

    const feedPosts = await this.feedPostModel.aggregate([
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: page_size,
      },
      {
        $lookup: {
          from: 'beads',
          localField: 'beadId',
          foreignField: '_id',
          as: 'beadId',
        },
      },
      {
        $unwind: {
          path: '$beadId',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId',
        },
      },
      {
        $unwind: {
          path: '$userId',
          preserveNullAndEmptyArrays: true,
        },
      },
      // {
      //   $project: {
      //     type: 1,
      //     beadId: 1,
      //     beadName: 1,
      //     beadImage: 1,
      //     userId: 1,
      //     content: 1,
      //     location: 1,
      //     createdAt: 1,
      //     updatedAt: 1,
      //     beadDetails: {
      //       beadName: 1,
      //       description: 1,
      //       images: 1,
      //       qrCode: 1
      //     },
      //     userDetails: {
      //       username: 1,
      //       avatar: 1,
      //       firstName: 1,
      //       lastName: 1
      //     }
      //   }
      // }
    ]);

    return {
      data: feedPosts,
      pagination: {
        total,
        page: page_number,
        pageSize: page_size,
        totalPages: Math.ceil(total / page_size),
      },
    };
  }

  async getFeedById(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException('Invalid feed ID', HttpStatus.BAD_REQUEST);
    }

    const feedPost = await this.feedPostModel.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: 'beads',
          localField: 'beadId',
          foreignField: '_id',
          as: 'beadId',
        },
      },
      {
        $unwind: {
          path: '$beadId',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId',
        },
      },
      {
        $unwind: {
          path: '$userId',
          preserveNullAndEmptyArrays: true,
        },
      },
      // {
      //   $project: {
      //     type: 1,
      //     beadId: 1,
      //     beadName: 1,
      //     beadImage: 1,
      //     userId: 1,
      //     content: 1,
      //     location: 1,
      //     createdAt: 1,
      //     updatedAt: 1,
      //     beadDetails: {
      //       beadName: 1,
      //       description: 1,
      //       images: 1,
      //       qrCode: 1,
      //       threadId: 1,
      //       ownerId: 1
      //     },
      //     userDetails: {
      //       username: 1,
      //       avatar: 1,
      //       firstName: 1,
      //       lastName: 1
      //     }
      //   }
      // }
    ]);

    if (!feedPost || feedPost.length === 0) {
      throw new HttpException('Feed post not found', HttpStatus.NOT_FOUND);
    }

    return feedPost[0];
  }

  async likeFeedPost(feedPostId: string, userId: string): Promise<Like> {
    if (!Types.ObjectId.isValid(feedPostId) || !Types.ObjectId.isValid(userId)) {
      throw new HttpException('Invalid IDs', HttpStatus.BAD_REQUEST);
    }

    const existingLike = await this.likeModel.findOne({
      feedPostId: new Types.ObjectId(feedPostId),
      userId: new Types.ObjectId(userId),
    });

    if (existingLike) {
      throw new HttpException('Already liked this post', HttpStatus.BAD_REQUEST);
    }

    return await this.likeModel.create({
      feedPostId: new Types.ObjectId(feedPostId),
      userId: new Types.ObjectId(userId),
    });
  }

  async unlikeFeedPost(feedPostId: string, userId: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(feedPostId) || !Types.ObjectId.isValid(userId)) {
      throw new HttpException('Invalid IDs', HttpStatus.BAD_REQUEST);
    }

    const result = await this.likeModel.findOneAndDelete({
      feedPostId: new Types.ObjectId(feedPostId),
      userId: new Types.ObjectId(userId),
    });

    if (!result) {
      throw new HttpException('Like not found', HttpStatus.NOT_FOUND);
    }

    return { message: 'Post unliked successfully' };
  }

  async addComment(feedPostId: string, userId: string, text: string): Promise<Comment> {
    if (!Types.ObjectId.isValid(feedPostId) || !Types.ObjectId.isValid(userId)) {
      throw new HttpException('Invalid IDs', HttpStatus.BAD_REQUEST);
    }

    if (!text || text.trim().length === 0) {
      throw new HttpException('Comment text cannot be empty', HttpStatus.BAD_REQUEST);
    }

    return await this.commentModel.create({
      feedPostId: new Types.ObjectId(feedPostId),
      userId: new Types.ObjectId(userId),
      text: text.trim(),
    });
  }

  async getLikesByFeedId(feedPostId: string): Promise<{ likes: any[]; count: number }> {
    if (!Types.ObjectId.isValid(feedPostId)) {
      throw new HttpException('Invalid feed post ID', HttpStatus.BAD_REQUEST);
    }

    const feedPostExists = await this.feedPostModel.exists({ _id: new Types.ObjectId(feedPostId) });
    if (!feedPostExists) {
      throw new HttpException('Feed post not found', HttpStatus.NOT_FOUND);
    }

    const likes = await this.likeModel.aggregate([
      {
        $match: {
          feedPostId: new Types.ObjectId(feedPostId),
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId',
        },
      },
      {
        $unwind: {
          path: '$userId',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'feedposts',
          localField: 'feedPostId',
          foreignField: '_id',
          as: 'feedPostId',
        },
      },
      {
        $unwind: '$feedPostId',
      },
    ]);

    return {
      likes,
      count: likes.length,
    };
  }

  async getCommentsByFeedId(feedPostId: string): Promise<{ comments: any[]; count: number }> {
    if (!Types.ObjectId.isValid(feedPostId)) {
      throw new HttpException('Invalid feed post ID', HttpStatus.BAD_REQUEST);
    }

    const feedPostExists = await this.feedPostModel.exists({ _id: new Types.ObjectId(feedPostId) });
    if (!feedPostExists) {
      throw new HttpException('Feed post not found', HttpStatus.NOT_FOUND);
    }

    const comments = await this.commentModel.aggregate([
      {
        $match: {
          feedPostId: new Types.ObjectId(feedPostId),
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId',
        },
      },
      {
        $unwind: {
          path: '$userId',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'feedposts',
          localField: 'feedPostId',
          foreignField: '_id',
          as: 'feedPostId',
        },
      },
      {
        $unwind: '$feedPostId',
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    return {
      comments,
      count: comments.length,
    };
  }
  // async removeAllBeads(): Promise<void> {
  //   await this.beadModel.deleteMany({}, { $set: { is_deleted: true } });
  // }
}
