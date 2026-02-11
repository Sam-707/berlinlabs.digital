# Booking System Template

Ready-to-use template for building appointment and reservation systems.

---

## Quick Start Prompt

```
You are building a Booking/Reservation System for [SERVICE TYPE].

BUSINESS CONTEXT:
- Target Customers: [WHO BOOKS - e.g., Individuals, Businesses]
- Target Providers: [WHO PROVIDES - e.g., Consultants, Salons, Restaurants]
- Problem: [THE PAIN POINT]
- Solution: [YOUR SOLUTION]
- Business Model: MARKETPLACE with commission or SUBSCRIPTION for providers
- Primary Goal: Get customers to book, providers to accept bookings

USER ROLES:
- Public: Browse providers, view availability, book appointments
- Customers: Manage bookings, leave reviews, cancel/reschedule
- Providers: Manage availability, accept/decline bookings, view earnings
- Admin: Manage all users, bookings, disputes, analytics

CORE PAGES:
- / - Landing page with search
- /search - Find providers by [location/service/category]
- /provider/[slug] - Provider profile with booking calendar
- /booking/[id] - Booking details and management
- /dashboard/customer - My bookings (upcoming, past, canceled)
- /dashboard/provider - Availability, booking requests, earnings
- /admin - Admin dashboard

DATA STRUCTURE:
- users, profiles (role: customer, provider, admin)
- providers (provider profiles)
  - id, user_id, business_name, description, category
  - location (address, city, country, coordinates)
  - price_range, rating, verification_status
  - availability_buffer (minutes between bookings)
- services (services offered by providers)
  - id, provider_id, name, description, duration, price
  - currency, max_bookings_per_day
- availability (provider available slots)
  - id, provider_id, date, start_time, end_time, status
  - recurrence_rule (for recurring availability)
- bookings
  - id, customer_id, provider_id, service_id
  - availability_id, scheduled_at, duration
  - status (pending/confirmed/completed/canceled/no_show)
  - notes, deposit_amount, total_amount
  - created_at, updated_at
- reviews (customer reviews of providers)
- transactions (payment records)
- availability_blocks (blocked times - breaks, holidays)

BOOKING FLOW:
1. Customer selects provider and service
2. Choose available time slot
3. Confirm booking details
4. Pay deposit (if applicable)
5. Booking created (pending)
6. Provider accepts/declines
7. Customer gets confirmation
8. Reminders sent (email/SMS)

AVAILABILITY MANAGEMENT:
- Recurring availability (e.g., Mon-Fri 9am-5pm)
- One-off availability blocks
- Buffer time between bookings
- Time zone handling
- Sync with external calendars (Google, Apple)

PAYMENT:
- Deposit required (X% or fixed amount)
- Full payment before booking
- Refund policy (cancel X hours before)
- Commission on completed bookings

SECURITY RULES:
- Public: View providers and their availability
- Customers: Manage own bookings, review providers after booking
- Providers: Manage own availability and booking requests
- Admin: Full access, dispute resolution

FEATURES:
- Calendar-based booking interface
- Recurring availability setup
- Buffer times between bookings
- Booking requests and confirmations
- Reminders (email/SMS/WhatsApp)
- Deposits and payments
- Cancellation policy enforcement
- Reviews after completed bookings
- Provider earnings tracking
- Calendar sync (Google, Apple, Outlook)

DELIVERABLES:
1. Complete database schema
2. Provider profile with availability setup
3. Calendar-based booking flow
4. Booking management (accept/decline/reschedule/cancel)
5. Payment integration with deposits
6. Reminder system
7. Review system
8. Calendar sync (optional)

Please generate the complete booking system.
```

---

## Availability Management Pattern

```typescript
// Create recurring availability
async function createRecurringAvailability(
  providerId: string,
  config: {
    daysOfWeek: number[], // 0-6 (Sunday-Saturday)
    startTime: string, // '09:00'
    endTime: string, // '17:00'
    startDate: Date
    endDate?: Date
  }
) {
  const slots = []

  let currentDate = new Date(config.startDate)
  const end = config.endDate || new Date(config.startDate.getTime() + 90 * 24 * 60 * 60 * 1000) // 90 days

  while (currentDate <= end) {
    if (config.daysOfWeek.includes(currentDate.getDay())) {
      slots.push({
        provider_id: providerId,
        date: currentDate.toISOString().split('T')[0],
        start_time: config.startTime,
        end_time: config.endTime,
        status: 'available'
      })
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Bulk insert
  await supabase.from('availability').insert(slots)
}

// Get available slots for booking
async function getAvailableSlots(providerId: string, startDate: Date, endDate: Date) {
  // Get provider's availability
  const { data: availability } = await supabase
    .from('availability')
    .select('*')
    .eq('provider_id', providerId)
    .gte('date', startDate.toISOString())
    .lte('date', endDate.toISOString())
    .eq('status', 'available')

  // Get existing bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select('scheduled_at, duration')
    .eq('provider_id', providerId)
    .in('status', ['pending', 'confirmed'])
    .gte('scheduled_at', startDate.toISOString())
    .lte('scheduled_at', endDate.toISOString())

  // Filter out booked slots
  const availableSlots = availability.filter(slot => {
    const slotStart = new Date(`${slot.date}T${slot.start_time}`)
    const slotEnd = new Date(`${slot.date}T${slot.end_time}`)

    // Check if any booking overlaps
    return !bookings.some(booking => {
      const bookingStart = new Date(booking.scheduled_at)
      const bookingEnd = new Date(bookingStart.getTime() + booking.duration * 60 * 1000)

      return (
        (bookingStart >= slotStart && bookingStart < slotEnd) ||
        (bookingEnd > slotStart && bookingEnd <= slotEnd) ||
        (bookingStart <= slotStart && bookingEnd >= slotEnd)
      )
    })
  })

  return availableSlots
}
```

---

## Booking Flow

```typescript
// Complete booking flow
async function createBooking(
  providerId: string,
  serviceId: string,
  slotId: string,
  customerId: string,
  notes?: string
) {
  // Get service details
  const { data: service } = await supabase
    .from('services')
    .select('*')
    .eq('id', serviceId)
    .single()

  // Get availability slot
  const { data: slot } = await supabase
    .from('availability')
    .select('*')
    .eq('id', slotId)
    .single()

  // Calculate scheduled time
  const scheduledAt = new Date(`${slot.date}T${slot.start_time}`)

  // Calculate pricing
  const depositAmount = service.price * 0.2 // 20% deposit
  const totalAmount = service.price

  // Create booking
  const { data: booking } = await supabase
    .from('bookings')
    .insert({
      customer_id: customerId,
      provider_id: providerId,
      service_id: serviceId,
      availability_id: slotId,
      scheduled_at: scheduledAt.toISOString(),
      duration: service.duration,
      status: 'pending',
      notes,
      deposit_amount: depositAmount,
      total_amount: totalAmount
    })
    .select()
    .single()

  // Process deposit payment
  const payment = await processDepositPayment(booking)

  // Mark slot as booked
  await supabase
    .from('availability')
    .update({ status: 'booked', booking_id: booking.id })
    .eq('id', slotId)

  // Send notifications
  await notifyProvider(booking)
  await notifyCustomer(booking)

  return booking
}
```

---

## Cancellation & Refunds

```typescript
// Handle booking cancellation
async function cancelBooking(
  bookingId: string,
  userId: string,
  reason: string
) {
  // Get booking
  const { data: booking } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single()

  // Check permissions
  if (booking.customer_id !== userId && booking.provider_id !== userId) {
    throw new Error('Not authorized')
  }

  // Check if already canceled
  if (booking.status === 'canceled') {
    throw new Error('Booking already canceled')
  }

  // Check cancellation policy
  const hoursUntilBooking = (new Date(booking.scheduled_at).getTime() - Date.now()) / (1000 * 60 * 60)
  const minCancellationHours = 24

  if (hoursUntilBooking < minCancellationHours) {
    // Late cancellation - no refund or partial refund
    const refundPolicy = 'partial' // or 'none'
    // Handle accordingly
  }

  // Process refund if deposit paid
  if (booking.deposit_amount > 0) {
    await processRefund(booking.payment_intent_id, booking.deposit_amount)
  }

  // Update booking status
  await supabase
    .from('bookings')
    .update({
      status: 'canceled',
      cancellation_reason: reason,
      canceled_at: new Date().toISOString()
    })
    .eq('id', bookingId)

  // Release availability slot
  await supabase
    .from('availability')
    .update({ status: 'available', booking_id: null })
    .eq('id', booking.availability_id)

  // Notify both parties
  await notifyCancellation(booking)

  return booking
}
```

---

## Reminder System

```typescript
// Send reminders before bookings
async function sendBookingReminders() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  const endOfTomorrow = new Date(tomorrow)
  endOfTomorrow.setHours(23, 59, 59, 999)

  // Get bookings for tomorrow
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, customers:customer_id(*), providers:provider_id(*)')
    .eq('status', 'confirmed')
    .gte('scheduled_at', tomorrow.toISOString())
    .lte('scheduled_at', endOfTomorrow.toISOString())

  for (const booking of bookings) {
    // Send reminder to customer
    await sendEmail({
      to: booking.customers.email,
      template: 'booking-reminder-customer',
      data: booking
    })

    // Send reminder to provider
    await sendEmail({
      to: booking.providers.email,
      template: 'booking-reminder-provider',
      data: booking
    })
  }
}
```

---

## Database Schema

```sql
-- Providers
CREATE TABLE public.providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  price_min DECIMAL(10, 2),
  price_max DECIMAL(10, 2),
  currency TEXT DEFAULT 'EUR',
  rating DECIMAL(3, 2),
  review_count INTEGER DEFAULT 0,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'suspended')),
  availability_buffer INTEGER DEFAULT 0, -- minutes between bookings
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- minutes
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  max_bookings_per_day INTEGER DEFAULT 10,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Availability
CREATE TABLE public.availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'booked', 'blocked')),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  recurrence_id UUID, -- For recurring availability
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider_id, date, start_time)
);

-- Bookings
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL NOT NULL,
  availability_id UUID REFERENCES public.availability(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL, -- minutes
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'canceled', 'no_show')),
  notes TEXT,
  deposit_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_intent_id TEXT,
  cancellation_reason TEXT,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews
CREATE TABLE public.provider_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blocked availability (holidays, breaks)
CREATE TABLE public.availability_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_availability_provider_date ON public.availability(provider_id, date);
CREATE INDEX idx_bookings_customer ON public.bookings(customer_id);
CREATE INDEX idx_bookings_provider ON public.bookings(provider_id);
CREATE INDEX idx_bookings_scheduled ON public.bookings(scheduled_at);

-- Enable RLS
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view verified providers"
  ON public.providers FOR SELECT
  USING (verification_status = 'verified');

CREATE POLICY "Providers can manage own profile"
  ON public.providers FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Public can view available slots"
  ON public.availability FOR SELECT
  USING (status = 'available');

CREATE POLICY "Customers can view own bookings"
  ON public.bookings FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "Providers can view own bookings"
  ON public.bookings FOR SELECT
  USING (provider_id = auth.uid());
```

---

## Booking System Types

| Type | Description | Key Features |
|------|-------------|--------------|
| **Appointments** | Service bookings | Calendar, deposits, reminders |
| **Restaurant** | Table reservations | Party size, time slots, waitlist |
| **Events** | Ticket sales | Seating, check-in, refunds |
| **Classes** | Course/workshop bookings | Capacity, waiting lists, materials |
| **Rentals** | Equipment/venue bookings | Availability calendar, deposits, damage waivers |

---

## Next Steps

1. **Customize with your booking type**
2. **Implement Phase 1-3** for foundation
3. **Build calendar interface**
4. **Implement availability management**
5. **Add payment and reminders**
6. **Test booking flow end-to-end**

---

## See Also

- [Marketplace Template](./marketplace.md) - For service marketplaces
- [SaaS Template](./saas.md) - For subscription-based booking systems
