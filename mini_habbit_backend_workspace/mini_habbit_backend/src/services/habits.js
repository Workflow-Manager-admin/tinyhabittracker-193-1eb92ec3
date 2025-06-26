const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * PUBLIC_INTERFACE
 * Provides CRUD operations for habits belonging to a specific user,
 * with all habit access/actions strictly scoped to the owner userId.
 */
class HabitsService {
  // PUBLIC_INTERFACE
  async listHabits(userId) {
    return await prisma.habit.findMany({
      where: { ownerId: userId },
      select: { id: true, name: true },
      orderBy: { id: 'desc' }
    });
  }

  // PUBLIC_INTERFACE
  async createHabit(userId, name) {
    if (typeof name !== 'string' || !name.trim() || name.length > 40) {
      throw new Error('Habit name must be 1-40 characters.');
    }
    const habit = await prisma.habit.create({
      data: { name: name.trim(), ownerId: userId },
      select: { id: true, name: true }
    });
    return habit;
  }

  // PUBLIC_INTERFACE
  async updateHabit(userId, habitId, newName) {
    if (!newName || typeof newName !== 'string' || !newName.trim() || newName.length > 40) {
      throw new Error('Habit name must be 1-40 characters.');
    }
    // Only allow user to update their own habit
    const updated = await prisma.habit.updateMany({
      where: { id: habitId, ownerId: userId },
      data: { name: newName.trim() }
    });
    if (updated.count === 0) throw new Error('Not found or forbidden');
    // Fetch updated
    const habit = await prisma.habit.findUnique({ where: { id: habitId }, select: { id: true, name: true } });
    return habit;
  }

  // PUBLIC_INTERFACE
  async deleteHabit(userId, habitId) {
    // Only allow user to delete their own habit
    const deleted = await prisma.habit.deleteMany({
      where: { id: habitId, ownerId: userId }
    });
    if (deleted.count === 0) throw new Error('Not found or forbidden');
    return true;
  }
}

module.exports = new HabitsService();
