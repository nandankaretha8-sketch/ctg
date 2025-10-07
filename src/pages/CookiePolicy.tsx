import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const CookiePolicy = () => {
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
          <h1 className="text-4xl font-bold text-white mb-4">Cookie Policy</h1>
          <p className="text-gray-300 text-lg">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8">
          <div className="prose prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">1. What Are Cookies</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Cookies are small text files that are placed on your computer or mobile device when you visit 
                  our website. They are widely used to make websites work more efficiently and to provide 
                  information to website owners.
                </p>
                <p>
                  Cookies allow us to recognize your device and remember information about your visit, 
                  such as your preferred language and other settings.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Cookies</h2>
              <div className="text-gray-300 space-y-4">
                <p>We use cookies for several purposes:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
                  <li><strong>Performance Cookies:</strong> Help us understand how visitors interact with our website</li>
                  <li><strong>Functionality Cookies:</strong> Remember your preferences and settings</li>
                  <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">3. Types of Cookies We Use</h2>
              <div className="text-gray-300 space-y-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Essential Cookies</h3>
                  <p>
                    These cookies are necessary for the website to function and cannot be switched off. 
                    They are usually only set in response to actions made by you which amount to a request 
                    for services, such as setting your privacy preferences, logging in, or filling in forms.
                  </p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Analytics Cookies</h3>
                  <p>
                    These cookies allow us to count visits and traffic sources so we can measure and 
                    improve the performance of our site. They help us to know which pages are the most 
                    and least popular and see how visitors move around the site.
                  </p>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Functional Cookies</h3>
                  <p>
                    These cookies enable the website to provide enhanced functionality and personalization. 
                    They may be set by us or by third party providers whose services we have added to our pages.
                  </p>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Marketing Cookies</h3>
                  <p>
                    These cookies may be set through our site by our advertising partners to build a 
                    profile of your interests and show you relevant adverts on other sites.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">4. Third-Party Cookies</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We may also use third-party cookies from trusted partners to enhance your experience:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Google Analytics:</strong> To analyze website traffic and user behavior</li>
                  <li><strong>Payment Processors:</strong> To process secure transactions</li>
                  <li><strong>Social Media:</strong> To enable social sharing features</li>
                  <li><strong>Customer Support:</strong> To provide live chat functionality</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">5. Managing Cookies</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  You have several options for managing cookies:
                </p>
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Browser Settings</h3>
                  <p>
                    Most web browsers allow you to control cookies through their settings preferences. 
                    You can set your browser to refuse cookies or delete certain cookies.
                  </p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Cookie Consent</h3>
                  <p>
                    When you first visit our website, you'll see a cookie consent banner. You can choose 
                    which types of cookies to accept or reject.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">6. Impact of Disabling Cookies</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  If you choose to disable cookies, some features of our website may not function properly:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You may not be able to stay logged in</li>
                  <li>Your preferences may not be saved</li>
                  <li>Some interactive features may not work</li>
                  <li>We may not be able to remember your language preference</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">7. Cookie Retention</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Different cookies have different retention periods:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
                  <li><strong>Persistent Cookies:</strong> Remain on your device for a set period</li>
                  <li><strong>Authentication Cookies:</strong> Typically expire after 30 days</li>
                  <li><strong>Analytics Cookies:</strong> Usually expire after 2 years</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">8. Updates to This Policy</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We may update this Cookie Policy from time to time to reflect changes in our practices 
                  or for other operational, legal, or regulatory reasons.
                </p>
                <p>
                  We will notify you of any material changes by posting the new Cookie Policy on this page 
                  and updating the "Last updated" date.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">9. Contact Us</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  If you have any questions about our use of cookies, please contact us at:
                </p>
                <div className="bg-white/5 rounded-lg p-4">
                  <p><strong>Email:</strong> privacy@ctgtrading.com</p>
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

export default CookiePolicy;