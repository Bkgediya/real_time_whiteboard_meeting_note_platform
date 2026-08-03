import mongoose, { Schema, Document } from 'mongoose';
import { WorkspaceRole } from './Workspace.js';

export interface IInvitation extends Document {
  workspaceId: mongoose.Types.ObjectId;
  email: string;
  role: WorkspaceRole;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const InvitationSchema: Schema = new Schema(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, enum: ['owner', 'editor', 'viewer'], default: 'editor' },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Invitation = mongoose.model<IInvitation>('Invitation', InvitationSchema);
