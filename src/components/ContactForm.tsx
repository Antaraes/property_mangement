// components/ContactForm.tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

type FormValues = {
  firstName: string;
  lastName: string;
  purpose: string;
  notes: string;
};

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSubmitStatus("success");
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      setSubmitStatus("error");
    }
    setIsSubmitting(false);
  };

  return (
    <div className=" mx-auto bg-[#222222] text-white border-gray-200 grid grid-cols-2">
      <div className="relative">
        <Image
          src={
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          }
          className="bg-contain"
          alt="iamge"
          fill
        />
      </div>
      <div className="p-4">
        <h2 className="text-3xl font-bold text-center mb-6 text-[#DFDFDF] ">
          Still haven&apos;t found what you&apos;re <br /> looking for?
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#DFDFDF] mb-2">First Name</label>
              <Input
                {...register("firstName", { required: true })}
                className="w-full px-4 py-3  bg-[#383838] rounded-lg outline-none border-none "
                placeholder="Enter your first name"
              />
              {errors.firstName && (
                <span className="text-red-500 text-sm">This field is required</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#DFDFDF] mb-2">Last Name</label>
              <Input
                {...register("lastName", { required: true })}
                className="w-full px-4 py-3  rounded-lg border-none  bg-[#383838] "
                placeholder="Enter your last name"
              />
              {errors.lastName && (
                <span className="text-red-500 text-sm">This field is required</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#DFDFDF] mb-2">I Want to</label>
            <select
              {...register("purpose", { required: true })}
              className="w-full px-4 py-3  rounded-lg bg-[#383838] focus:ring-2 "
            >
              <option value="Buy Property">Buy Property</option>
              <option value="Sell Property">Sell Property</option>
              <option value="Rent Property">Rent Property</option>
              <option value="Consultation">Consultation</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#DFDFDF] mb-2">Notes</label>
            <textarea
              {...register("notes")}
              rows={4}
              className="w-full px-4 py-3  rounded-lg bg-[#383838]"
              placeholder="Enter your notes or additional information"
            ></textarea>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className=" bg-white text-black disabled:bg-red-300 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>

          {submitStatus === "success" && (
            <div className="text-green-600 text-center mt-4">Message sent successfully!</div>
          )}
          {submitStatus === "error" && (
            <div className="text-red-600 text-center mt-4">
              Error sending message. Please try again.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
