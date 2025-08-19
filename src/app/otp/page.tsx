// app/otp/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/services/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const OTP_LENGTH = 6;

// ---------- Response types ----------
interface OtpVerifyResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "doctor" | "patient";
  };
  accessToken: string;
  refreshToken: string;
}

interface OtpResendResponse {
  message: string;
  expiresInMinutes: number;
}

// ---------- Form type ----------
type OTPFormValues = {
  code0: string;
  code1: string;
  code2: string;
  code3: string;
  code4: string;
  code5: string;
};

export default function OTPVerificationPage() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") || "";

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<OTPFormValues>({
    mode: "onChange",
    defaultValues: {
      code0: "",
      code1: "",
      code2: "",
      code3: "",
      code4: "",
      code5: "",
    },
  });

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [expiresIn, setExpiresIn] = useState<number>(300); // seconds (5 min)

  // Focus first box on mount
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  // Countdown timer
  useEffect(() => {
    const t = setInterval(() => setExpiresIn((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  // Handlers for each input
  const handleChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return; // only single digit
    setValue(`code${i}` as keyof OTPFormValues, v, {
      shouldValidate: true,
      shouldDirty: true,
    });
    if (v && i < OTP_LENGTH - 1) inputsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (
    i: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const current =
      (getValues()[`code${i}` as keyof OTPFormValues] as string) || "";
    if (e.key === "Backspace") {
      if (current) {
        setValue(`code${i}` as keyof OTPFormValues, "", {
          shouldValidate: true,
          shouldDirty: true,
        });
      } else if (i > 0) {
        inputsRef.current[i - 1]?.focus();
        setValue(`code${i - 1}` as keyof OTPFormValues, "", {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      inputsRef.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < OTP_LENGTH - 1) {
      inputsRef.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const p = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!p) return;
    for (let i = 0; i < OTP_LENGTH; i++) {
      setValue(`code${i}` as keyof OTPFormValues, p[i] ?? "", {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
    inputsRef.current[Math.min(p.length, OTP_LENGTH - 1)]?.focus();
  };

  // Submit via RHF
  const onSubmit = async () => {
    // ✅ Build the code fresh at submit time (fixes stale memo bug)
    const v = getValues();
    const joined = `${v.code0}${v.code1}${v.code2}${v.code3}${v.code4}${v.code5}`;

    if (joined.length !== OTP_LENGTH) {
      toast.error("Enter 6-digit code");
      return;
    }
    if (!email) {
      toast.error("Missing email");
      return;
    }

    try {
      setSubmitting(true);

      // Typed axios response; use res.data (not data directly) to avoid 'unknown'
      const res = await axiosInstance.post<OtpVerifyResponse>(
        "/auth/otp/verify",
        {
          email,
          code: joined,
        }
      );

      toast.success("Verification successful");

      const { accessToken, refreshToken } = res.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${accessToken}`;

      router.push("/login");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Verification failed";
      if (msg === "Wrong code") toast.error("Wrong code. Please wait.");
      else toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Resend OTP
  const resend = async () => {
    if (!email) return toast.error("Missing email");
    try {
      setResending(true);
      await axiosInstance.post<OtpResendResponse>("/auth/otp/resend", {
        email,
      });
      setExpiresIn(300);
      toast.success("OTP resent");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow p-6 border">
        <h2 className="text-2xl font-bold mb-6 text-center">
          OTP Verification
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex gap-2 justify-center">
            {Array.from({ length: OTP_LENGTH }).map((_, i) => (
              <Controller
                key={i}
                name={`code${i}` as keyof OTPFormValues}
                control={control}
                rules={{ required: true, pattern: /^\d$/ }}
                render={({ field }) => (
                  <input
                    ref={(el) => {
                      // store DOM ref for focus management
                      inputsRef.current[i] = el;
                      // forward ref to RHF controller
                      if (typeof field.ref === "function") field.ref(el);
                      else
                        (
                          field.ref as unknown as {
                            current: HTMLInputElement | null;
                          }
                        ).current = el;
                    }}
                    value={field.value || ""}
                    onChange={(e) => {
                      field.onChange(e); // keep RHF state in sync
                      handleChange(i, e.target.value);
                    }}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    inputMode="numeric"
                    maxLength={1}
                    className="w-12 h-12 text-center text-xl border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              />
            ))}
          </div>

          {Object.keys(errors).length > 0 && (
            <p className="text-center text-sm text-red-600">
              Please fill all 6 digits.
            </p>
          )}

          <div className="text-center text-sm text-gray-600 dark:text-gray-300">
            {expiresIn > 0 ? (
              <span>
                Code expires in {Math.floor(expiresIn / 60)}:
                {String(expiresIn % 60).padStart(2, "0")}
              </span>
            ) : (
              <span className="text-red-600">Code expired. Please resend.</span>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={submitting || expiresIn === 0}
          >
            {submitting ? "Verifying..." : "Submit"}
          </Button>

          <button
            type="button"
            onClick={resend}
            disabled={resending}
            className="w-full text-sm underline mt-2"
          >
            {resending ? "Resending..." : "Resend OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}
