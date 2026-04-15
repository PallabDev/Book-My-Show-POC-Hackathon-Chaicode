import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { BadgeCheck, Calendar, Clock, MonitorPlay, Ticket } from "lucide-react";
import { Loader2 } from "lucide-react";

function to12Hour(timeStr) {
  if (!timeStr) return "";
  const [hStr, mStr] = timeStr.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr ? mStr.padStart(2, "0") : "00";
  if (isNaN(h)) return timeStr;
  const period = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${period}`;
}

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get("/bookings/me");
        if (res.data.success) {
          setBookings(res.data.data);
        }
      } catch {
        console.error("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="container py-12 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Ticket className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
      </div>

      {bookings.length > 0 ? (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <Card key={booking.bookingid} className="overflow-hidden border-border bg-card shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col md:flex-row">
                <div className="bg-primary/10 p-6 flex flex-col justify-center items-center min-w-[150px] border-b md:border-b-0 md:border-r border-border border-dashed">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Seat</div>
                  <div className="text-4xl font-black text-primary mb-2">{booking.seat_label}</div>
                  <div className="flex items-center text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                    <BadgeCheck className="w-3 h-3 mr-1" /> Confirmed
                  </div>
                </div>
                <CardContent className="flex-1 p-6">
                  <h3 className="text-xl font-bold mb-4">{booking.movie_title}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-2 text-sm">
                    <div>
                      <div className="text-muted-foreground text-xs mb-1">Date</div>
                      <div className="font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(booking.show_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs mb-1">Time</div>
                      <div className="font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {to12Hour(booking.show_time)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs mb-1">Screen</div>
                      <div className="font-medium flex items-center gap-1">
                        <MonitorPlay className="w-3 h-3" /> {booking.screen_name}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs mb-1">Amount Paid</div>
                      <div className="font-medium font-mono text-primary">₹{booking.amount_paid}</div>
                    </div>
                    <div className="col-span-2 sm:col-span-2">
                       <div className="text-muted-foreground text-xs mb-1">Booking ID</div>
                       <div className="font-medium font-mono text-xs opacity-70">BMS-BKG-{booking.bookingid.toString().padStart(6, '0')}</div>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
          <Ticket className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No bookings yet</h2>
          <p className="text-muted-foreground mb-4">You haven't booked any movie tickets yet.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Browse Movies
          </Link>
        </div>
      )}
    </div>
  );
}
