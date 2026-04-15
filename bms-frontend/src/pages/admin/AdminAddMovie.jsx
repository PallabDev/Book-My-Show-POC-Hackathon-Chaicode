import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import api from "@/services/api";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function AdminAddMovie() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default dates
  const today = new Date().toISOString().split("T")[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      posterUrl: "",
      language: "English",
      genre: "Action",
      durationMinutes: 120,
      showPrice: 250,
      startDate: today,
      endDate: nextWeek,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      try {
        const payload = {
          ...value,
          durationMinutes: Number(value.durationMinutes),
          showPrice: Number(value.showPrice)
        };
        const res = await api.post("/movies", payload);
        if (res.data.success) {
          toast.success("Movie and shows created successfully!");
          navigate("/admin/dashboard");
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to create movie");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <div className="container max-w-3xl py-12">
      <div className="mb-6">
        <Link to="/admin/dashboard" className="text-sm text-muted-foreground hover:text-primary mb-4 inline-block">
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Add New Movie</h1>
        <p className="text-muted-foreground mt-1">This will automatically generate shows and seats.</p>
      </div>

      <Card>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <CardContent className="grid gap-6 pt-6">
            <form.Field
              name="title"
              validators={{
                onChange: ({ value }) => !value ? 'Title is required' : undefined,
              }}
              children={(field) => (
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>Movie Title</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g. Interstellar"
                  />
                  {field.state.meta.errors ? (
                    <em className="text-xs text-destructive">{field.state.meta.errors.join(", ")}</em>
                  ) : null}
                </div>
              )}
            />

            <form.Field
              name="description"
              children={(field) => (
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>Description</Label>
                  <textarea
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Plot summary..."
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              )}
            />

            <form.Field
              name="posterUrl"
              children={(field) => (
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>Poster URL</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="https://example.com/poster.jpg"
                  />
                </div>
              )}
            />

            <div className="grid sm:grid-cols-2 gap-6">
              <form.Field
                name="language"
                children={(field) => (
                  <div className="grid gap-2">
                    <Label htmlFor={field.name}>Language</Label>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              />
              <form.Field
                name="genre"
                children={(field) => (
                  <div className="grid gap-2">
                    <Label htmlFor={field.name}>Genre</Label>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              />
              <form.Field
                name="durationMinutes"
                children={(field) => (
                  <div className="grid gap-2">
                    <Label htmlFor={field.name}>Duration (Minutes)</Label>
                    <Input
                      type="number"
                      id={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              />
              <form.Field
                name="showPrice"
                children={(field) => (
                  <div className="grid gap-2">
                    <Label htmlFor={field.name}>Ticket Price (₹)</Label>
                    <Input
                      type="number"
                      id={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              />
              <form.Field
                name="startDate"
                children={(field) => (
                  <div className="grid gap-2">
                    <Label htmlFor={field.name}>Start Date</Label>
                    <Input
                      type="date"
                      id={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              />
              <form.Field
                name="endDate"
                children={(field) => (
                  <div className="grid gap-2">
                    <Label htmlFor={field.name}>End Date</Label>
                    <Input
                      type="date"
                      id={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t pt-6 pb-6">
            <Button type="button" variant="outline" onClick={() => form.reset()} disabled={isSubmitting}>
              Reset
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Save Movie"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
