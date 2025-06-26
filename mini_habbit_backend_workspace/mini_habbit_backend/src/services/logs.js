const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * PUBLIC_INTERFACE
 * Provides CRUD operations for logging/checking habits (done/not done) for a given day.
 * All access is strictly restricted to logs of the current user.
 */
class LogsService {
  // PUBLIC_INTERFACE
  // Returns logs for a user in a date range (optionally for a habit)
  async listLogs(userId, { habitId, from, to, day }) {
    // Enforce date range or single day filter
    let where = { habit: { ownerId: userId } };
    if (habitId) where.habitId = parseInt(habitId, 10);
    if (from && to) {
      where.day = { gte: new Date(from), lte: new Date(to) };
    } else if (day) {
      where.day = { equals: new Date(day) };
    }
    const logs = await prisma.log.findMany({
      where,
      select: { id: true, habitId: true, day: true, done: true },
      orderBy: [{ habitId: 'desc' }, { day: 'asc' }]
    });
    return logs;
  }

  // PUBLIC_INTERFACE
  // Set or update a log entry by habit, day, and done status
  async upsertLog(userId, habitId, day, done) {
    if (typeof done !== 'boolean') throw new Error('done must be true or false');
    // Only allow user to log their own habit
    const habit = await prisma.habit.findUnique({ where: { id: habitId } });
    if (!habit || habit.ownerId !== userId) throw new Error('Not found or forbidden');
    const isoDay = (new Date(day)).toISOString().slice(0, 10); // YYYY-MM-DD
    const existing = await prisma.log.findFirst({
      where: { habitId, day: new Date(isoDay) }
    });
    let log;
    if (existing) {
      log = await prisma.log.update({
        where: { id: existing.id },
        data: { done },
        select: { id: true, habitId: true, day: true, done: true }
      });
    } else {
      log = await prisma.log.create({
        data: {
          habitId,
          day: new Date(isoDay),
          done
        },
        select: { id: true, habitId: true, day: true, done: true }
      });
    }
    return log;
  }

  // PUBLIC_INTERFACE
  // PATCH log (by id, only if user owns it via habit)
  async updateLogById(userId, logId, payload) {
    const log = await prisma.log.findUnique({ where: { id: logId }, include: { habit: true } });
    if (!log || log.habit.ownerId !== userId) throw new Error('Not found or forbidden');
    if ('done' in payload && typeof payload.done !== 'boolean') throw new Error('done must be boolean');
    const updated = await prisma.log.update({
      where: { id: logId },
      data: { done: payload.done },
      select: { id: true, habitId: true, day: true, done: true }
    });
    return updated;
  }
}

module.exports = new LogsService();
