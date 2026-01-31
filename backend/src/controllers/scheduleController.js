import { prisma } from '../config/prisma.js';

/**
 * Tạo mã lịch: PM-YYYYMMDD-XXX
 */
function generateScheduleCode(date) {
  const d = String(date).replace(/-/g, '');
  return `PM-${d}-001`; // Có thể query max rồi +1
}

/**
 * GET /api/v1/schedules - Danh sách lịch đặt
 */
export async function list(req, res, next) {
  try {
    const { page = 1, limit = 10, status, date_from, date_to } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = {};
    if (status) where.status = status;
    if (date_from) where.plannedDate = { ...where.plannedDate, gte: date_from };
    if (date_to) where.plannedDate = { ...where.plannedDate, lte: date_to };

    const [schedules, total] = await Promise.all([
      prisma.premixSchedule.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: [{ plannedDate: 'desc' }, { plannedTime: 'desc' }],
        include: {
          createdBy: { select: { id: true, fullName: true } },
          approvedBy: { select: { id: true, fullName: true } },
          items: true,
        },
      }),
      prisma.premixSchedule.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        schedules,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/schedules/:id - Chi tiết lịch đặt
 */
export async function getById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const schedule = await prisma.premixSchedule.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, fullName: true, email: true } },
        approvedBy: { select: { id: true, fullName: true } },
        items: true,
      },
    });
    if (!schedule) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy lịch đặt' });
    }
    res.json({ success: true, data: schedule });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/schedules - Tạo lịch đặt mới
 */
export async function create(req, res, next) {
  try {
    const { planned_date, planned_time, quantity, unit, priority, notes, items } = req.body;
    const plannedDate = planned_date || req.body.plannedDate;
    const plannedTime = planned_time || req.body.plannedTime;
    if (!plannedDate || !plannedTime || quantity == null) {
      return res.status(400).json({
        success: false,
        error: 'Thiếu thông tin: planned_date, planned_time, quantity',
      });
    }
    const scheduleCode = generateScheduleCode(plannedDate);
    const schedule = await prisma.premixSchedule.create({
      data: {
        scheduleCode,
        plannedDate,
        plannedTime: String(plannedTime).slice(0, 5),
        quantity: Number(quantity),
        unit: unit || 'kg',
        priority: priority || 'medium',
        notes: notes || null,
        createdById: req.user.id,
        items: Array.isArray(items) && items.length
          ? {
              create: items.map((i) => ({
                ingredientName: i.ingredient_name || i.ingredientName,
                quantityRequired: Number(i.quantity_required ?? i.quantityRequired ?? 0),
                unit: i.unit || 'kg',
                percentage: i.percentage != null ? Number(i.percentage) : null,
              })),
            }
          : undefined,
      },
      include: { items: true },
    });
    res.status(201).json({ success: true, data: schedule });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/v1/schedules/:id - Cập nhật lịch đặt (chỉ khi status = pending)
 */
export async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    const schedule = await prisma.premixSchedule.findUnique({ where: { id } });
    if (!schedule) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy lịch đặt' });
    }
    if (schedule.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Chỉ được sửa lịch đang chờ duyệt' });
    }
    const { planned_date, planned_time, quantity, unit, priority, notes } = req.body;
    const data = {};
    if (planned_date != null) data.plannedDate = planned_date;
    if (planned_time != null) data.plannedTime = String(planned_time).slice(0, 5);
    if (quantity != null) data.quantity = Number(quantity);
    if (unit != null) data.unit = unit;
    if (priority != null) data.priority = priority;
    if (notes !== undefined) data.notes = notes;

    const updated = await prisma.premixSchedule.update({
      where: { id },
      data,
      include: { items: true },
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/schedules/:id
 */
export async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    const schedule = await prisma.premixSchedule.findUnique({ where: { id } });
    if (!schedule) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy lịch đặt' });
    }
    if (schedule.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Chỉ được xóa lịch đang chờ duyệt' });
    }
    await prisma.premixSchedule.delete({ where: { id } });
    res.json({ success: true, message: 'Đã xóa lịch đặt' });
  } catch (err) {
    next(err);
  }
}
