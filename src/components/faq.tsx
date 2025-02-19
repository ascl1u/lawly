import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "Is my data safe?",
    answer:
      "Yes! All documents are encrypted in transit and at rest. We automatically delete all documents after 24 hours and never share your data with third parties.",
  },
  {
    question: "How accurate is Lawly?",
    answer:
      "Lawly has been trained on millions of legal documents and validated by legal experts. While not a replacement for legal counsel, it provides reliable insights for initial document review.",
  },
  {
    question: "Can I export the results?",
    answer:
      "Yes! You can download summaries and analysis as PDF reports, or share them directly via email with your team or legal counsel.",
  },
  {
    question: "What types of documents can I analyze?",
    answer:
      "Lawly can analyze most legal documents including contracts, terms of service, privacy policies, NDAs, employment agreements, and more.",
  },
]

export function FAQ() {
  return (
    <div className="py-24 bg-primary">
      <div className="container px-4 md:px-6 max-w-3xl">
        <h2 className="text-3xl font-bold text-center text-primary-foreground mb-12">
          Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-primary-foreground hover:text-secondary">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-primary-foreground/80">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}