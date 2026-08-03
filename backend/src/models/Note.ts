import mongoose, { Schema, Document } from 'mongoose';

export interface INote extends Document {
  boardId: mongoose.Types.ObjectId;
  content: string;
  stateVector?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema: Schema = new Schema(
  {
    boardId: { type: Schema.Types.ObjectId, ref: 'Board', required: true, unique: true },
    content: { type: String, default: '' },
    stateVector: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Note = mongoose.model<INote>('Note', NoteSchema);
