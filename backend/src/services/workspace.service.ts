import mongoose from 'mongoose';
import crypto from 'crypto';
import { Workspace, WorkspaceRole } from '../models/Workspace.js';
import { User } from '../models/User.js';
import { Invitation } from '../models/Invitation.js';

export class WorkspaceService {
  async createWorkspace(name: string, userId: string) {
    const workspace = await Workspace.create({
      name,
      ownerId: userId,
      members: [{ userId, role: 'owner' }],
    });
    return workspace;
  }

  async getUserWorkspaces(userId: string) {
    const workspaces = await Workspace.find({ 'members.userId': userId })
      .populate('members.userId', 'name email avatar')
      .populate('ownerId', 'name email avatar')
      .sort({ updatedAt: -1 });
    return workspaces;
  }

  async getWorkspaceById(workspaceId: string) {
    const workspace = await Workspace.findById(workspaceId)
      .populate('ownerId', 'name email avatar')
      .populate('members.userId', 'name email avatar');
    if (!workspace) {
      throw { statusCode: 404, message: 'Workspace not found' };
    }
    return workspace;
  }

  async updateWorkspace(workspaceId: string, name: string) {
    const workspace = await Workspace.findByIdAndUpdate(workspaceId, { name }, { new: true });
    if (!workspace) {
      throw { statusCode: 404, message: 'Workspace not found' };
    }
    return workspace;
  }

  async deleteWorkspace(workspaceId: string) {
    await Workspace.findByIdAndDelete(workspaceId);
    return { message: 'Workspace deleted successfully' };
  }

  async inviteMember(workspaceId: string, email: string, role: WorkspaceRole) {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw { statusCode: 404, message: 'Workspace not found' };
    }

    const targetEmail = email.toLowerCase().trim();

    // Check if invitation already exists
    const existingInvite = await Invitation.findOne({ workspaceId, email: targetEmail });
    if (existingInvite) {
      return existingInvite;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await Invitation.create({
      workspaceId,
      email: targetEmail,
      role,
      token,
      expiresAt,
    });

    return invitation;
  }

  async getPendingInvitations(email: string) {
    const invitations = await Invitation.find({ email: email.toLowerCase() })
      .populate({
        path: 'workspaceId',
        select: 'name ownerId',
        populate: { path: 'ownerId', select: 'name email' },
      })
      .sort({ createdAt: -1 });
    return invitations;
  }

  async acceptInvitation(token: string, userId: string) {
    const invitation = await Invitation.findOne({ token });
    if (!invitation || invitation.expiresAt < new Date()) {
      throw { statusCode: 400, message: 'Invalid or expired invitation token' };
    }

    const workspace = await Workspace.findById(invitation.workspaceId);
    if (!workspace) {
      throw { statusCode: 404, message: 'Workspace not found' };
    }

    const existingMember = workspace.members.find((m) => m.userId.toString() === userId);
    if (!existingMember) {
      workspace.members.push({ userId: new mongoose.Types.ObjectId(userId), role: invitation.role });
      await workspace.save();
    }

    await Invitation.findByIdAndDelete(invitation._id);
    return workspace;
  }

  async declineInvitation(token: string) {
    await Invitation.findOneAndDelete({ token });
    return { message: 'Invitation declined' };
  }

  async removeMember(workspaceId: string, targetUserId: string) {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw { statusCode: 404, message: 'Workspace not found' };
    }

    workspace.members = workspace.members.filter((m) => m.userId.toString() !== targetUserId);
    await workspace.save();
    return workspace;
  }
}
