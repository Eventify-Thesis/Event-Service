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
import { MemberRepository } from '../repositories/member.repository';

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
    private readonly memberRepository: MemberRepository,
  ) {}

  private canManageRole(userRole: EventRole, targetRole: EventRole): boolean {
    if ([EventRole.ENTRY_STAFF, EventRole.VENDOR].includes(userRole)) {
      return false;
    }
    return this.roleHierarchy[userRole] > this.roleHierarchy[targetRole];
  }

  async assignOwner(
    user: User,
    eventId: string,
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

    organizations[organization.id] = 'org:owner';

    await this.clerkClient.users.updateUserMetadata(user.id, {
      publicMetadata: {
        organizations,
      },
    });

    await this.memberRepository.create({
      userId: user.id,
      email: user.emailAddresses[0].emailAddress,
      eventId: eventId,
      role: EventRole.OWNER,
      firstName: user.firstName,
      lastName: user.lastName,
      organizationId: organization.id,
    });

    return organization;
  }

  async addMember(user: User, eventId: string, dto: AddMemberDto) {
    const userRole = await this.getMemberRole(user.id, eventId);

    if (!this.canManageRole(userRole, dto.role)) {
      throw new ForbiddenException(MESSAGE.CANNOT_ASSIGN_ROLE);
    }

    // Check if member already exists
    const existingMember = await this.memberRepository.findOne({
      eventId,
      email: dto.email,
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

    // Create member in our database
    const member = await this.memberRepository.create({
      userId: clerkUser.id,
      email: dto.email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      organizationId: dto.organizationId,
      eventId: eventId,
      role: dto.role,
    });

    return member;
  }

  async deleteMember(user: User, eventId: string, userId: string) {
    const member = await this.memberRepository.findOne({
      userId: userId,
      eventId,
    });

    if (!member) {
      throw new BadRequestException(MESSAGE.MEMBER_NOT_FOUND);
    }

    const userRole = await this.getMemberRole(user.id, eventId);

    if (!this.canManageRole(userRole, member.role)) {
      throw new ForbiddenException(MESSAGE.CANNOT_DELETE_MEMBER);
    }

    // Remove from Clerk organization
    try {
      await this.clerkClient.organizations.deleteOrganizationMembership({
        organizationId: member.organizationId,
        userId: member.userId,
      });
    } catch (error) {
      throw new BadRequestException(MESSAGE.CLERK_ERROR);
    }

    await this.memberRepository.deleteOne({ _id: member._id });
  }

  async listMembers(
    eventId: string,
    { page = 1, limit = 10, keyword }: MemberListQuery,
  ) {
    let nKeyword;
    const condition = [];

    if (keyword) {
      nKeyword = new RegExp(
        keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'gi',
      );
      condition.push({
        $or: [
          { lastName: { $regex: keyword } },
          { firstName: { $regex: keyword } },
          { email: { $regex: keyword } },
        ],
      });
    }

    const result = await this.memberRepository.pagination({
      conditions: {
        $and: [
          {
            eventId: eventId,
            ...(condition.length ? { $or: condition } : {}),
          },
        ],
      },
      page,
      limit,
      sort: { createdAt: 1 },
    });

    return result;
  }

  async getMemberRole(userId: string, eventId: string): Promise<EventRole> {
    const member = await this.memberRepository.findOne({
      userId,
      eventId,
    });

    if (!member) {
      throw new ForbiddenException(MESSAGE.NOT_ORGANIZATION_MEMBER);
    }
    return member.role;
  }

  async updateMemberRole(
    currentUser: User,
    eventId: string,
    userId: string,
    newRole: EventRole,
  ) {
    const currentUserRole = await this.getMemberRole(currentUser.id, eventId);

    const member = await this.memberRepository.findOne({
      userId: userId,
      eventId: eventId,
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
    return this.memberRepository.findOneAndUpdate(
      {
        eventId,
        userId,
      },
      { role: newRole },
    );
  }
}
