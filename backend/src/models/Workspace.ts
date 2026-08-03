import mongoose, { Schema, Document } from 'mongoose';

export type WorkspaceRole = 'owner' | 'editor' | 'viewer';

export interface IWorkspaceMember {
  userId: mongoose.Types.ObjectId;
  role: WorkspaceRole;
}

export interface IWorkspace extends Document {
  name: string;
  ownerId: mongoose.Types.ObjectId;
  members: IWorkspaceMember[];
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceMemberSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['owner', 'editor', 'viewer'], default: 'editor' },
  },
  { _id: false }
);

const WorkspaceSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [WorkspaceMemberSchema],
  },
  { timestamps: true }
);

export const Workspace = mongoose.model<IWorkspace>('Workspace', WorkspaceSchema);
