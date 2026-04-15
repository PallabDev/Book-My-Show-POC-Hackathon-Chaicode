import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "@/services/api";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [requestStatus, setRequestStatus] = useState("verifying");
  const status = token ? requestStatus : "error";
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      return;
    }

    let isMounted = true;

    const verifyToken = async () => {
      try {
        const res = await api.post("/auth/verify-email", { token });
        if (res.data.success && isMounted) {
          setRequestStatus("success");
          toast.success("Email verified successfully!");
        }
      } catch (err) {
        if (!isMounted) {
          return;
        }

        setRequestStatus("error");
        toast.error(err.response?.data?.message || "Verification failed");
      }
    };

    verifyToken();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="flex h-full flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Email Verification</CardTitle>
          <CardDescription>
            {status === "verifying" && "Please wait while we verify your email..."}
            {status === "success" && "Your email has been verified!"}
            {status === "error" && (!token ? "No verification token provided." : "Verification link is invalid or expired.")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {status === "verifying" && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
          {status === "success" && (
            <Button onClick={() => navigate("/login")} className="w-full">
              Proceed to Login
            </Button>
          )}
          {status === "error" && (
            <Button variant="outline" onClick={() => navigate("/login")} className="w-full">
              Return to Login
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
