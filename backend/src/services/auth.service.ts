import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User, IUser } from '../models/User.js';
import { Workspace } from '../models/Workspace.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.utils.js';

export class AuthService {
  async register(name: string, email: string, password: string) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw { statusCode: 400, message: 'Email already registered' };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      name,
      email,
      passwordHash,
      verificationToken,
      isVerified: false,
    });

    // Automatically create a default personal workspace for the user
    const defaultWorkspace = await Workspace.create({
      name: `${name}'s Workspace`,
      ownerId: user._id,
      members: [{ userId: user._id, role: 'owner' }],
    });

    const accessToken = generateAccessToken({ userId: user._id.toString(), email: user.email, name: user.name });
    const refreshToken = generateRefreshToken({ userId: user._id.toString(), email: user.email, name: user.name });

    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    await user.save();

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        verificationToken: user.verificationToken,
      },
      defaultWorkspaceId: defaultWorkspace._id.toString(),
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string) {
    const user = await User.findOne({ email });
    if (!user) {
      throw { statusCode: 401, message: 'Invalid email or password' };
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw { statusCode: 401, message: 'Invalid email or password' };
    }

    const accessToken = generateAccessToken({ userId: user._id.toString(), email: user.email, name: user.name });
    const refreshToken = generateRefreshToken({ userId: user._id.toString(), email: user.email, name: user.name });

    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    await user.save();

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified,
      },
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw { statusCode: 401, message: 'Refresh token required' };
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (err) {
      throw { statusCode: 401, message: 'Invalid or expired refresh token' };
    }

    const user = await User.findById(payload.userId);
    if (!user || user.refreshToken !== refreshToken) {
      throw { statusCode: 401, message: 'Invalid refresh token' };
    }

    const newAccessToken = generateAccessToken({ userId: user._id.toString(), email: user.email, name: user.name });
    const newRefreshToken = generateRefreshToken({ userId: user._id.toString(), email: user.email, name: user.name });

    user.accessToken = newAccessToken;
    user.refreshToken = newRefreshToken;
    await user.save();

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async verifyEmail(token: string) {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      throw { statusCode: 400, message: 'Invalid or expired verification token' };
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return { message: 'Email verified successfully' };
  }

  async getCurrentUser(userId: string) {
    const user = await User.findById(userId).select('-passwordHash -refreshToken');
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }
    return user;
  }

  async logout(userId: string) {
    await User.findByIdAndUpdate(userId, { refreshToken: null, accessToken: null });
    return { message: 'Logged out successfully' };
  }
}
