import { writable, get } from 'svelte/store';

const createPersistentStore = (key, startValue) => {
  const isBrowser = typeof localStorage !== 'undefined';
  const saved = isBrowser ? localStorage.getItem(key) : null;
  const store = writable(saved ? JSON.parse(saved) : startValue);

  if (isBrowser) {
    store.subscribe(value => {
      localStorage.setItem(key, JSON.stringify(value));
    });
  }
  return store;
};

function createBookingLogic() {
  const bookings = createPersistentStore('bookings', []);
  const currentNumbers = createPersistentStore('currentNumbers', {}); // e.g., {'morning-2025-07-04': 1}

  return {
    bookings,
    currentNumbers,

    addBooking: (slot, patientInfo) => {
      const today = new Date().toISOString().split('T')[0];
      bookings.update(allBookings => {
        const newBooking = {
          ...slot,
          date: today, // Add date to booking
          isBooked: true,
          bookingNumber: allBookings.filter(b => b.session === slot.session && b.date === today).length + 1,
          patientName: patientInfo.name,
          patientPhone: patientInfo.phone,
        };
        return [...allBookings, newBooking];
      });
    },

    advanceCurrentNumber: (session) => {
      const today = new Date().toISOString().split('T')[0];
      const key = `${session}-${today}`;

      currentNumbers.update(numbers => {
        const current = numbers[key] || 0;
        numbers[key] = current + 1;
        return numbers;
      });
    },

    getCurrentNumber: (session) => {
      const today = new Date().toISOString().split('T')[0];
      const key = `${session}-${today}`;
      return get(currentNumbers)[key] || 0;
    },

    generateTimeSlots: () => {
      const slots = { morning: [], evening: [], night: [] };
      const createSlots = (startHour, endHour, session) => {
        for (let hour = startHour; hour < endHour; hour++) {
          for (let minute = 0; minute < 60; minute += 10) {
            const h = hour >= 24 ? hour - 24 : hour;
            const time = `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
            const id = `${session}-${time}`;
            slots[session].push({ id, time, session });
          }
        }
      };
      createSlots(6, 12, 'morning');
      createSlots(14, 16, 'evening');
      createSlots(17, 26, 'night');
      return slots;
    }
  };
}

export const bookingStore = createBookingLogic();