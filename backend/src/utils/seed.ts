import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { Workspace } from '../models/Workspace.js';
import { Board } from '../models/Board.js';
import { Note } from '../models/Note.js';

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI);

    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await Workspace.deleteMany({});
    await Board.deleteMany({});
    await Note.deleteMany({});

    console.log('[Seed] Creating demo users...');
    const passwordHash = await bcrypt.hash('password123', 10);

    const user1 = await User.create({
      name: 'Alice Johnson',
      email: 'alice@example.com',
      passwordHash,
      isVerified: true,
    });

    const user2 = await User.create({
      name: 'Bob Smith',
      email: 'bob@example.com',
      passwordHash,
      isVerified: true,
    });

    console.log('[Seed] Creating workspaces...');
    const demoWorkspace = await Workspace.create({
      name: 'Engineering & Design Team',
      ownerId: user1._id,
      members: [
        { userId: user1._id, role: 'owner' },
        { userId: user2._id, role: 'editor' },
      ],
    });

    console.log('[Seed] Creating demo board...');
    const demoBoard = await Board.create({
      title: 'Q3 Product Roadmap Brainstorm',
      workspaceId: demoWorkspace._id,
      ownerId: user1._id,
      isStarred: true,
      snapshot: {
        elements: [
          { id: '1', type: 'rectangle', x: 100, y: 150, width: 140, height: 90, fill: '#3b82f6', stroke: '#1d4ed8' },
          { id: '2', type: 'sticky', x: 300, y: 150, width: 160, height: 160, fill: '#fef08a', text: 'Launch v2.0 UI components' },
          { id: '3', type: 'text', x: 100, y: 80, text: 'Roadmap Goals', fontSize: 24, fill: '#0f172a' },
        ],
      },
    });

    console.log('[Seed] Creating meeting notes...');
    await Note.create({
      boardId: demoBoard._id,
      content: 'Meeting Minutes:\n- Discussed Q3 roadmap targets.\n- Agreed on using Yjs CRDT for notes sync.\n- Action items assigned to Bob for frontend design.',
    });

    console.log('=================================================');
    console.log('✅ Database Seeded Successfully!');
    console.log(`👤 Demo Owner: alice@example.com / password123`);
    console.log(`👤 Demo Editor: bob@example.com / password123`);
    console.log(`📋 Demo Board ID: ${demoBoard._id}`);
    console.log('=================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedDatabase();
