-- Performance indexes for Jadwal Saya (booking list) pages.
-- Prior schema had no secondary indexes; every booking list query did a sequential scan.

-- Booking: hot lookups are by userId (end user), bidanId (bidan), or status (admin),
-- always ordered by createdAt DESC. Composite (col, createdAt DESC) lets Postgres
-- satisfy WHERE + ORDER BY + LIMIT from a single index walk.
CREATE INDEX IF NOT EXISTS "Booking_userId_createdAt_idx"
  ON "Booking" ("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Booking_bidanId_createdAt_idx"
  ON "Booking" ("bidanId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Booking_status_createdAt_idx"
  ON "Booking" ("status", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Booking_createdAt_idx"
  ON "Booking" ("createdAt" DESC);

-- Availability: bidan detail page filters by (bidanId, isBooked=false, date >= today).
CREATE INDEX IF NOT EXISTS "Availability_bidanId_date_idx"
  ON "Availability" ("bidanId", "date");
CREATE INDEX IF NOT EXISTS "Availability_bidanId_isBooked_date_idx"
  ON "Availability" ("bidanId", "isBooked", "date");

-- Message: chat thread fetches all messages for a booking ordered by createdAt.
CREATE INDEX IF NOT EXISTS "Message_bookingId_createdAt_idx"
  ON "Message" ("bookingId", "createdAt");

-- Notification: home/header badge counts unread per user, list orders by createdAt DESC.
CREATE INDEX IF NOT EXISTS "Notification_userId_isRead_createdAt_idx"
  ON "Notification" ("userId", "isRead", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Notification_bookingId_idx"
  ON "Notification" ("bookingId");
