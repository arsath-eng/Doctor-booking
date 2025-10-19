"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// --- CHANGE HERE: Import 'toast' directly from sonner ---
import { toast } from "sonner"; 

// This would be fetched from your config in a real app
const SESSIONS = {
  morning: { start: 9, end: 12 },
  evening: { start: 12, end: 17 },
  night: { start: 17, end: 24 },
};

type ApiBooking = {
  id: number;
  date: string;
  timeslot: string;
  session: string;
  order_number: number;
  turn_number: number;
};

// --- NEW HELPER FUNCTION ---
// This function formats a Date object into a 'YYYY-MM-DD' string
// while respecting the local timezone, avoiding the UTC conversion issue.
const toLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() is 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function BookingPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  // --- REMOVED: const { toast } = useToast(); ---

  const handleDateChange = async (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (!selectedDate) {
      setBookedSlots([]);
      return;
    }
    const dateString = toLocalDateString(selectedDate);
    try {
      const response = await fetch(`http://127.0.0.1:8000/slots/${dateString}`);
      const data: ApiBooking[] = await response.json();
      const slots = data.map((booking) => booking.timeslot.substring(0, 5));
      setBookedSlots(slots);
    } catch (error) {
      console.error("Failed to fetch booked slots:", error);
      // --- CHANGE HERE: Use Sonner's error toast ---
      toast.error("Error", { description: "Could not fetch available slots." });
    }
  };
  
  const handleSlotClick = (time: string) => {
    setSelectedSlot(time);
    setIsModalOpen(true);
  };

  const handleBookingSubmit = async () => {
    if (!name || !phone || !selectedSlot || !date) {
        // --- CHANGE HERE: Use Sonner's error toast ---
        toast.error("Missing Information", { description: "Please fill in all fields." });
        return;
    }

    const bookingData = {
        name,
        phone_number: phone,
        date: toLocalDateString(date),
        timeslot: `${selectedSlot}:00`,
    };
    
    try {
        const response = await fetch('http://127.0.0.1:8000/bookings/create_with_user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Booking failed");
        }
        
        // --- CHANGE HERE: Use Sonner's success toast ---
        toast.success("Success!", { description: `Appointment booked for ${selectedSlot}.` });
        setIsModalOpen(false);
        handleDateChange(date);
    } catch (error: unknown) {
        let errorMessage = "An unknown error occurred during booking.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        // --- CHANGE HERE: Use Sonner's error toast ---
        toast.error("Booking Failed", { description: errorMessage });
    }
  };

  // ... (The rest of the component remains the same) ...
  // Helper to generate time slots
  const generateTimeSlots = () => {
    const slots: { [key: string]: string[] } = { morning: [], evening: [], night: [] };
    Object.entries(SESSIONS).forEach(([session, { start, end }]) => {
      for (let h = start; h < end; h++) {
        for (let m = 0; m < 60; m += 5) {
          const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
          slots[session].push(time);
        }
      }
    });
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="container grid md:grid-cols-3 gap-8 py-12">
      <div className="md:col-span-1 flex justify-center">
         <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateChange}
          disabled={(d) => d < new Date(new Date().setDate(new Date().getDate() - 1))}
          className="rounded-md border"
        />
      </div>

      <div className="md:col-span-2">
        <h2 className="text-2xl font-bold mb-4">
            Available Slots for {date?.toLocaleDateString()}
        </h2>
        {Object.entries(timeSlots).map(([session, slots]) => (
          <div key={session} className="mb-6">
            <h3 className="text-xl font-semibold capitalize border-b pb-2 mb-4">{session}</h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {slots.map((time) => {
                const isBooked = bookedSlots.includes(time);
                return (
                  <Button
                    key={time}
                    variant={isBooked ? "destructive" : "outline"}
                    disabled={isBooked}
                    onClick={() => handleSlotClick(time)}
                  >
                    {time}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Booking</DialogTitle>
            <DialogDescription>
              You are booking the <strong>{selectedSlot}</strong> slot on <strong>{date?.toLocaleDateString()}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">Phone</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
              <Button type="submit" onClick={handleBookingSubmit}>Confirm Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}