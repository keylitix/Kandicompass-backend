import { ResponseMessage } from '@app/helpers/decorators/response.message';
import { ResponseInterceptor } from '@app/helpers/interceptors/respone.interceptor';
import { Body, Controller, Logger, Post, UseInterceptors } from '@nestjs/common';
import { ContactService } from './contact.service';
import { createMessageDto } from '../thread/thread.dto';

@Controller('contact')
export class ContactController {
  private readonly logger = new Logger(ContactController.name);

  constructor(private contactService: ContactService) {}

  @Post('/create')
  @UseInterceptors(ResponseInterceptor)
  @ResponseMessage('create contactus and send message in email successfully.')
  async create(@Body() createContactDto: createMessageDto) {
    this.logger.log('[create: contactus');
    const thread = await this.contactService.create(createContactDto);
    return thread;
  }
}
