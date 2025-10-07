import Header from "@/components/Header";

const RefundPolicy = () => {
  return (
    <div className="min-h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(230 35% 8%) 0%, hsl(250 45% 12%) 50%, hsl(230 35% 8%) 100%)' }}>
      <Header />
      <div className="pt-24 px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 rounded-2xl">
            <h1 className="text-4xl font-bold gradient-text mb-8">Refund Policy</h1>
            
            <div className="space-y-6 text-foreground">
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Refund Eligibility</h2>
                <p className="leading-relaxed">
                  Refunds are available within 30 days of purchase for unused challenge accounts. 
                  Refunds are not available for completed challenges or accounts that have been used.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">How to Request a Refund</h2>
                <p className="leading-relaxed">
                  To request a refund, please contact our support team at support@ctg.com with your 
                  account details and reason for the refund request.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Processing Time</h2>
                <p className="leading-relaxed">
                  Refund requests are typically processed within 5-10 business days. You will receive 
                  an email confirmation once your refund has been processed.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Non-Refundable Items</h2>
                <p className="leading-relaxed">
                  The following items are not eligible for refunds:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Completed trading challenges</li>
                  <li>Used challenge accounts</li>
                  <li>Digital products that have been downloaded</li>
                  <li>Services that have been fully rendered</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
                <p className="leading-relaxed">
                  If you have any questions about our refund policy, please contact us at 
                  support@ctg.com
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;