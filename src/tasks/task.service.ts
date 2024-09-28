import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EmailService } from '../email/email.service';

@Injectable()
export class TasksService {
    constructor(
        private readonly mailService: EmailService,
    ) { }
    private readonly logger = new Logger(TasksService.name);

    @Cron('0 1-6 * * *')
    async handleCron() {
        this.logger.debug('Called every day');
    }

}