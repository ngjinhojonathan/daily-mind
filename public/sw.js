let reminderTimer = null;
let meditationTimer = null;

function scheduleNotif(tag, title, body, timeStr, timerRef, setTimer) {
  if (timerRef) clearTimeout(timerRef);
  if (!timeStr) return null;

  const [hours, minutes] = timeStr.split(':').map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);

  const delay = target - now;
  return setTimeout(() => {
    self.registration.showNotification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag,
    });
    setTimer(scheduleNotif(tag, title, body, timeStr, null, setTimer));
  }, delay);
}

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SCHEDULE_REMINDER') {
    reminderTimer = scheduleNotif(
      'gratitude-reminder',
      '🌿 Daily Gratitude Reminder',
      'Take a moment to reflect on what you are grateful for today.',
      event.data.time,
      reminderTimer,
      (t) => { reminderTimer = t; }
    );
  }
  if (event.data?.type === 'CANCEL_REMINDER') {
    if (reminderTimer) clearTimeout(reminderTimer);
    reminderTimer = null;
  }
  if (event.data?.type === 'SCHEDULE_MEDITATION') {
    meditationTimer = scheduleNotif(
      'meditation-reminder',
      '🧘 Time to Meditate',
      'Your daily meditation session is waiting. Take a breath and begin.',
      event.data.time,
      meditationTimer,
      (t) => { meditationTimer = t; }
    );
  }
  if (event.data?.type === 'CANCEL_MEDITATION') {
    if (meditationTimer) clearTimeout(meditationTimer);
    meditationTimer = null;
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});
