"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { apiConnector } from "@/utils/apiconnector";
import OTPModel from "./OTPModel";
import { useRouter } from "next/navigation";

type FormType = "sign-in" | "sign-up";

const authFormSchema = (formType: FormType) => {
  return z.object({
    fullName:
      formType === "sign-up"
        ? z.string().min(2).max(50)
        : z.string().optional(),
    email: z.string().email(),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [otp, setOtp] = useState(null);

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await apiConnector(
        "POST",
        "/api/register", // URL of the API route for sending OTP
        { email: values.email, isLogin: type === "sign-in" } // Request body containing email
      );
      if (response.status === 200) {
        setOtp(response.data.otp);
        // Handle success
      } else {
        setErrorMessage(response.data.error);
        // Handle non-200 status codes
      }
    } catch (e) {
      setErrorMessage(
        type === "sign-up"
          ? "Failed to create account. Please try again later"
          : "Failed to Log In. Please try again later"
      );
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
          <h1 className=" form-title">
            {type === "sign-in" ? "Sign In" : "Sign Up"}
          </h1>
          {type === "sign-up" && (
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <div className=" shad-form-item">
                    <FormLabel className=" shad-form-label">
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="shad-input"
                        placeholder="Enter your full name"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className=" shad-form-message" />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <div className=" shad-form-item">
                  <FormLabel className=" shad-form-label">email</FormLabel>
                  <FormControl>
                    <Input
                      className="shad-input"
                      placeholder="Enter your email"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage className=" shad-form-message" />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className=" form-submit-button"
            disabled={isLoading}
          >
            {type == "sign-in" ? "Sign In" : "Sign Up"}

            {isLoading && (
              <Image
                src="/assets/icons/loader.svg"
                width={24}
                height={24}
                alt="loading"
                className=" ml-2 animate-spin"
              />
            )}
          </Button>

          {errorMessage && <p className="error-message">*{errorMessage}</p>}

          <div className=" body-2 flex justify-center">
            <p className=" text-light-100">
              {type === "sign-in"
                ? "Dont have an account?"
                : "Already have an account?"}
            </p>

            <Link
              href={type === "sign-in" ? "/sign-up" : "sign-in"}
              className=" ml-1 font-medium text-brand"
            >
              {type === "sign-in" ? "Sign Up" : "Sign In"}
            </Link>
          </div>
        </form>
      </Form>

      {otp && (
        <OTPModel
          otp={otp}
          setOtp={setOtp}
          email={form.getValues("email")}
          name={form.getValues("fullName")}
          isLogin={type === "sign-in"}
        />
      )}
    </>
  );
};

export default AuthForm;
