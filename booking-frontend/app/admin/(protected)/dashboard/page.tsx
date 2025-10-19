"use client";

import { useEffect, useState, useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { toast } from "sonner";
import { Users, Sun, Moon, Send } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

// --- FIX 1: UPDATE TYPE DEFINITIONS TO MATCH THE API RESPONSE ---

// Define the nested User object
interface User {
    name: string;
    phone_number: string;
}

// Update the Booking interface to include the 'user' object and 'timeslot'
interface Booking {
  id:number;
  turn_number: number;
  user: User; // User is now a nested object
  session: 'morning' | 'evening' | 'night';
  timeslot: string; // Add the timeslot field
}

interface DashboardStats {
  totalBookings: number;
  morning: number;
  evening: number;
  night: number;
}

interface WeeklyTrendData {
    date: string;
    bookings: number;
}

interface DashboardData {
  stats: DashboardStats;
  bookings: Booking[];
  weeklyTrend: WeeklyTrendData[];
}



export default function AdminDashboardPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [session, setSession] = useState<string>("night");
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifyingId, setNotifyingId] = useState<number | null>(null);

  // Fetch data whenever the selected date changes
  useEffect(() => {
    const fetchData = async () => {
      if (!date) return;
      setIsLoading(true);

      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error("Authentication Error", { description: "Please log in again." });
        setIsLoading(false);
        return;
      }
      
      const toLocalDateString = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dateString = toLocalDateString(date);
      
      try {
        const response = await fetch(`http://127.0.0.1:8000/admin/dashboard-data?date=${dateString}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Failed to fetch dashboard data.");

        const result: DashboardData = await response.json();
        setData(result);
      } catch (error: unknown) {
        let message = "An unknown error occurred.";
        if (error instanceof Error) {
          message = error.message;
        }
        toast.error("API Error", { description: message });
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [date]);

  const filteredBookings = useMemo(() => {
    if (!data?.bookings) return [];
    
    return data.bookings.filter(b => b.session === session);
  }, [data, session]);
  

  const dailyChartData = [
      { session: "Morning", bookings: data?.stats.morning ?? 0 },
      { session: "Evening", bookings: data?.stats.evening ?? 0 },
      { session: "Night", bookings: data?.stats.night ?? 0 },
  ];

  const weeklyChartData = useMemo(() => {
      return data?.weeklyTrend.map(d => ({...d, date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) })) ?? []
  }, [data?.weeklyTrend]);

  const handleSendNotification = async (booking: Booking) => {
    setNotifyingId(booking.id);
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`http://127.0.0.1:8000/admin/notify/${booking.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to send notification.");
      }
      toast.success("Notification Sent", { description: `Message sent to ${booking.user.name}.` });
    } catch (error: unknown) {
      let message = "An unknown error occurred.";
      if (error instanceof Error) {
        message = error.message;
      }
      toast.error("Failed to Send", { description: message });
    } finally {
      setNotifyingId(null);
    }
  };


  return (
    <div className="space-y-8">
      {/* Scene 2: The Dashboard View */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-3 grid gap-6 sm:grid-cols-3">
            {isLoading ? (
                <>
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                </>
            ) : (
                <>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Bookings Today</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{data?.stats.totalBookings ?? 0}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Morning Session</CardTitle>
                            <Sun className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{data?.stats.morning ?? 0}</div></CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Night Session</CardTitle>
                            <Moon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent><div className="text-2xl font-bold">{data?.stats.night ?? 0}</div></CardContent>
                    </Card>
                </>
            )}
        </div>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardContent className="p-2 flex justify-center">
                    <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Filter by Session</CardTitle></CardHeader>
                <CardContent>
                    <ToggleGroup 
                        type="single" 
                        value={session} 
                        onValueChange={(value) => { if (value) setSession(value) }}
                        className="w-full"
                    >
                        <ToggleGroupItem value="morning" className="flex-1">Morning</ToggleGroupItem>
                        <ToggleGroupItem value="evening" className="flex-1">Evening</ToggleGroupItem>
                        <ToggleGroupItem value="night" className="flex-1">Night</ToggleGroupItem>
                    </ToggleGroup>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>
                        Patients for {date?.toLocaleDateString()} - {`${session.charAt(0).toUpperCase() + session.slice(1)} Session`}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                {/* --- FIX 2: UPDATE THE TABLE HEADER --- */}
                                <TableRow>
                                    <TableHead className="w-[100px]">Turn #</TableHead>
                                    <TableHead>Patient Name</TableHead>
                                    <TableHead>Phone Number</TableHead>
                                    <TableHead>Time Slot</TableHead>
                                    <TableHead className="text-center">Notification</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredBookings.length > 0 ? (
                                    filteredBookings.map((booking) => (
                                        <TableRow key={booking.turn_number}>
                                            {/* --- FIX 3: UPDATE TABLE CELLS TO ACCESS NESTED DATA --- */}
                                            <TableCell className="font-medium">{booking.turn_number}</TableCell>
                                            <TableCell>{booking.user.name}</TableCell>
                                            <TableCell>{booking.user.phone_number}</TableCell>
                                            <TableCell>{booking.timeslot.substring(0, 5)}</TableCell>
                                            <TableCell className="text-center">
                                                <Button 
                                                    size="sm"
                                                    onClick={() => handleSendNotification(booking)}
                                                    disabled={notifyingId === booking.id}
                                                >
                                                    <Send className="h-4 w-4 mr-2" />
                                                    {notifyingId === booking.id ? 'Sending...' : 'Send'}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">No patients found for this selection.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>

      {/* Scene 3: The Analytics View */}
      <div className="grid gap-6 md:grid-cols-2">
          <Card>
              <CardHeader><CardTitle>Session Breakdown for {date?.toLocaleDateString()}</CardTitle></CardHeader>
              <CardContent>
                  <ChartContainer config={{}} className="min-h-[200px] w-full">
                      <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={dailyChartData}>
                              <CartesianGrid vertical={false} />
                              <XAxis dataKey="session" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Bar dataKey="bookings" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                          </BarChart>
                      </ResponsiveContainer>
                  </ChartContainer>
              </CardContent>
          </Card>
          <Card>
              <CardHeader><CardTitle>Booking Trends - Last 7 Days</CardTitle></CardHeader>
              <CardContent>
                  <ChartContainer config={{}} className="min-h-[200px] w-full">
                      <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={weeklyChartData}>
                              <CartesianGrid vertical={false} />
                              <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Line type="monotone" dataKey="bookings" stroke="var(--color-primary)" strokeWidth={2} />
                          </LineChart>
                      </ResponsiveContainer>
                  </ChartContainer>
              </CardContent>
          </Card>
      </div>
    </div>
  );
}