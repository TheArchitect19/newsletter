import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { CampaignService } from './campaigns.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateCampaignDto } from './dto/create-campaign.dto';

@Controller('campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) { }

  @Post()
  async createCampaign(@Body() createCampaignDto: CreateCampaignDto) {
    return this.campaignService.createCampaign(createCampaignDto);
  }

  @Get()
  async listCampaigns() {
    return this.campaignService.listCampaigns();
  }

  @Post(':id/send')
  async sendCampaign(@Param('id') id: string) {
    return this.campaignService.sendCampaign(id);
  }
}