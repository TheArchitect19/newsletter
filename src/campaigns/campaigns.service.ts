import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign } from './entities/campaign.entity';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { List } from '../lists/entities/list.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { InjectKnex } from 'nestjs-knex';
import { Knex } from 'knex';

@Injectable()
export class CampaignService {
  constructor(
    @InjectRepository(Campaign)
    private campaignRepository: Repository<Campaign>,
    @InjectRepository(List)
    private listRepository: Repository<List>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectKnex() private readonly knex: Knex,
  ) { }

  async createCampaign(createCampaignDto: CreateCampaignDto): Promise<Campaign> {
    const campaign = new Campaign();
    campaign.subject = createCampaignDto.subject;
    campaign.content = createCampaignDto.content;

    if (createCampaignDto.listId) {
      const list = await this.listRepository.findOne({ where: { id: createCampaignDto.listId } });
      if (list) {
        campaign.list = list;
      }
    }

    if (createCampaignDto.organizationId) {
      const organization = await this.organizationRepository.findOne({ where: { id: createCampaignDto.organizationId } });
      if (organization) {
        campaign.organization = organization;
      }
    }

    return this.campaignRepository.save(campaign);
  }

  async listCampaigns(): Promise<Campaign[]> {
    return this.campaignRepository.find();
  }

  async sendCampaign(id: string): Promise<any> {
    return { message: `Campaign ${id} sent successfully` };
  }
  async getTrackingSettingsByCidTx(
    tx: Knex.Transaction,
    cid: string,
  ) {
    try {
      const entity = await tx('campaigns')
        .where('campaigns.id', cid)
        .select(['campaigns.id', 'campaigns.click_tracking_disabled', 'campaigns.open_tracking_disabled'])
        .first();
      if (!entity) {
        throw new NotFoundException(`Campaign with CID ${cid} not found`);
      }
      return entity;
    } catch (error) {
      console.error('Error fetching campaign tracking settings:', error);
      throw error;
    }
  }
}