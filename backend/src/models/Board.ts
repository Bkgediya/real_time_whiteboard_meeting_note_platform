import mongoose, { Schema, Document } from 'mongoose';

export interface BoardMember {
  userId: mongoose.Types.ObjectId;
  role: 'editor' | 'viewer';
}

export interface IBoard extends Document {
  title: string;
  workspaceId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  members: BoardMember[];
  isStarred: boolean;
  lastOpenedAt: Date;
  snapshot: Record<string, any>;
  shareToken?: string;
  shareExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BoardMemberSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['editor', 'viewer'], default: 'viewer' },
  },
  { _id: false }
);

const BoardSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [BoardMemberSchema],
    isStarred: { type: Boolean, default: false },
    lastOpenedAt: { type: Date, default: Date.now },
    snapshot: { type: Schema.Types.Mixed, default: { elements: [] } },
    shareToken: { type: String, default: null },
    shareExpiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Board = mongoose.model<IBoard>('Board', BoardSchema);
