import mongoose, { Schema, Document } from 'mongoose';

export interface IBoard extends Document {
  title: string;
  workspaceId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  isStarred: boolean;
  lastOpenedAt: Date;
  snapshot: Record<string, any>;
  shareToken?: string;
  shareExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BoardSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isStarred: { type: Boolean, default: false },
    lastOpenedAt: { type: Date, default: Date.now },
    snapshot: { type: Schema.Types.Mixed, default: { elements: [] } },
    shareToken: { type: String, default: null },
    shareExpiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Board = mongoose.model<IBoard>('Board', BoardSchema);
