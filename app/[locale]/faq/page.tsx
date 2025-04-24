"use client"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useState } from "react"

export default function FAQ() {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  const faqs = [
    {
      question: "What types of hotels and rooms can I book?",
      answer:
        "We offer a wide variety of accommodations, from budget-friendly options to luxury hotels. You can choose from standard rooms, suites, and even apartments, depending on your needs and preferences [2].",
    },
    {
      question: "How does payment work?",
      answer:
        "We accept various payment methods, including credit cards, debit cards, and other online payment options. Payment options may vary depending on the hotel and your location [2].",
    },
    {
      question:
        "Are there any hidden charges associated with bookings through your agency?",
      answer:
        "We strive to be transparent with our pricing. All potential charges, including taxes and fees, will be clearly displayed before you confirm your booking. We want you to have a hassle-free booking experience [1].",
    },
    {
      question:
        "How do I find out about the amenities, room views, and specific details like wheelchair access or pet-friendliness?",
      answer:
        "You can find detailed information about hotel amenities, room views, and accessibility options on our website. Each hotel listing includes a comprehensive description with images to help you make an informed decision [2].",
    },
    {
      question: "What are the cancellation policies?",
      answer:
        "Cancellation policies vary depending on the hotel and the type of booking. Please review the specific terms and conditions before confirming your reservation. Many hotels offer free cancellation up to a certain date [3][4].",
    },
    {
      question: "How can I be sure I'm getting the best price?",
      answer:
        "We want you to pay the lowest price possible. If you find a lower rate for the same hotel and room type on another website after booking with us, we will match the difference under our Best Price Guarantee terms and conditions [6].",
    },
    {
      question:
        "How do I prepare for my tour and what should I expect on the day of the tour?",
      answer:
        "Once you've booked your tour, we'll send you a detailed confirmation email with everything you need to know. This includes what to bring, what to wear, and what to expect on the day of your tour [3].",
    },
  ]

  const [expandedItem, setExpandedItem] = useState<string | undefined>(
    undefined
  )

  const handleContactClick = () => {
    router.push(`/${locale}/contact`)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 font-serif">
          Frequently Asked Questions
        </h1>
        <p className="text-muted-foreground">
          Find answers to common questions about booking hotels and rooms or
          trips.
        </p>
      </div>

      <Accordion
        type="single"
        collapsible
        value={expandedItem}
        onValueChange={setExpandedItem}
        className="mb-12"
      >
        {faqs.map((faq, index) => {
          const itemValue = `item-${index}`
          const isExpanded = expandedItem === itemValue

          return (
            <AccordionItem key={index} value={itemValue}>
              <div
                className={
                  isExpanded ? "border border-orange-500 rounded-md" : ""
                }
              >
                <AccordionTrigger
                  className={`text-left ${isExpanded ? "font-semibold" : ""}`}
                >
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </div>
            </AccordionItem>
          )
        })}
      </Accordion>

      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">
          Can&apos;t find what you are looking for?
        </h2>
        <Button
          className="bg-[#F68B1F] hover:bg-[#E57D1E] text-white"
          onClick={handleContactClick}
        >
          <Mail className="mr-2 h-4 w-4" />
          Email Us
        </Button>
      </div>
    </div>
  )
}
