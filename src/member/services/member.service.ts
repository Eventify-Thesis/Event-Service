import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { AddMemberDto, MemberListQuery } from '../dto/member.dto';
import { ClerkClient, Organization, User } from '@clerk/backend';
import { MESSAGE } from '../member.constant';
import EventRole from 'src/auth/event-role/event-roles.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from '../entities/member.entity';

@Injectable()
export class MemberService {
  private readonly roleHierarchy = {
    [EventRole.OWNER]: 5,
    [EventRole.ADMIN]: 4,
    [EventRole.MANAGER]: 3,
    [EventRole.ENTRY_STAFF]: 2,
    [EventRole.VENDOR]: 1,
  };

  constructor(
    @Inject('ClerkClient')
    private readonly clerkClient: ClerkClient,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  private canManageRole(userRole: EventRole, targetRole: EventRole): boolean {
    if ([EventRole.ENTRY_STAFF, EventRole.VENDOR].includes(userRole)) {
      return false;
    }
    return this.roleHierarchy[userRole] > this.roleHierarchy[targetRole];
  }

  async assignOwner(
    user: User,
    eventId: number,
    eventName: string,
  ): Promise<Organization> {
    const organization =
      await this.clerkClient.organizations.createOrganization({
        name: eventName,
        maxAllowedMemberships: 100,
        publicMetadata: {
          eventId: eventId,
        },
      });

    // Add the current user as owner of the organization
    await this.clerkClient.organizations.createOrganizationMembership({
      organizationId: organization.id,
      userId: user.id,
      role: 'org:owner',
    });

    let organizations = user.publicMetadata.organizations || {};

    organizations[`${eventId}:${organization.id}`] = 'org:owner';

    await this.clerkClient.users.updateUserMetadata(user.id, {
      publicMetadata: {
        organizations,
      },
    });

    await this.memberRepository.save({
      userId: user.id,
      email: user.emailAddresses[0].emailAddress,
      event: { id: eventId },
      role: EventRole.OWNER,
      firstName: user.firstName,
      lastName: user.lastName,
      organizationId: organization.id,
    });

    return organization;
  }

  async addMember(user: User, eventId: number, dto: AddMemberDto) {
    const userRole = await this.getMemberRole(user.id, eventId);

    if (!this.canManageRole(userRole, dto.role)) {
      throw new ForbiddenException(MESSAGE.CANNOT_ASSIGN_ROLE);
    }

    // Check if member already exists
    const existingMember = await this.memberRepository.findOne({
      where: {
        event: { id: eventId },
        email: dto.email,
      },
    });

    if (existingMember) {
      throw new BadRequestException(MESSAGE.MEMBER_ALREADY_EXISTS);
    }

    // Look up or create user in Clerk

    let clerkUser: User;

    const users = await this.clerkClient.users.getUserList({
      emailAddress: [dto.email],
    });

    if (!users.data[0]) {
      // Create new user in Clerk if doesn't exist
      throw new BadRequestException(MESSAGE.MEMBER_NOT_FOUND);
    }
    try {
      clerkUser = users.data[0];
      await this.clerkClient.organizations.createOrganizationMembership({
        organizationId: dto.organizationId,
        userId: clerkUser.id,
        role: `org:${dto.role.toLowerCase()}`,
      });
    } catch (error) {
      console.log(error);
      throw new BadRequestException(MESSAGE.CLERK_ERROR);
    }

    let organizations = clerkUser.publicMetadata.organizations || {};

    organizations[`${eventId}:${dto.organizationId}`] =
      `org:${dto.role.toLowerCase()}`;

    await this.clerkClient.users.updateUserMetadata(clerkUser.id, {
      publicMetadata: {
        organizations,
      },
    });

    // Create member in our database
    const member = await this.memberRepository.save({
      userId: clerkUser.id,
      email: dto.email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      organizationId: dto.organizationId,
      event: { id: eventId },
      role: dto.role,
    });

    return member;
  }

  async deleteMember(user: User, eventId: number, userId: string) {
    const member = await this.memberRepository.findOne({
      where: {
        userId: userId,
        event: { id: eventId },
      },
    });

    if (!member) {
      throw new BadRequestException(MESSAGE.MEMBER_NOT_FOUND);
    }

    let memberUser: User;

    const users = await this.clerkClient.users.getUserList({
      userId: [userId],
    });

    if (!users.data[0]) {
      // Create new user in Clerk if doesn't exist
      throw new BadRequestException(MESSAGE.MEMBER_NOT_FOUND);
    }

    memberUser = users.data[0];

    const userRole = await this.getMemberRole(user.id, eventId);

    if (!this.canManageRole(userRole, member.role)) {
      throw new ForbiddenException(MESSAGE.CANNOT_DELETE_MEMBER);
    }

    try {
      await this.clerkClient.organizations.deleteOrganizationMembership({
        organizationId: member.organizationId,
        userId: member.userId,
      });
    } catch (error) {
      throw new BadRequestException(MESSAGE.CLERK_ERROR);
    }

    let organizations = memberUser.publicMetadata.organizations || {};

    delete organizations[`${eventId}:${member.organizationId}`];

    await this.clerkClient.users.updateUserMetadata(memberUser.id, {
      publicMetadata: {
        organizations,
      },
    });

    await this.memberRepository.delete(member.id);
  }

  async listMembers(
    eventId: number,
    { page = 1, limit = 10, keyword }: MemberListQuery,
  ) {
    const queryBuilder = this.memberRepository
      .createQueryBuilder('member')
      .where('member.event_id = :eventId', { eventId });

    if (keyword) {
      const searchKeyword = `%${keyword.trim()}%`;
      queryBuilder.andWhere(
        '(member.lastName ILIKE :keyword OR member.firstName ILIKE :keyword OR member.email ILIKE :keyword)',
        { keyword: searchKeyword },
      );
    }

    const [result, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('member.createdAt', 'ASC')
      .getManyAndCount();

    return {
      docs: result,
      totalDocs: total,
      itemCount: result.length,
      itemsPerPage: limit,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async getMemberRole(userId: string, eventId: number): Promise<EventRole> {
    const member = await this.memberRepository.findOne({
      where: {
        userId,
        event: { id: eventId },
      },
    });

    if (!member) {
      throw new ForbiddenException(MESSAGE.NOT_ORGANIZATION_MEMBER);
    }
    return member.role;
  }

  async updateMemberRole(
    currentUser: User,
    eventId: number,
    userId: string,
    newRole: EventRole,
  ) {
    const currentUserRole = await this.getMemberRole(currentUser.id, eventId);

    const member = await this.memberRepository.findOne({
      where: {
        userId: userId,
        event: { id: eventId },
      },
    });

    if (!member) {
      throw new BadRequestException(MESSAGE.MEMBER_NOT_FOUND);
    }

    if (!this.canManageRole(currentUserRole, newRole)) {
      throw new ForbiddenException(MESSAGE.CANNOT_MANAGE_ROLE);
    }

    if (!this.canManageRole(currentUserRole, member.role)) {
      throw new ForbiddenException(MESSAGE.CANNOT_MANAGE_ROLE);
    }

    member.role = newRole;
    return this.memberRepository.save(member);
  }
}
