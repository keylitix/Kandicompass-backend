import { Contact } from '@app/models/contact.schema';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createMessageDto } from '../thread/thread.dto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);
  constructor(@InjectModel(Contact.name) private contactModel: Model<Contact>) {}

  async build(model: createMessageDto) {
    const { name, email, message } = model;

    const thread = await new this.contactModel({
      name,
      email,
      message,
    }).save();
    await thread.save();
    return thread;
  }

  async create(createContactDto: createMessageDto) {
    const { name, email, message } = createContactDto;

    const transporter = await nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'javascript.mspl@gmail.com',
        pass: 'qemq jupm iyse tdzs',
      },
    });
    console.log('transporter ===>>>', transporter);
    const mailOptions = {
      from: 'javascript.mspl@gmail.com',
      to: email,
      subject: name,
      text: message,
    };
    console.log('mailOptions ===>>>', mailOptions);
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    const thread = await new this.contactModel({
      name: name,
      email: email,
      message: message || '',
    }).save();
    await thread.save();

    return thread;
  }
}
