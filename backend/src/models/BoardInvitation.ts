import mongoose, { Schema, Document } from 'mongoose';

export interface IBoardInvitation extends Document {
  boardId: mongoose.Types.ObjectId;
  email: string;
  role: 'editor' | 'viewer';
  token: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BoardInvitationSchema: Schema = new Schema(
  {
    boardId: { type: Schema.Types.ObjectId, ref: 'Board', required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, enum: ['editor', 'viewer'], default: 'viewer' },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const BoardInvitation = mongoose.model<IBoardInvitation>('BoardInvitation', BoardInvitationSchema);
