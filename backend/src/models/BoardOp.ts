import mongoose, { Schema, Document } from 'mongoose';

export type OpType = 'add' | 'update' | 'delete' | 'clear';

export interface IBoardOp extends Document {
  boardId: mongoose.Types.ObjectId;
  opType: OpType;
  payload: any;
  userId: mongoose.Types.ObjectId;
  sequenceId: number;
  createdAt: Date;
}

const BoardOpSchema: Schema = new Schema(
  {
    boardId: { type: Schema.Types.ObjectId, ref: 'Board', required: true, index: true },
    opType: { type: String, enum: ['add', 'update', 'delete', 'clear'], required: true },
    payload: { type: Schema.Types.Mixed, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sequenceId: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const BoardOp = mongoose.model<IBoardOp>('BoardOp', BoardOpSchema);
