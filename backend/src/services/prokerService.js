const pool = require('../../config/db');
const { getScheduleDate } = require('../utils/dateHelper');

/**
 * Service to evaluate proker schedules, calculate progress %, detect delays, and sync notifications
 */
async function evaluateProker(prokerId, connection = pool) {
  const [prokers] = await connection.query('SELECT * FROM proker WHERE id = ?', [prokerId]);
  if (prokers.length === 0) return;
  const proker = prokers[0];

  const [schedules] = await connection.query('SELECT * FROM proker_schedule WHERE proker_id = ?', [prokerId]);
  const currentDate = new Date();

  let total = schedules.length;
  let completed = schedules.filter(s => s.status === 'Terlaksana').length;
  let progress = total > 0 ? (completed / total) * 100 : 0.0;

  let hasDelayed = false;
  let hasNotStartedPastSchedule = false;
  let lastScheduleDate = null;
  let firstScheduleDate = null;
  let pastTargetCount = 0;

  for (const s of schedules) {
    const sDate = getScheduleDate(proker.tahun_kepengurusan, s.bulan, s.tanggal);
    if (sDate) {
      if (!lastScheduleDate || sDate > lastScheduleDate) lastScheduleDate = sDate;
      if (!firstScheduleDate || sDate < firstScheduleDate) firstScheduleDate = sDate;

      if (sDate <= currentDate) {
        pastTargetCount++;
        if (s.status === 'Tidak Terlaksana') {
          hasDelayed = true;
        } else if (s.status === 'Belum Mulai') {
          hasNotStartedPastSchedule = true;
        }
      }
    }
  }

  let finalStatus = proker.status;
  if (total > 0 && completed === total) {
    finalStatus = 'Selesai';
  } else if (hasDelayed || hasNotStartedPastSchedule) {
    finalStatus = 'Terlambat';
  } else if (completed > 0) {
    finalStatus = 'Sedang Berjalan';
  } else if (firstScheduleDate && firstScheduleDate <= currentDate) {
    finalStatus = 'Sedang Berjalan';
  } else {
    finalStatus = 'Belum Mulai';
  }

  await connection.query('UPDATE proker SET progres = ?, status = ? WHERE id = ?', [
    progress.toFixed(2),
    finalStatus,
    prokerId
  ]);

  // Notifications Sync
  const alertsToCreate = [];
  if (hasNotStartedPastSchedule || hasDelayed) {
    alertsToCreate.push({
      type: 'delayed',
      message: `Program kerja "${proker.kegiatan}" memiliki jadwal yang terlewat atau tidak terlaksana.`
    });
  }

  const [existingNotifs] = await connection.query(
    'SELECT id, type FROM proker_notifications WHERE proker_id = ? AND is_read = 0',
    [prokerId]
  );

  for (const alert of alertsToCreate) {
    const found = existingNotifs.find(n => n.type === alert.type);
    if (!found) {
      await connection.query(
        'INSERT INTO proker_notifications (proker_id, type, message) VALUES (?, ?, ?)',
        [prokerId, alert.type, alert.message]
      );
    }
  }

  for (const notif of existingNotifs) {
    const remains = alertsToCreate.find(a => a.type === notif.type);
    if (!remains) {
      await connection.query('UPDATE proker_notifications SET is_read = 1 WHERE id = ?', [notif.id]);
    }
  }
}

async function evaluateAllProkers() {
  const [prokers] = await pool.query('SELECT id FROM proker');
  for (const p of prokers) {
    await evaluateProker(p.id);
  }
}

module.exports = {
  evaluateProker,
  evaluateAllProkers,
};
