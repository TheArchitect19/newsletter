import { Controller, Get } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('emails')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('send')
  async sendEmail() {
    const to = 'ayush.krsh9@gmail.com';
    const subject = 'testing';
    const text = 'it working or not';
    await this.emailService.sendEmail(to, subject, text);
    return { message: 'Email sent successfully' };
  }
}
