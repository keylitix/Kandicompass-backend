import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { createHash, compareHash, generateOTP } from '../../utils/bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { isValidString } from '@app/utils/string';
import { User } from '@app/models/user.schema';
import {
  CreateUserDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  SearchUserDto,
  UpdateUserDto,
  VerifyOtpDto,
} from './user.dto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>, private jwtService: JwtService) {}

  async build(model: CreateUserDto) {
    const {
      fullName,
      email,
      password,
      phoneNumber,
      profilePicture,
      dateOfBirth,
      gender,
      address,
      role,
      accountStatus,
      emailVerified,
      twoFactorAuthEnabled,
      membership,
      orderHistory,
      security,
      portfolio,
      metadata,
      token,
      forgotPasswordOTP,
      is_activated,
      otp,
      device_token,
      is_deleted,
      notifications,
      bio,
      privacy,
      location,
    } = model;

    const user = new this.userModel({
      fullName,
      email,
      password,
      phoneNumber,
      profilePicture: profilePicture || 'default-profile.jpg',
      dateOfBirth,
      gender,
      address,
      role: role || 'Customer',
      accountStatus: accountStatus || 'Active',
      emailVerified: emailVerified || false,
      twoFactorAuthEnabled: twoFactorAuthEnabled || false,
      membership,
      orderHistory: orderHistory || [],
      security: security || {
        lastIpAddress: '',
        loginAttempts: 0,
        securityQuestions: [],
      },
      portfolio: portfolio || [],
      metadata,
      token,
      forgotPasswordOTP,
      is_activated: is_activated !== undefined ? is_activated : true,
      otp,
      device_token,
      is_deleted: is_deleted || false,
      notifications,
      bio,
      privacy,
      location,
    }).save();

    return user;
  }

  async createUser(model: CreateUserDto): Promise<User> {
    const isExist = await this.userModel.findOne({
      email: model.email,
    });

    if (isExist) {
      throw new HttpException('User already exist', HttpStatus.BAD_REQUEST);
    }

    model.password = createHash(model.password);
    const user = await this.build(model);
    const token = this.jwtService.sign({ _id: user._id });
    user.token = token;

    return user;
  }

  async getAllUser(queryParams): Promise<User[]> {
    let { page_no = '1', page_size = '50' } = queryParams;

    page_no = Number(page_no);
    page_size = Number(page_size);

    const skip = (page_no - 1) * page_size;

    const all_users = await this.userModel.aggregate([
      {
        $match: {},
      },
      {
        $match: {
          is_deleted: false,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: page_size,
      },
    ]);
    return all_users;
  }

  async login(payload): Promise<Exclude<User, 'password'>> {
    const { email, password } = payload;
    const user = await this.userModel.findOne({ email: email });

    if (!user) {
      throw new HttpException('User not found ', HttpStatus.BAD_REQUEST);
    }

    // if (user.roleId && user.roleId.name === 'Admin') {
    //   throw new HttpException('Access denied. Admins cannot login using this API.', HttpStatus.UNAUTHORIZED);
    // }

    const isPassMatched = compareHash(user.password, password);

    if (!isPassMatched) {
      throw new HttpException('Incorrect password', HttpStatus.BAD_REQUEST);
    }

    const token = this.jwtService.sign({ _id: user._id });
    user.token = token;
    await user.save();
    delete user.password;

    return user;
  }

  async getById(id: string): Promise<User[]> {
    const user = await this.userModel.aggregate([
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
    ]);
    return user;
  }

  async softDelete(id: string): Promise<User | Observable<User | any>> {
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    return user;
  }

  async updateUser<T>(id: T | string, model: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findById({ _id: id });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    if (isValidString(model.fullName)) {
      user.fullName = model.fullName;
    }

    if (isValidString(model.email)) {
      user.email = model.email.toLowerCase();
    }

    if (isValidString(model.password)) {
      user.password = model.password;
    }

    if (isValidString(model.phoneNumber)) {
      user.phoneNumber = model.phoneNumber;
    }

    if (isValidString(model.profilePicture)) {
      user.profilePicture = model.profilePicture;
    }

    if (model.dateOfBirth) {
      user.dateOfBirth = new Date(model.dateOfBirth);
    }

    if (isValidString(model.gender)) {
      user.gender = model.gender;
    }

    // Address
    // if (model.address) {
    //   user.address = model.address;
    // }

    // Account settings
    if (isValidString(model.role)) {
      user.role = model.role;
    }

    if (isValidString(model.accountStatus)) {
      user.accountStatus = model.accountStatus;
    }

    if (model.lastLogin) {
      user.lastLogin = new Date(model.lastLogin);
    }

    if (model.emailVerified !== undefined) {
      user.emailVerified = model.emailVerified;
    }

    if (model.twoFactorAuthEnabled !== undefined) {
      user.twoFactorAuthEnabled = model.twoFactorAuthEnabled;
    }

    // Membership
    // if (model.membership) {
    //   user.membership = model.membership;
    // }

    // Order history
    // if (model.orderHistory) {
    //   user.orderHistory = model.orderHistory;
    // }

    // Security
    // if (model.security) {
    //   user.security = model.security;
    // }

    // if (model.portfolio) {
    //   user.portfolio = model.portfolio;
    // }

    if (model.metadata) {
      user.metadata = model.metadata;
    }

    if (isValidString(model.token)) {
      user.token = model.token;
    }

    if (isValidString(model.forgotPasswordOTP)) {
      user.forgotPasswordOTP = model.forgotPasswordOTP;
    }

    if (model.is_activated !== undefined) {
      user.is_activated = model.is_activated;
    }

    if (isValidString(model.otp)) {
      user.otp = model.otp;
    }

    if (isValidString(model.device_token)) {
      user.device_token = model.device_token;
    }

    if (model.is_deleted !== undefined) {
      user.is_deleted = model.is_deleted;
    }

    user.updated_at = new Date();
    await user.save();
    return user;
  }

  // async loginForAdmin(payload): Promise<Exclude<User, 'password'>> {
  //   const { email, password } = payload;
  //   const user = await this.userModel.findOne({ email }).populate('role');

  //   if (!user) {
  //     throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
  //   }

  //   const isPassMatched = compareHash(user.password, password);

  //   if (!isPassMatched) {
  //     throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
  //   }

  //   const isAdmin = user.roleId && user.roleId.name === 'Admin';

  //   if (!isAdmin) {
  //     throw new HttpException('Access denied. User is not an admin ', HttpStatus.UNAUTHORIZED);
  //   }

  //   const token = this.jwtService.sign({ _id: user._id });
  //   delete user.password;
  //   user.token = token;
  //   await user.save();
  //   return user;
  // }

  async getAllDefault(queryParams): Promise<User[]> {
    let { page_no = '1', page_size = '50' } = queryParams;

    page_no = Number(page_no);
    page_size = Number(page_size);

    const skip = (page_no - 1) * page_size;

    const all_users = await this.userModel.aggregate([
      {
        $match: {
          default_admin: true,
          is_deleted: false,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: page_size,
      },
    ]);
    return all_users;
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ otp: string; token: string }> {
    const user = await this.userModel.findOne({ email: forgotPasswordDto.email });

    if (!user) {
      throw new HttpException('user not found', HttpStatus.NOT_FOUND);
    }

    const otp = generateOTP();
    user.forgotPasswordOTP = otp;
    await user.save();
    console.log(`OTP for password reset: ${otp}`);
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'javascript.mspl@gmail.com',
        pass: 'qemq jupm iyse tdzs',
      },
    });

    const mailOptions = {
      from: 'javascript.mspl@gmail.com',
      to: user.email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    const token = this.jwtService.sign({ email: user.email, otp });

    return { otp, token };
  }

  async verifyOTP(verifyOtpDto: VerifyOtpDto): Promise<{ message: string; token: string }> {
    try {
      const decodedToken = this.jwtService.verify(verifyOtpDto.token);
      const email = decodedToken.email;
      const user = await this.userModel.findOne({ email });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      if (user.forgotPasswordOTP !== verifyOtpDto.otp) {
        throw new HttpException('Invalid OTP', HttpStatus.BAD_REQUEST);
      }

      user.forgotPasswordOTP = null;
      await user.save();

      const newToken = this.jwtService.sign({ email: user.email });

      return { message: 'OTP verified successfully', token: newToken };
    } catch (error) {
      throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<string> {
    try {
      const decodedToken = this.jwtService.verify(resetPasswordDto.token);
      const email = decodedToken.email;

      const user = await this.userModel.findOne({ email });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      user.password = createHash(resetPasswordDto.newPassword);
      await user.save();

      return 'Password reset successfully';
    } catch (error) {
      throw new HttpException('Password reset failed. Invalid token or OTP.', HttpStatus.BAD_REQUEST);
    }
  }

  async addImage(id: string, avatar: string): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }
    user.avatar = avatar;
    await user.save();
    return user;
  }

  async searchUsers(query: SearchUserDto): Promise<User[]> {
    const { fullname } = query;

    const searchCriteria: any = { is_deleted: false };

    if (fullname) {
      searchCriteria['fullname'] = { $regex: fullname, $options: 'i' };
    }

    return this.userModel.find(searchCriteria);
  }

  // async removeAllRoles(): Promise<void> {
  //   await this.userModel.deleteMany({}, { $set: { is_deleted: true } });
  // }
}
