import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/services/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function BookShow() {
  const { id: showId } = useParams();
  const navigate = useNavigate();
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    fetchSeats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showId]);

  const fetchSeats = async () => {
    try {
      const res = await api.get(`/shows/${showId}/seats`);
      if (res.data.success) {
        setSeats(res.data.data.seats);
      }
    } catch {
      toast.error("Failed to load seats");
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!selectedSeat) return;
    setBooking(true);
    try {
      const res = await api.post("/bookings", {
        showId: Number(showId),
        seatLabel: selectedSeat.seat_label
      });
      if (res.data.success) {
        toast.success("Seat booked successfully!");
        navigate("/my-bookings");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
      // Refresh seats to see if it was taken
      fetchSeats();
      setSelectedSeat(null);
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="container max-w-4xl py-6 md:py-12">
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Select Your Seat</h1>
        <p className="text-sm text-muted-foreground">Screen is this way</p>
        <div className="w-full h-1.5 md:h-2 bg-gradient-to-r from-transparent via-primary/50 to-transparent mt-3 mb-8 shadow-[0_0_15px_var(--primary)] rounded-[100%] mx-auto" style={{ maxWidth: '600px' }} />
      </div>

      <div className="max-w-2xl mx-auto mb-8 px-2">
        <div className="grid grid-cols-10 gap-1.5 sm:gap-2 justify-items-center">
          {seats.map((seat) => {
            const isAvailable = seat.seat_status === "available";
            const isSelected = selectedSeat?.seatid === seat.seatid;
            
            return (
              <button
                key={seat.seatid}
                disabled={!isAvailable}
                onClick={() => setSelectedSeat(seat)}
                className={`
                  w-full aspect-square max-w-[2.5rem] flex items-center justify-center text-[10px] sm:text-xs font-bold rounded-t-lg transition-all border-b-2 sm:border-b-4 relative
                  ${!isAvailable ? 'bg-secondary text-muted-foreground border-secondary cursor-not-allowed opacity-40' : 
                    isSelected ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-110 z-10' : 
                    'bg-card border-border hover:border-primary/50 hover:-translate-y-1'}
                `}
                title={seat.seat_label}
              >
                {seat.seat_label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 mb-8 text-sm">
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-card border-b-4 border-border rounded-t-sm" /> Available</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-secondary border-b-4 border-secondary rounded-t-sm opacity-50" /> Booked</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-primary border-b-4 border-primary rounded-t-sm" /> Selected</div>
      </div>

      <div className="max-w-md mx-auto bg-card border rounded-lg p-6 text-center">
        <div className="text-lg font-medium mb-4">
          Selected Seat: <span className="text-primary font-bold">{selectedSeat ? selectedSeat.seat_label : "--"}</span>
        </div>
        <Button 
          className="w-full" 
          size="lg" 
          disabled={!selectedSeat || booking}
          onClick={handleBook}
        >
          {booking ? "Processing..." : selectedSeat ? "Proceed to Book" : "Select a Seat"}
        </Button>
      </div>
    </div>
  );
}
