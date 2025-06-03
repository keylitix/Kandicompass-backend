import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  Logger,
  UseInterceptors,
  Param,
  HttpException,
  HttpStatus,
  Delete,
  Put,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import {
  CreateUserDto,
  PagingQueryDto,
  LoginModel,
  UpdateUserDto,
  VerifyOtpDto,
  ResetPasswordDto,
  ForgotPasswordDto,
  SearchUserDto,
} from './user.dto';
import { ResponseInterceptor, MessageResponseInterceptor } from 'src/helpers/interceptors/respone.interceptor';
import { ResponseMessage } from 'src/helpers/decorators/response.message';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('User')
@ApiTags('User')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private userService: UserService) {}

  @Post('/create')
  @UseInterceptors(ResponseInterceptor)
  @ResponseMessage('user created.')
  createUser(@Body() model: CreateUserDto) {
    console.log(model);
    return this.userService.createUser(model);
  }

  @Get('/getall/')
  @ResponseMessage('user fetched.')
  @UseInterceptors(ResponseInterceptor)
  getAllUser(
    @Query('page_size', ParseIntPipe) page_size: number,
    @Query('page_number', ParseIntPipe) page_number: number,
  ) {
    this.logger.log('[getall:user]');
    return this.userService.getAllUser(page_size, page_number);
  }

  @Post('/login')
  @UseInterceptors(ResponseInterceptor)
  @ResponseMessage('Login successful.')
  async login(@Body() model: LoginModel) {
    return this.userService.login(model);
  }

  @Get('/getById/:id')
  @UseInterceptors(ResponseInterceptor)
  @ResponseMessage('fetched successfully.')
  async getById(@Param('id') id: string) {
    const product = await this.userService.getById(id);
    return product;
  }

  @Delete('/remove/:id')
  @UseInterceptors(MessageResponseInterceptor)
  async softDelete(@Param('id') userId: string): Promise<string> {
    const user = this.userService.softDelete(userId);
    if (!user) {
      throw new HttpException('user not found', HttpStatus.BAD_REQUEST);
    }
    return 'user removed';
  }

  @Put('/update/:id')
  @UseInterceptors(ResponseInterceptor)
  @ResponseMessage('user updated.')
  updateUser(@Param('id') userId: string, @Body() model: UpdateUserDto) {
    return this.userService.updateUser<string>(userId, model);
  }

  // @Post('/admin-login')
  // @UseInterceptors(ResponseInterceptor)
  // @ResponseMessage('Admin login successful.')
  // adminLogin(@Body() model: LoginModel) {
  //   return this.userService.loginForAdmin(model);
  // }

  @Get('/getalldefault')
  @ResponseMessage('user fetched.')
  @UseInterceptors(ResponseInterceptor)
  getAlldefault(@Query() query: PagingQueryDto) {
    this.logger.log('[getall:user]');
    return this.userService.getAllDefault(query);
  }

  @Post('/forgot-password')
  @UseInterceptors(ResponseInterceptor)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    try {
      const result = await this.userService.forgotPassword(forgotPasswordDto);
      return { message: 'OTP sent to your email', ...result };
    } catch (error) {
      throw new HttpException('Error sending OTP', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('/verifyOTP')
  @UseInterceptors(ResponseInterceptor)
  @ResponseMessage('OTP verified successfully.')
  async verifyOTP(@Body() verifyOtpDto: VerifyOtpDto) {
    const result = await this.userService.verifyOTP(verifyOtpDto);
    return { message: 'OTP verify successfully.', ...result };
  }

  @Post('/resetPassword')
  @UseInterceptors(ResponseInterceptor)
  @ResponseMessage('Password reset successfully.')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<string> {
    try {
      await this.userService.resetPassword(resetPasswordDto);
      return 'Password reset successfully.';
    } catch (error) {
      throw new HttpException('Password reset failed.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
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
    return await this.userService.addImage(id, avatar);
  }

  @Get('/search')
  @UseInterceptors(ResponseInterceptor)
  @ResponseMessage('Users fetched successfully.')
  async searchUsers(@Query() query: SearchUserDto) {
    return this.userService.searchUsers(query);
  }

  // @Delete('/deleteAll')
  // @UseInterceptors(MessageResponseInterceptor)
  // @ResponseMessage('All roles removed')
  // async deleteAllRoles(): Promise<string> {
  //   await this.userService.removeAllRoles();
  //   return 'All users removed';
  // }
}
