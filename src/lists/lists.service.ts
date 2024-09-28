import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { List } from './entities/list.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { log } from 'console';
import { InjectKnex } from 'nestjs-knex';
import { Knex } from 'knex';



@Injectable()
export class ListService {
  constructor(
    @InjectRepository(List)
    private listRepository: Repository<List>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectKnex() private readonly knex: Knex
  ) {}

  async create(createListDto: CreateListDto) {
    const list = new List();
    list.name = createListDto.name;
    list.customFields = createListDto.customFields;

    if (createListDto.organizationId) {
      const organization = await this.organizationRepository.findOne({ where: { id: createListDto.organizationId } });
      if (organization) {
        list.organization = organization;
      }
    }

    return this.listRepository.save(list);
  }

  findAll() {
    return this.listRepository.find({ relations: ['organization'] });
  }

  async update(id: string, updateListDto: UpdateListDto) {
    const list = await this.listRepository.findOne({ where: { id } });
    if (!list) {
      throw new Error('List not found');
    }

    if (updateListDto.name) list.name = updateListDto.name;
    if (updateListDto.customFields) list.customFields = updateListDto.customFields;

    if (updateListDto.organizationId) {
      const organization = await this.organizationRepository.findOne({ where: { id: updateListDto.organizationId } });
      if (organization) {
        list.organization = organization;
      }
    }
    return this.listRepository.save(list);
  }

  async getByCidTx(tx: Knex.Transaction, listCid: string) {
    try {
      console.log(listCid)
      const list = await tx('lists')
        .where({ id: listCid })
        .first();
      console.log("list",list)
      if (!list) {
        throw new Error(`List with CID ${listCid} not found`);
      }
      // await this.enforceEntityPermissionTx(tx, context, 'list', list.id, 'view');
      return list;
    } catch (error) {
      console.error('Error fetching list by CID:', error);
      throw error;
    }
  }
  // async enforceEntityPermissionTx(tx: any, context: any, entityTypeId: string, entityId: any, requiredOperations: string) {
  //   if (!entityId) {
  //     throw new HttpError('Attendee Type Not Found', {}, HttpStatus.NOT_FOUND);
  //   }
  //   const result = await this._checkPermissionTx(tx, context, entityTypeId, entityId, requiredOperations);
  //   if (!result) {
  //     log.apply(`Denying permission ${entityTypeId}.${entityId} ${requiredOperations}`);
  //     throw new HttpError('Attendee Type Not Found', {}, HttpStatus.NOT_FOUND);
  //   }
  // }

  // async _checkPermissionTx(tx: any, context: any, entityTypeId: any, entityId: any, requiredOperations: any) {
  //   if (!context.user) {
  //     return false;
  //   }

  //   const entityType = entitySettings.getEntityType(entityTypeId);

  //   if (typeof requiredOperations === 'string') {
  //     requiredOperations = [requiredOperations];
  //   }

  //   requiredOperations = this.filterPermissionsByRestrictedAccessHandler(context, entityTypeId, entityId, requiredOperations, 'checkPermissions');

  //   if (requiredOperations.length === 0) {
  //     return false;
  //   }

  //   if (context.user.admin) { // This handles the getAdminContext() case. In this case we don't check the permission, but just the existence.
  //     const existsQuery = tx(entityType.entitiesTable);

  //     if (entityId) {
  //       existsQuery.where('id', entityId);
  //     }

  //     const exists = await existsQuery.first();

  //     return !!exists;

  //   } else {
  //     const permsQuery = tx(entityType.permissionsTable)
  //       .where('user', context.user.id)
  //       .whereIn('operation', requiredOperations);

  //     if (entityId) {
  //       permsQuery.andWhere('entity', entityId);
  //     }

  //     const perms = await permsQuery.first();

  //     return !!perms;
  //   }
  // }

  // filterPermissionsByRestrictedAccessHandler(context: any, entityTypeId: any, entityId: any, permissions: any, operationMsg: any) {
  //   if (context.user.restrictedAccessHandler) {
  //     const originalOperations = permissions;
  //     if (context.user.restrictedAccessHandler.permissions) {
  //       const entityPerms = context.user.restrictedAccessHandler.permissions[entityTypeId];

  //       if (!entityPerms) {
  //         permissions = [];
  //       } else if (entityPerms === true) {
  //         // no change to operations
  //       } else if (entityPerms instanceof Set) {
  //         permissions = permissions.filter(perm => entityPerms.has(perm));
  //       } else {
  //         if (entityId) {
  //           const allowedPerms = entityPerms[entityId];
  //           if (allowedPerms) {
  //             permissions = permissions.filter(perm => allowedPerms.has(perm));
  //           } else {
  //             const allowedPerms = entityPerms['default'];
  //             if (allowedPerms) {
  //               permissions = permissions.filter(perm => allowedPerms.has(perm));
  //             } else {
  //               permissions = [];
  //             }
  //           }
  //         } else {
  //           const allowedPerms = entityPerms['default'];
  //           if (allowedPerms) {
  //             permissions = permissions.filter(perm => allowedPerms.has(perm));
  //           } else {
  //             permissions = [];
  //           }
  //         }
  //       }
  //     } else {
  //       permissions = [];
  //     }
  //     log.verbose(operationMsg + ' with restrictedAccessHandler --  entityTypeId: ' + entityTypeId + '  entityId: ' + entityId + '  operations: [' + originalOperations + '] -> [' + permissions + ']');
  //   }

  //   return permissions;
  // }
  // async listTx(tx: any, listId: any) {
  //   return await tx('custom_fields').where({ list: listId }).select(['id', 'name', 'type', 'help', 'key', 'column', 'settings', 'group', 'default_value', 'required', 'order_list', 'order_subscribe', 'order_manage']).orderBy(knex.raw('-order_list'), 'desc').orderBy('id', 'asc');
  // }
  // async listGroupedTx(tx: any, listId: any) {
  //   const flds = await this.listTx(tx, listId);

  //   const fldsById = {};
  //   for (const fld of flds) {
  //     fld.settings = JSON.parse(fld.settings);

  //     fldsById[fld.id] = fld;

  //     if (fieldTypes[fld.type].grouped) {
  //       fld.settings.options = [];
  //       fld.groupedOptions = {};
  //     }
  //   }

  //   for (const fld of flds) {
  //     if (fld.group) {
  //       const group = fldsById[fld.group];
  //       group.settings.options.push({ key: fld.column, label: fld.name });
  //       group.groupedOptions[fld.column] = fld;
  //     }
  //   }

  //   const groupedFlds = flds.filter(fld => !fld.group);

  //   for (const fld of flds) {
  //     delete fld.group;
  //   }

  //   return groupedFlds;
  // }

}