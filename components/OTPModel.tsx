"use client";

import React, { Dispatch, SetStateAction, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import Image from "next/image";
import { Button } from "./ui/button";
import { apiConnector } from "@/utils/apiconnector";
import { useRouter } from "next/navigation";

interface OTPProps {
  otp: string;
  setOtp: Dispatch<SetStateAction<null>>;
  email: string;
  name: string | undefined;
  isLogin:boolean
}

const OTPModel = ({ otp, setOtp, email, name , isLogin}: OTPProps) => {
  const router=useRouter();
  const [password, setPassword] = useState("");
  const  [errorMessage, setErrorMessage]=useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await apiConnector(
        "POST",
        "/api/verify-otp", // URL of the API route for sending OTP
        { name, email, otp: password, isLogin } // Request body containing email
      );
      if (response.status === 200) {
        router.push("/");
        setOtp(null);
        // Handle success
      } else {
        setErrorMessage(response.data.error)
        // Handle non-200 status codes
      }
    } catch (e) {
      console.log("falied to verify otp", e);
    }
    finally{
    setIsLoading(false);
    }
  };

  const handleResesendOTP = async () => {
    setOtp(null);
    setIsLoading(true);
    try {
      const response = await apiConnector(
        "POST",
        "/api/register", // URL of the API route for sending OTP
        { email, name , isLogin} // Request body containing email
      );
      if (response.status === 200) {
        setOtp(response.data.otp);
        // Handle success
      } else {
        setErrorMessage(response.data.errror); // Handle non-200 status codes
      }
    } catch (e) {
      console.log("Failed to create account. Please try again later");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <AlertDialog open={otp != null}>
      <AlertDialogContent className=" shad-alert-dialog">
        <AlertDialogHeader className=" relative flex justify-center">
          <AlertDialogTitle className=" h2 text-center">
            Enter your OTP
            <Image
              src="/assets/icons/close-dark.svg"
              alt="close"
              width={20}
              height={20}
              onClick={() => setOtp(null)}
              className="otp-close-button"
            />
          </AlertDialogTitle>
          <AlertDialogDescription className=" subtitle-2 text-center text-light-100">
            We&apos;ve sent a code to{" "}
            <span className=" pl-1 text-brand">{email}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <InputOTP maxLength={6} value={password} onChange={setPassword}>
          <InputOTPGroup className="shad-otp">
            <InputOTPSlot index={0} className="shad-otp-slot" />
            <InputOTPSlot index={1} className="shad-otp-slot" />
            <InputOTPSlot index={2} className="shad-otp-slot" />
            <InputOTPSlot index={3} className="shad-otp-slot" />
            <InputOTPSlot index={4} className="shad-otp-slot" />
            <InputOTPSlot index={5} className="shad-otp-slot" />
          </InputOTPGroup>
        </InputOTP>

        <AlertDialogFooter>
          <div className=" flex w-full flex-col gap-4">
            <AlertDialogAction
              onClick={handleSubmit}
              className=" shad-submit-btn  h-12"
              type="button"
            >
              Submit
              {isLoading && (
                <Image
                  src="/assets/icons/loader.svg"
                  alt="loader"
                  width={24}
                  height={24}
                  className="ml-2 animate-spin"
                />
              )}
            </AlertDialogAction>

            <div className=" subtitle-2 mt-2 text-center text-light-100">
              Didn't get the code?
              <Button
                type="button"
                variant="link"
                className=" pl-1 text-brand"
                onClick={handleResesendOTP}
              >
                Click to resend
              </Button>
              {errorMessage && <p className="error-message">*{errorMessage}</p>}
            </div>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OTPModel;
