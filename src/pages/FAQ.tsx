import Header from "@/components/Header";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "What is the CTG Trading Challenge?",
      answer: "The CTG Trading Challenge is a platform where traders can participate in simulated trading challenges using MT5, track their progress, and compete on leaderboards to prove their trading skills."
    },
    {
      question: "How do I get started?",
      answer: "Simply create an account, choose a challenge that suits your skill level, and start trading. You'll receive a demo account with virtual funds to practice your strategies."
    },
    {
      question: "Are there any fees?",
      answer: "Yes, there are entry fees for participating in challenges. The fees vary depending on the challenge type and prize pool. Check the specific challenge details for exact pricing."
    },
    {
      question: "What happens if I lose my challenge account?",
      answer: "If you lose your challenge account, you can purchase a new one to continue participating. However, you'll need to start fresh with a new challenge."
    },
    {
      question: "How are winners determined?",
      answer: "Winners are determined based on profit percentage, consistency, and risk management. The exact criteria vary by challenge type and are clearly outlined in the challenge rules."
    },
    {
      question: "Can I withdraw my winnings?",
      answer: "Yes, once you successfully complete a challenge and meet all requirements, you can withdraw your winnings through our secure payment system."
    },
    {
      question: "Is my personal information secure?",
      answer: "Absolutely. We use industry-standard encryption and security measures to protect your personal and financial information. We never share your data with third parties without your consent."
    },
    {
      question: "What trading platforms are supported?",
      answer: "Currently, we support MetaTrader 5 (MT5) for all trading challenges. We may add support for other platforms in the future."
    }
  ];

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(230 35% 8%) 0%, hsl(250 45% 12%) 50%, hsl(230 35% 8%) 100%)' }}>
      <Header />
      <div className="pt-24 px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 rounded-2xl">
            <h1 className="text-4xl font-bold gradient-text mb-8">Frequently Asked Questions</h1>
            
            <div className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-glass-border">
                    <AccordionTrigger className="text-left text-white hover:text-primary">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <div className="mt-8 p-6 bg-glass-border/20 rounded-xl">
              <h3 className="text-xl font-semibold text-white mb-2">Still have questions?</h3>
              <p className="text-foreground">
                If you can't find the answer you're looking for, please contact our support team at 
                <a href="mailto:support@ctg.com" className="text-primary hover:underline ml-1">
                  support@ctg.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;