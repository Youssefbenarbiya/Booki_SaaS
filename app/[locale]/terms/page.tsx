"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

export default function TermsPage() {
  const params = useParams();
  const currentLocale = (params.locale as string) || "en";

  // Use a try-catch to handle potential missing translations
  let t;
  try {
    t = useTranslations("terms");
  } catch (error) {
    // Fallback to a simple function that returns the key if translation is missing
    t = (key) => {
      const fallbacks = {
        title: "Terms and Privacy Policies",
        backToSignUp: "Back to Sign Up",
        termsOfService: "Terms of Service",
        privacyPolicy: "Privacy Policy",
        serviceSpecificTerms: "Service Specific Terms",
        lastUpdated: "Last updated",
      };
      return fallbacks[key] || key;
    };
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-8">
          <div className="mb-8">
            <Link
              href={`/${currentLocale}/sign-up`}
              className="inline-flex items-center text-orange-500 hover:text-orange-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              {t("backToSignUp")}
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {t("title")}
          </h1>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                1. {t("termsOfService")}
              </h2>
              <div className="prose prose-orange max-w-none text-gray-600">
                <p>
                  Welcome to Booki. By accessing or using our services, you
                  agree to be bound by these Terms of Service. These Terms of
                  Service affect your legal rights and obligations, so if you do
                  not agree to them, do not use our services.
                </p>

                <h3 className="text-xl font-medium mt-4 mb-2">
                  1.1 Account Registration
                </h3>
                <p>
                  To use certain features of our service, you must register for
                  an account. When you register, you agree to provide accurate,
                  current, and complete information about yourself and to keep
                  this information up to date.
                </p>

                <h3 className="text-xl font-medium mt-4 mb-2">
                  1.2 Acceptable Use
                </h3>
                <p>You agree not to use our services:</p>
                <ul className="list-disc pl-6 mt-2 mb-4">
                  <li>
                    In any way that violates any applicable laws or regulations
                  </li>
                  <li>
                    To impersonate or attempt to impersonate Booki, a Booki
                    employee, another user, or any other person
                  </li>
                  <li>
                    To engage in any conduct that restricts or inhibits anyone's
                    use or enjoyment of our services
                  </li>
                  <li>
                    To attempt to gain unauthorized access to any portion of the
                    service
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                2. {t("privacyPolicy")}
              </h2>
              <div className="prose prose-orange max-w-none text-gray-600">
                <p>
                  Your privacy is important to us. Our Privacy Policy explains
                  how we collect, use, and protect your personal information
                  when you use our services.
                </p>

                <h3 className="text-xl font-medium mt-4 mb-2">
                  2.1 Information We Collect
                </h3>
                <p>
                  We collect information you provide directly to us when you:
                </p>
                <ul className="list-disc pl-6 mt-2 mb-4">
                  <li>Create an account</li>
                  <li>Use our services</li>
                  <li>Contact customer support</li>
                  <li>Participate in surveys or promotions</li>
                </ul>

                <h3 className="text-xl font-medium mt-4 mb-2">
                  2.2 How We Use Your Information
                </h3>
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-6 mt-2 mb-4">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process transactions and send related information</li>
                  <li>
                    Send technical notices, updates, security alerts, and
                    support messages
                  </li>
                  <li>Respond to your comments, questions, and requests</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                3. {t("serviceSpecificTerms")}
              </h2>
              <div className="prose prose-orange max-w-none text-gray-600">
                <h3 className="text-xl font-medium mt-4 mb-2">
                  3.1 For Customers
                </h3>
                <p>
                  As a customer, you agree to provide accurate information when
                  booking services through our platform. You are responsible for
                  reviewing and accepting the terms of each service provider
                  before completing a booking.
                </p>

                <h3 className="text-xl font-medium mt-4 mb-2">
                  3.2 For Agencies
                </h3>
                <p>
                  As an agency, you agree to provide accurate information about
                  your services and availability. You are responsible for
                  fulfilling all services booked through our platform according
                  to the terms you've established.
                </p>
              </div>
            </section>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              {t("lastUpdated")}: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
