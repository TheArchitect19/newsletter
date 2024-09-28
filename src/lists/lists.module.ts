import { forwardRef, Module } from '@nestjs/common';
import { ListController } from './lists.controller';
import { ListService } from './lists.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { List } from './entities/list.entity';
import { AuthModule } from '../auth/auth.module';
import { Organization } from '../organizations/entities/organization.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([List, Organization]),
    forwardRef(() => AuthModule)
  ],
  controllers: [ListController],
  providers: [ListService],
  exports: [ListService]
})
export class ListsModule { }