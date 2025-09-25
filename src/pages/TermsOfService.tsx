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
              <h2 className="text-2xl font-semibold text-white mb-4">12. Contact Information</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="bg-white/5 rounded-lg p-4">
                  <p><strong>Email:</strong> legal@ctgtrading.com</p>
                  <p><strong>Address:</strong> New York, NY 10001</p>
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