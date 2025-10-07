import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/10 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-gray-300 text-lg">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8">
          <div className="prose prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  By accessing and using CTG Trading Platform ("the Service"), you accept and agree to be bound 
                  by the terms and provision of this agreement.
                </p>
                <p>
                  If you do not agree to abide by the above, please do not use this service.
                </p>
              </div>
              </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  CTG Trading Platform provides:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Trading competitions and challenges</li>
                  <li>Signal services and trading alerts</li>
                  <li>Prop firm packages and services</li>
                  <li>Educational resources and tools</li>
                  <li>Community features and support</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts</h2>
              <div className="text-gray-300 space-y-4">
                <p>To access certain features, you must create an account. You agree to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use</li>
                </ul>
              </div>
              </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">4. Trading Competitions</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Participation in trading competitions is subject to specific rules and regulations:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>All trades must comply with competition rules</li>
                  <li>No manipulation or fraudulent trading practices</li>
                  <li>Results are final and binding</li>
                  <li>Prizes are subject to verification</li>
                </ul>
              </div>
              </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">5. Payment Terms</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Payment for services is required in advance. All fees are non-refundable unless 
                  otherwise specified in our refund policy.
                </p>
                <p>
                  We reserve the right to change our pricing at any time with 30 days notice.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">6. Prohibited Uses</h2>
              <div className="text-gray-300 space-y-4">
                <p>You may not use our service:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                  <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                  <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                  <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                  <li>To submit false or misleading information</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">7. Intellectual Property</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  The service and its original content, features, and functionality are and will remain 
                  the exclusive property of CTG Trading Platform and its licensors.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">8. Disclaimer</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  The information on this service is provided on an "as is" basis. To the fullest extent 
                  permitted by law, this Company excludes all representations, warranties, conditions and 
                  terms relating to our service.
                </p>
              </div>
              </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">9. Limitation of Liability</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  In no event shall CTG Trading Platform, nor its directors, employees, partners, agents, 
                  suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, 
                  or punitive damages, including without limitation, loss of profits, data, use, goodwill, 
                  or other intangible losses.
                </p>
              </div>
              </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">10. Termination</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We may terminate or suspend your account and bar access to the service immediately, 
                  without prior notice or liability, under our sole discretion, for any reason whatsoever 
                  and without limitation.
                </p>
              </div>
              </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">11. Changes to Terms</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
                  If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
                </p>
              </div>
              </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">12. CTG Full Site Disclaimer (Must Read)</h2>
              <div className="text-gray-300 space-y-4">
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-red-300 mb-3">General Risk Disclosure</h3>
                  <p>
                    CTG (Certified Traders Group) provides educational, mentorship, signal, and automated (copy trading) services for financial markets. All content, including but not limited to courses, analyses, signals, and copy trade performance, is for informational and educational purposes only and should not be construed as personalized financial advice or a solicitation to buy or sell any security.
                  </p>
                  <p>
                    Trading any financial market involves significant risk of loss and is not suitable for all investors. Leverage can work both to your advantage and disadvantage. Past performance is not necessarily indicative of future results. Before deciding to participate in any financial market, you should carefully consider your investment objectives, level of experience, and risk appetite. You should not invest money that you cannot afford to lose.
                  </p>
                </div>

                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-yellow-300 mb-3">Signals and Mentorship Disclaimer</h3>
                  <p><strong>No Financial Advice:</strong> Neither the mentorship provided by CTG nor the signals shared (CTG INNER CIRCLE) constitute financial advice. We provide information based on our methodologies; however, all decisions regarding trades, position sizing, and risk management remain the sole responsibility of the user.</p>
                  <p><strong>Hypothetical Performance:</strong> Any performance figures, testimonials, or results shown for our mentorship or signal services are often hypothetical or based on the performance of a single account or individual. Hypothetical results have many inherent limitations and do not represent actual trading.</p>
                </div>

                <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-orange-300 mb-3">Copy Trade (CTG SYNC) Disclaimer</h3>
                  <p><strong>No Guarantee of Profit:</strong> The CTG SYNC copy trading service is highly risky. By utilizing CTG SYNC, you authorize the automatic duplication of trades from our master account into your brokerage account. We cannot guarantee the profitability of any trade or strategy.</p>
                  <p><strong>Execution Risk:</strong> While CTG strives for perfect synchronization, factors such as internet connectivity, slippage, latency, and broker execution policies can lead to differences between the performance of the master account and your linked account. You may experience losses, and your results may vary significantly from the published performance.</p>
                  <p><strong>You Remain Fully Responsible For Any Service Provided At CTG:</strong> You acknowledge and agree that CTG is not acting as a financial advisor or money manager and is not responsible for any losses incurred as a result of using the ANY CTG service. You bear the sole responsibility for all decisions and actions taken in your brokerage account, including the decision to link or unlink the copy trading service.</p>
                </div>

                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-purple-300 mb-3">Indemnification and Liability</h3>
                  <p>
                    You agree to indemnify and hold CTG, its employees, directors, and affiliates harmless from any and all losses, costs, liabilities, and expenses (including reasonable attorneys' fees) related to or arising out of your use of any of our services, including the CTG SYNC service. CTG will not be liable for any loss or damage, including without limitation, any loss of profit, which may arise directly or indirectly from the use of or reliance on our information and services.
                  </p>
                  <p className="font-semibold text-white">
                    By accessing this website and utilizing any CTG service, you acknowledge that you have read and fully understand this disclaimer.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">13. Contact Information</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="bg-white/5 rounded-lg p-4">
                  <p><strong>Email:</strong> tinoctg7@gmail.com</p>
                  <p><strong>Address:</strong> Moscow, Ru 00012</p>
                </div>
            </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;