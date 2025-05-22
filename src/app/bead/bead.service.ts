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

@Injectable()
export class BeadsService {
  private readonly logger = new Logger(BeadsService.name);
  constructor(@InjectModel(Bead.name) private beadModel: Model<Bead>) {}

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

  async getAllBead(queryParams: any): Promise<{
    data: Bead[];
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
        $limit: limit,
      },
    ]);
    return {
      data: all_bead,
      pagination: {
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
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

  // async removeAllBeads(): Promise<void> {
  //   await this.beadModel.deleteMany({}, { $set: { is_deleted: true } });
  // }
}
