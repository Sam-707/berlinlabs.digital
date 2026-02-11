---
title: "Booking & Reservation System Template"
description: "Complete SaaS template for appointments, restaurant bookings, and event tickets"
category: "Template"
tags: ["booking", "calendar", "scheduling", "appointments"]
difficulty: "Intermediate"
timeRequired: "18-25 hours"
dependencies: ["Phase 1", "Phase 2", "Phase 3", "Phase 4A", "Phase 4B"]
---

# Booking & Reservation System Template

> For: Appointments, restaurant bookings, event tickets

---

## Quick Start

Use this template with the [Foundation Framework](../phases/01-foundation-framework.md).

---

## Business Context

```yaml
Target:
  Customers:
    - Need to book appointments/services
    - Want to see availability and book instantly
    - Need reminders and confirmations

  Providers:
    - Offer services/appointments
    - Need calendar management
    - Want automated booking system

Business Model:
  - Transaction fee on bookings (5-15%)
  - OR Subscription for providers
  - OR Both

Primary Goal:
  Get providers to list services and customers to book them
```

---

## User Roles & Permissions

| Role | Permissions |
|------|-------------|
| Public | Browse providers, view availability, make bookings (as guest) |
| Customer | All public + Manage bookings, leave reviews, booking history |
| Provider | All customer + Manage services, set availability, accept/reject bookings, view earnings |
| Admin | Full platform access |

---

## Core Pages

### Public Pages
- Landing page
- Browse providers/services
- Search by category, location, date
- Provider profiles with calendar

### Customer Pages
- Dashboard
- My bookings
- Booking history
- Reviews

### Provider Pages
- Dashboard
- Services management
- Calendar/availability settings
- Bookings management
- Earnings

### Admin Pages
- All bookings
- All providers
- Platform analytics
- Dispute resolution

---

## Data Structure

```sql
-- Service providers
CREATE TABLE providers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone TEXT,
  website TEXT,
  verified BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services offered by providers
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration INTEGER NOT NULL, -- minutes
  category TEXT,
  buffer_time INTEGER DEFAULT 0, -- minutes between bookings
  advance_booking INTEGER DEFAULT 14, -- days in advance
  cancellation_policy TEXT DEFAULT '24h', -- 24h, 12h, flexible
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Provider availability (recurring schedule)
CREATE TABLE availability_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL, -- 0-6 (Sunday-Saturday)
  start_time TIME NOT NULL, -- '09:00:00'
  end_time TIME NOT NULL, -- '17:00:00'
  UNIQUE(provider_id, day_of_week, start_time)
);

-- Specific availability slots (can override rules)
CREATE TABLE availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  is_booked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(start_time, provider_id)
);

-- Blocked time (time off, breaks)
CREATE TABLE blocked_time (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number TEXT UNIQUE NOT NULL, -- Human-readable like "BK-12345"
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Null for guest bookings
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  slot_id UUID REFERENCES availability_slots(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, confirmed, cancelled, completed, no_show
  amount DECIMAL(10, 2),
  deposit_amount DECIMAL(10, 2), -- For partial payment
  paid_amount DECIMAL(10, 2) DEFAULT 0,
  stripe_payment_intent_id TEXT UNIQUE,
  notes TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(booking_id) -- One review per booking
);

-- Reminders
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- email, sms
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_services_provider ON services(provider_id);
CREATE INDEX idx_services_category ON services(category) WHERE is_active = TRUE;
CREATE INDEX idx_slots_provider_time ON availability_slots(provider_id, start_time) WHERE is_available = TRUE;
CREATE INDEX idx_bookings_provider_time ON bookings(provider_id, start_time);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_reviews_provider ON reviews(provider_id);
```

---

## RLS Policies

```sql
-- Enable RLS
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_time ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Providers: Public read, provider CRUD own
CREATE POLICY "Public can view providers"
ON providers FOR SELECT USING (true);

CREATE POLICY "Providers can manage own profile"
ON providers FOR ALL USING (auth.uid() = id);

-- Services: Public read active, provider CRUD own
CREATE POLICY "Public can view active services"
ON services FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Providers can manage own services"
ON services FOR ALL USING (auth.uid() = provider_id);

-- Availability: Provider CRUD own
CREATE POLICY "Providers can manage own availability"
ON availability_rules FOR ALL USING (auth.uid() = provider_id);

CREATE POLICY "Providers can manage own slots"
ON availability_slots FOR ALL USING (auth.uid() = provider_id);

CREATE POLICY "Providers can manage own blocked_time"
ON blocked_time FOR ALL USING (auth.uid() = provider_id);

-- Bookings: Complex rules
CREATE POLICY "Providers can view own bookings"
ON bookings FOR SELECT USING (auth.uid() = provider_id);

CREATE POLICY "Customers can view own bookings"
ON bookings FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Anyone can create booking"
ON bookings FOR INSERT WITH CHECK (true);

CREATE POLICY "Providers can update own bookings"
ON bookings FOR UPDATE USING (auth.uid() = provider_id);

CREATE POLICY "Customers can cancel own bookings"
ON bookings FOR UPDATE USING (
  auth.uid() = customer_id AND
  status = 'pending'
);

-- Reviews: Public read, customer create for completed bookings
CREATE POLICY "Public can view reviews"
ON reviews FOR SELECT USING (true);

CREATE POLICY "Customers can create reviews for completed bookings"
ON reviews FOR INSERT WITH CHECK (
  auth.uid() = customer_id AND
  EXISTS (
    SELECT 1 FROM bookings
    WHERE bookings.id = reviews.booking_id
    AND bookings.customer_id = auth.uid()
    AND bookings.status = 'completed'
  )
);
```

---

## Key Features

### 1. Calendar Component

```typescript
// components/BookingCalendar.tsx
import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns'

export function BookingCalendar({
  providerId,
  serviceId,
  onSlotSelect,
  selectedDate
}: {
  providerId: string
  serviceId?: string
  onSlotSelect: (slot: any) => void
  selectedDate?: Date
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availableSlots, setAvailableSlots] = useState([])
  const [loading, setLoading] = useState(false)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  useEffect(() => {
    if (selectedDate) {
      loadSlotsForDate(selectedDate)
    }
  }, [selectedDate, providerId, serviceId])

  async function loadSlotsForDate(date: Date) {
    setLoading(true)
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    let query = supabase
      .from('availability_slots')
      .select('*')
      .eq('provider_id', providerId)
      .eq('is_available', true)
      .eq('is_booked', false)
      .gte('start_time', startOfDay.toISOString())
      .lte('start_time', endOfDay.toISOString())
      .order('start_time')

    if (serviceId) {
      query = query.eq('service_id', serviceId)
    }

    const { data } = await query
    setAvailableSlots(data || [])
    setLoading(false)
  }

  function handleDayClick(date: Date) {
    setCurrentMonth(date)
    loadSlotsForDate(date)
  }

  return (
    <div className="booking-calendar">
      <div className="calendar-header">
        <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}>
          ←
        </button>
        <h3>{format(currentMonth, 'MMMM yyyy')}</h3>
        <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}>
          →
        </button>
      </div>

      <div className="calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="day-name">{day}</div>
        ))}

        {days.map(day => {
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          const isDayToday = isToday(day)

          return (
            <button
              key={day.toISOString()}
              className={`day ${!isCurrentMonth ? 'other-month' : ''} ${isSelected ? 'selected' : ''} ${isDayToday ? 'today' : ''}`}
              onClick={() => handleDayClick(day)}
              disabled={!isCurrentMonth}
            >
              {format(day, 'd')}
            </button>
          )
        })}
      </div>

      {selectedDate && (
        <div className="time-slots">
          <h4>Available times for {format(selectedDate, 'MMM d, yyyy')}</h4>
          {loading ? (
            <div>Loading...</div>
          ) : availableSlots.length === 0 ? (
            <div>No available slots</div>
          ) : (
            <div className="slots-grid">
              {availableSlots.map(slot => (
                <button
                  key={slot.id}
                  onClick={() => onSlotSelect(slot)}
                  className="time-slot"
                >
                  {format(new Date(slot.start_time), 'HH:mm')}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

### 2. Booking Flow with Stripe

```typescript
// components/BookingFlow.tsx
export function BookingFlow({ provider, service, slot }: { provider: any, service: any, slot: any }) {
  const [step, setStep] = useState(1)
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  })
  const { data: { user } } = useAuth()

  async function handleBooking() {
    const bookingData = {
      provider_id: provider.id,
      customer_id: user?.id || null,
      customer_name: user ? user.user_metadata.display_name : customerInfo.name,
      customer_email: user ? user.email : customerInfo.email,
      customer_phone: customerInfo.phone,
      service_id: service.id,
      slot_id: slot.id,
      start_time: slot.start_time,
      end_time: slot.end_time,
      amount: service.price,
      notes: customerInfo.notes
    }

    // Create Stripe payment intent
    const response = await fetch('/api/create-booking-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    })

    const { clientSecret, bookingId } = await response.json()

    // Redirect to Stripe Checkout
    const stripe = await loadStripe(stripePublicKey)
    await stripe.redirectToCheckout({ clientSecret })
  }

  return (
    <div className="booking-flow">
      {step === 1 && (
        <div className="booking-summary">
          <h2>Confirm your booking</h2>
          <div className="summary-card">
            <img src={provider.avatar_url} alt={provider.business_name} />
            <div>
              <h3>{service.name}</h3>
              <p>{provider.business_name}</p>
              <p>{format(new Date(slot.start_time), 'PPp')}</p>
              <p className="price">€{service.price}</p>
            </div>
          </div>

          {!user && (
            <div className="customer-info">
              <h3>Your information</h3>
              <input
                type="text"
                placeholder="Full name"
                value={customerInfo.name}
                onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={customerInfo.email}
                onChange={e => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                required
              />
              <input
                type="tel"
                placeholder="Phone number"
                value={customerInfo.phone}
                onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
              />
              <textarea
                placeholder="Notes (optional)"
                value={customerInfo.notes}
                onChange={e => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
              />
            </div>
          )}

          <button onClick={handleBooking}>
            Proceed to Payment
          </button>
        </div>
      )}
    </div>
  )
}
```

### 3. Generate Availability Slots

```typescript
// supabase/functions/generate-slots/index.ts
serve(async (req) => {
  const { providerId, startDate, endDate } = await req.json()

  // Get availability rules
  const { data: rules } = await supabase
    .from('availability_rules')
    .select('*')
    .eq('provider_id', providerId)

  // Get existing slots and blocked time
  const { data: existingSlots } = await supabase
    .from('availability_slots')
    .select('start_time')
    .eq('provider_id', providerId)
    .gte('start_time', startDate)
    .lte('start_time', endDate)

  const { data: blockedTime } = await supabase
    .from('blocked_time')
    .select('*')
    .eq('provider_id', providerId)
    .or(`start_time.gte.${startDate},end_time.gte.${startDate}`)

  const existingSlotTimes = new Set(existingSlots?.map(s => s.start_time))
  const slotsToCreate = []

  // Generate slots for each day
  const start = new Date(startDate)
  const end = new Date(endDate)

  for (let date = start; date <= end; date.setDate(date.getDate() + 1)) {
    const dayOfWeek = date.getDay()
    const dayRules = rules?.filter(r => r.day_of_week === dayOfWeek) || []

    for (const rule of dayRules) {
      const [startHour, startMin] = rule.start_time.split(':').map(Number)
      const [endHour, endMin] = rule.end_time.split(':').map(Number)

      let slotStart = new Date(date)
      slotStart.setHours(startHour, startMin, 0, 0)

      const slotEnd = new Date(date)
      slotEnd.setHours(endHour, endMin, 0, 0)

      // Generate hourly slots
      while (slotStart < slotEnd) {
        const nextSlotStart = new Date(slotStart)
        nextSlotStart.setHours(slotStart.getHours() + 1)

        const slotStartStr = slotStart.toISOString()

        // Check if slot exists, is blocked, or is in the past
        if (!existingSlotTimes.has(slotStartStr) &&
            !isBlocked(slotStart, nextSlotStart, blockedTime) &&
            slotStart > new Date()) {
          slotsToCreate.push({
            provider_id: providerId,
            start_time: slotStartStr,
            end_time: nextSlotStart.toISOString()
          })
        }

        slotStart = nextSlotStart
      }
    }
  }

  // Bulk insert slots
  if (slotsToCreate.length > 0) {
    await supabase.from('availability_slots').insert(slotsToCreate)
  }

  return new Response(JSON.stringify({ created: slotsToCreate.length }))
})

function isBlocked(start: Date, end: Date, blockedTime: any[]) {
  return blockedTime?.some(blocked => {
    const blockedStart = new Date(blocked.start_time)
    const blockedEnd = new Date(blocked.end_time)
    return start < blockedEnd && end > blockedStart
  })
}
```

### 4. Provider Dashboard

```typescript
// components/ProviderDashboard.tsx
export function ProviderDashboard() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    todayBookings: 0,
    totalRevenue: 0,
    upcomingBookings: []
  })

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    const { data: { user } } = await supabase.auth.getUser()

    const [bookingsRes, todayRes, revenueRes] = await Promise.all([
      supabase
        .from('bookings')
        .select('status, amount, start_time')
        .eq('provider_id', user.id),

      supabase
        .from('bookings')
        .select('id')
        .eq('provider_id', user.id)
        .gte('start_time', new Date().setHours(0,0,0,0))
        .lt('start_time', new Date().setHours(23,59,59,999))
    ])

    const bookings = bookingsRes.data || []
    const todayCount = todayRes.data?.length || 0

    setStats({
      totalBookings: bookings.length,
      pendingBookings: bookings.filter(b => b.status === 'pending').length,
      todayBookings: todayCount,
      totalRevenue: bookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.amount || 0), 0),
      upcomingBookings: bookings
        .filter(b => b.status === 'confirmed' && new Date(b.start_time) > new Date())
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
        .slice(0, 5)
    })
  }

  return (
    <div className="provider-dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <label>Total Bookings</label>
          <value>{stats.totalBookings}</value>
        </div>
        <div className="stat-card">
          <label>Pending</label>
          <value>{stats.pendingBookings}</value>
        </div>
        <div className="stat-card">
          <label>Today</label>
          <value>{stats.todayBookings}</value>
        </div>
        <div className="stat-card">
          <label>Revenue</label>
          <value>€{stats.totalRevenue.toFixed(2)}</value>
        </div>
      </div>

      {stats.upcomingBookings.length > 0 && (
        <div className="upcoming-bookings">
          <h3>Upcoming Bookings</h3>
          {stats.upcomingBookings.map(booking => (
            <div key={booking.id} className="booking-item">
              <p>{format(new Date(booking.start_time), 'PPp')}</p>
              <span className={`status ${booking.status}`}>{booking.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

### 5. Booking Status Management

```typescript
// components/BookingManagement.tsx
export function BookingManagement({ booking }: { booking: any }) {
  async function updateStatus(status: string) {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', booking.id)

    if (error) toast.show('Failed to update status', { type: 'error' })
    else toast.show('Status updated', { type: 'success' })
  }

  async function cancelBooking(reason: string) {
    const { error } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString()
      })
      .eq('id', booking.id)

    if (error) toast.show('Failed to cancel booking', { type: 'error' })
    else {
      // Refund via Stripe
      await fetch('/api/refund-booking', {
        method: 'POST',
        body: JSON.stringify({ bookingId: booking.id })
      })
      toast.show('Booking cancelled and refunded', { type: 'success' })
    }
  }

  return (
    <div className="booking-management">
      <select
        value={booking.status}
        onChange={(e) => updateStatus(e.target.value)}
      >
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="completed">Completed</option>
        <option value="no_show">No Show</option>
        <option value="cancelled">Cancelled</option>
      </select>

      {booking.status !== 'cancelled' && booking.status !== 'completed' && (
        <button onClick={() => {
          const reason = prompt('Cancellation reason:')
          if (reason) cancelBooking(reason)
        }}>
          Cancel Booking
        </button>
      )}
    </div>
  )
}
```

---

## Email/SMS Reminders

```typescript
// lib/reminders.ts
// Run via cron job or scheduled edge function

export async function scheduleReminders(bookingId: string) {
  const { data: booking } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single()

  const bookingTime = new Date(booking.start_time)

  // Schedule reminders
  const reminders = [
    { type: 'email', hoursBefore: 24 },
    { type: 'email', hoursBefore: 2 },
    { type: 'sms', hoursBefore: 2 }
  ]

  for (const reminder of reminders) {
    const scheduledFor = new Date(bookingTime)
    scheduledFor.setHours(scheduledFor.getHours() - reminder.hoursBefore)

    await supabase.from('reminders').insert({
      booking_id: bookingId,
      type: reminder.type,
      scheduled_for: scheduledFor.toISOString()
    })
  }
}
```

---

## What's Next

1. Build calendar UI component
2. Implement booking flow with Stripe
3. Add email/SMS reminders
4. Build provider dashboard
5. Add review system

---

*Part of the [Berlin Solopreneur SaaS Prompt Pack](../README.md)*
