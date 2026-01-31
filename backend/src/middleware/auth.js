import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';

/**
 * Xác thực JWT và gắn req.user
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Token không hợp lệ' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true, email: true, fullName: true, role: true, isActive: true },
    });
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: 'Tài khoản không tồn tại hoặc đã bị vô hiệu hóa' });
    }
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token đã hết hạn' });
    }
    return res.status(401).json({ success: false, error: 'Xác thực thất bại' });
  }
};

/**
 * Chỉ cho phép các role được liệt kê
 */
export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Chưa đăng nhập' });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, error: 'Bạn không có quyền thực hiện thao tác này' });
  }
  next();
};
