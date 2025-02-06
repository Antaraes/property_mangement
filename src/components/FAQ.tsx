"use client";
import { faqData } from "@/constant/FAQs";
// FAQ.tsx
import React, { useState } from "react";

interface FAQProps {}

const FAQ: React.FC<FAQProps> = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAnswer = (index: number) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <div id="faqs" className=" px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
      <div className="grid md:grid-cols-5 gap-10">
        <div className="md:col-span-2">
          <div className="max-w-xs">
            <h2 className="text-2xl font-bold md:text-4xl md:leading-tight dark:text-white">
              Frequently
              <br />
              asked questions
            </h2>
            <p className="mt-1 hidden md:block text-gray-600 dark:text-neutral-400">
              Answers to the most frequently asked questions related to property management.
            </p>
          </div>
        </div>
        <div className="md:col-span-3">
          <div className="divide-y divide-gray-200 dark:divide-neutral-700">
            {faqData.map((faq, index) => (
              <div key={index} className="py-3">
                <button
                  onClick={() => toggleAnswer(index)}
                  className="w-full text-left py-3 px-4 text-lg font-semibold text-gray-800 dark:text-neutral-200"
                >
                  {faq.question}
                </button>
                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    openIndex === index ? "h-auto opacity-100" : "h-0 opacity-0"
                  }`}
                >
                  <div className="px-4 py-2 text-gray-600 dark:text-neutral-400">{faq.answer}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
