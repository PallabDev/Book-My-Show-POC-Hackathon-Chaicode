import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import {
  Clock,
  CalendarDays,
  MonitorPlay,
  Calendar,
  MapPin,
  Film,
  Tag,
  Timer,
  AlertCircle,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert a "HH:MM:SS" or "HH:MM" 24-hour string to 12-hour AM/PM format.
 * Falls back to the raw value if it can't be parsed.
 */
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

/**
 * Return true if the show's start datetime is in the past.
 * Uses startsAt (ISO) when available, otherwise combines the show date
 * with showTime.
 */
function isExpired(show) {
  const now = new Date();
  if (show.startsAt) {
    return new Date(show.startsAt) < now;
  }
  // Fallback: combine date + time strings if backend returns them separately
  if (show.showDate && show.showTime) {
    const combined = new Date(`${show.showDate}T${show.showTime}`);
    return combined < now;
  }
  return false;
}

// ─── Stat pill ────────────────────────────────────────────────────────────────
function Pill({ icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
      {icon}
      {children}
    </span>
  );
}

// ─── Show card ────────────────────────────────────────────────────────────────
function ShowCard({ show }) {
  const expired = isExpired(show);
  const showDate = show.startsAt ? new Date(show.startsAt) : null;

  const dateLabel = showDate
    ? showDate.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : show.showDate ?? "—";

  const timeLabel = to12Hour(show.showTime ?? show.startsAt?.slice(11, 16));

  const inner = (
    <Card
      className={`h-full border transition-all duration-200 ${
        expired
          ? "opacity-45 cursor-not-allowed border-border"
          : "hover:border-primary/60 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
      }`}
    >
      <CardContent className="p-5 flex flex-col gap-4 h-full">
        {/* Top row: date + price */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 font-semibold text-base">
            <Calendar className="w-4 h-4 text-primary shrink-0" />
            <span>{dateLabel}</span>
          </div>
          <span className="text-lg font-bold text-primary whitespace-nowrap">
            ₹{show.showPrice}
          </span>
        </div>

        {/* Middle row: time + screen */}
        <div className="flex items-center justify-between text-sm text-muted-foreground gap-2">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 shrink-0" />
            {timeLabel}
          </span>
          <span className="flex items-center gap-1.5">
            <MonitorPlay className="w-4 h-4 shrink-0" />
            {show.screenName}
          </span>
        </div>

        {/* Expired banner or CTA */}
        {expired ? (
          <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground bg-muted/60 rounded-lg px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            Show has ended
          </div>
        ) : (
          <div className="mt-auto bg-primary text-primary-foreground text-sm font-semibold text-center py-2 rounded-lg transition-opacity hover:opacity-90">
            Select Seats
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (expired) {
    // Wrap in a plain div — no link, not clickable
    return <div>{inner}</div>;
  }

  return (
    <Link
      to={`/show/${show.showId}/book`}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
    >
      {inner}
    </Link>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/movies")
      .then((res) => {
        if (res.data.success) {
          const found = res.data.data.find((m) => String(m.movieid) === id);
          setMovie(found ?? null);
        }
      })
      .catch((err) => console.error("Failed to fetch movie", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container py-20 flex flex-col items-center gap-4 text-muted-foreground">
        <Film className="w-10 h-10 animate-pulse" />
        <p className="text-sm">Loading movie details&hellip;</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container py-20 text-center text-muted-foreground">
        <Film className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p className="font-medium">Movie not found.</p>
        <Link
          to="/"
          className="inline-block mt-4 text-sm text-primary underline underline-offset-4"
        >
          Back to home
        </Link>
      </div>
    );
  }

  const upcomingShows = (movie.shows ?? []).filter((s) => !isExpired(s));
  const expiredShows = (movie.shows ?? []).filter((s) => isExpired(s));
  const allShows = [...upcomingShows, ...expiredShows];

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Hero / Movie Info ── */}
      <section className="relative w-full overflow-hidden bg-secondary">
        {/* Blurred backdrop */}
        {movie.poster_url && (
          <div
            aria-hidden
            className="absolute inset-0 bg-cover bg-center opacity-10 blur-2xl scale-110 pointer-events-none"
            style={{ backgroundImage: `url(${movie.poster_url})` }}
          />
        )}

        <div className="container relative px-4 md:px-6 py-12 md:py-16">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12">
            {/* Poster */}
            <div className="w-44 md:w-56 lg:w-64 shrink-0 mx-auto md:mx-0">
              <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl ring-1 ring-border bg-muted">
                {movie.poster_url ? (
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Film className="w-12 h-12" />
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 space-y-5 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-secondary-foreground leading-tight">
                {movie.title}
              </h1>

              {/* Meta pills */}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Pill icon={<Timer className="w-3.5 h-3.5" />}>
                  {movie.duration_minutes} min
                </Pill>
                <Pill icon={<Tag className="w-3.5 h-3.5" />}>
                  {movie.genre}
                </Pill>
                <Pill icon={<Film className="w-3.5 h-3.5" />}>
                  {movie.language}
                </Pill>
                {movie.start_date && (
                  <Pill icon={<CalendarDays className="w-3.5 h-3.5" />}>
                    {new Date(movie.start_date).toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </Pill>
                )}
              </div>

              {/* Location */}
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground justify-center md:justify-start">
                <MapPin className="w-4 h-4 text-primary" />
                CineNova &mdash; Kalyani, West Bengal
              </p>

              {/* Description */}
              {movie.description && (
                <p className="text-sm md:text-base text-secondary-foreground/80 leading-relaxed max-w-2xl">
                  {movie.description}
                </p>
              )}

              {/* Quick stats bar */}
              <div className="flex flex-wrap gap-5 pt-2 justify-center md:justify-start">
                <div className="text-center md:text-left">
                  <p className="text-2xl font-bold text-primary">
                    {upcomingShows.length}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Upcoming show{upcomingShows.length !== 1 ? "s" : ""}
                  </p>
                </div>
                {expiredShows.length > 0 && (
                  <div className="text-center md:text-left">
                    <p className="text-2xl font-bold text-muted-foreground">
                      {expiredShows.length}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Past show{expiredShows.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Shows grid ── */}
      <section className="container px-4 md:px-6 py-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Available Shows</h2>
          {allShows.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {upcomingShows.length > 0
                ? `${upcomingShows.length} upcoming show${upcomingShows.length !== 1 ? "s" : ""} — click a card to book`
                : "No upcoming shows. All shows have ended."}
            </p>
          )}
        </div>

        {allShows.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allShows.map((show) => (
              <ShowCard key={show.showId} show={show} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-16 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <p className="font-medium text-muted-foreground">
              No shows scheduled for this movie.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
