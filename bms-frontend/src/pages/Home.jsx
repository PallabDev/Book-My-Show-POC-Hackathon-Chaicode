import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import {
  Clock,
  PlayCircle,
  Star,
  Ticket,
  MapPin,
  ChevronRight,
  Film,
  Popcorn,
} from "lucide-react";

// ─── Skeleton loader for movie cards ──────────────────────────────────────────
function MovieCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl animate-pulse bg-card border border-border">
      <div className="aspect-[2/3] bg-muted w-full" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
      </div>
    </div>
  );
}

// ─── Individual movie card ─────────────────────────────────────────────────────
function MovieCard({ movie }) {
  return (
    <Link
      to={`/movie/${movie.movieid}`}
      className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
    >
      <div className="overflow-hidden rounded-xl border border-border bg-card h-full transition-all duration-300 hover:border-primary/60 hover:shadow-2xl hover:-translate-y-1.5">
        {/* Poster */}
        <div className="relative aspect-[2/3] overflow-hidden bg-muted">
          {movie.poster_url ? (
            <img
              src={movie.poster_url}
              alt={movie.title}
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-secondary">
              <PlayCircle className="w-12 h-12 text-muted-foreground" />
            </div>
          )}

          {/* Language badge */}
          <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-wide uppercase">
            {movie.language}
          </span>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <span className="text-white font-semibold text-sm tracking-wide flex items-center gap-1.5">
              <Ticket className="w-4 h-4" /> Book Tickets
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3
            className="font-semibold text-sm line-clamp-1 text-foreground"
            title={movie.title}
          >
            {movie.title}
          </h3>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {movie.duration_minutes} min
            </span>
            <span className="truncate">{movie.genre}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Feature highlights ────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <Ticket className="w-7 h-7 text-primary" />,
    title: "Instant Booking",
    desc: "Confirm your seats in seconds. No waiting, no hassle.",
  },
  {
    icon: <MapPin className="w-7 h-7 text-primary" />,
    title: "Kalyani's Cinema",
    desc: "Premium screens right here in Kalyani. Local, modern, and convenient.",
  },
  {
    icon: <Popcorn className="w-7 h-7 text-primary" />,
    title: "Pick Your Seat",
    desc: "Choose exactly where you sit with our interactive seat map.",
  },
];

// ─── Reviews (Kalyani only) ────────────────────────────────────────────────────
const REVIEWS = [
  {
    quote:
      "Booking tickets for the Saturday night show took less than two minutes. The seat layout is spot-on for our Kalyani multiplex.",
    name: "Subhrajit D.",
    location: "Kalyani, WB",
    avatar: "SD",
    rating: 5,
  },
  {
    quote:
      "Finally a proper booking platform for Kalyani! Dark mode looks great and the whole thing works perfectly on mobile.",
    name: "Ankita G.",
    location: "Kalyani, WB",
    avatar: "AG",
    rating: 5,
  },
  {
    quote:
      "Loved being able to pick my seat ahead of time. Really smooth experience from start to finish.",
    name: "Pritam R.",
    location: "Kalyani, WB",
    avatar: "PR",
    rating: 4,
  },
];

// ─── Home Component ────────────────────────────────────────────────────────────
export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/movies")
      .then((res) => {
        if (res.data.success) setMovies(res.data.data);
      })
      .catch((err) => console.error("Failed to fetch movies", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Hero ── */}
      <section className="relative w-full overflow-hidden bg-secondary">
        {/* decorative blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl bg-primary"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -right-24 w-[400px] h-[400px] rounded-full opacity-10 blur-3xl bg-primary"
        />

        <div className="container relative px-4 md:px-6 py-20 md:py-32">
          <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
            {/* eyebrow */}
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary bg-primary/10 px-4 py-1.5 rounded-full">
              <Film className="w-3.5 h-3.5" /> Now Showing in Kalyani
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-secondary-foreground leading-tight">
              Your movies.
              <br />
              <span className="text-primary">Your seats.</span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground max-w-xl">
              CineNova is Kalyani&apos;s go-to movie booking platform. Browse
              what&apos;s playing, pick your spot, and enjoy the show.
            </p>

            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href="#movies"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                Browse Movies <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features strip ── */}
      <section className="border-y border-border bg-card">
        <div className="container px-4 md:px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/40 transition-colors"
              >
                <div className="mt-0.5 shrink-0 bg-primary/10 p-2.5 rounded-lg">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">
                    {f.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Movies grid ── */}
      <section id="movies" className="container px-4 md:px-6 py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Now Showing
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              All movies currently running at CineNova, Kalyani
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
            {[1, 2, 3, 4, 5].map((n) => (
              <MovieCardSkeleton key={n} />
            ))}
          </div>
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
            {movies.map((movie) => (
              <MovieCard key={movie.movieid} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Film className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground font-medium">
              No movies are currently showing.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Please check back soon.
            </p>
          </div>
        )}
      </section>

      {/* ── Reviews ── */}
      <section className="w-full bg-secondary/40 border-t border-border py-14">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              What Kalyani is Saying
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Real experiences from locals who booked through CineNova.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {REVIEWS.map((r) => (
              <Card key={r.name} className="bg-card border-border">
                <CardContent className="p-6 flex flex-col justify-between h-full">
                  {/* Stars */}
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < r.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-sm text-foreground/80 leading-relaxed mb-5">
                    &ldquo;{r.quote}&rdquo;
                  </p>

                  <div className="flex items-center gap-3">
                    {/* Avatar initial */}
                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                      {r.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{r.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {r.location}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
