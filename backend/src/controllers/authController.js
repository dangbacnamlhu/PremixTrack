import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';

const ROLES = ['admin', 'planner', 'operator', 'qc', 'warehouse'];

/**
 * POST /api/v1/auth/register - Đăng ký (chỉ admin)
 */
export async function register(req, res, next) {
  try {
    const { username, email, password, full_name, role } = req.body;
    const fullName = full_name || req.body.fullName;
    if (!username || !email || !password || !fullName || !role) {
      return res.status(400).json({
        success: false,
        error: 'Thiếu thông tin: username, email, password, full_name, role',
      });
    }
    if (!ROLES.includes(role)) {
      return res.status(400).json({ success: false, error: 'Role không hợp lệ' });
    }
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email hoặc username đã tồn tại' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        fullName,
        role,
      },
      select: { id: true, username: true, email: true, fullName: true, role: true },
    });
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/auth/login
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Cần email và mật khẩu' });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: 'Email hoặc mật khẩu không đúng' });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Email hoặc mật khẩu không đúng' });
    }
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/auth/me - Thông tin user hiện tại
 */
export async function me(req, res, next) {
  try {
    res.json({ success: true, data: req.user });
  } catch (err) {
    next(err);
  }
}
