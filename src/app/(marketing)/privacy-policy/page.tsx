import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Privacy Policy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6 text-left">
              <Section title="1. Information We Collect">
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    Account information: Email address and name associated with
                    your Gmail account.
                  </li>
                  <li>
                    Email data: We access job-related emails in your Gmail
                    account.
                  </li>
                  <li>Usage data: How you interact with our service.</li>
                </ul>
              </Section>

              <Section title="2. How We Use Your Information">
                <ul className="list-disc pl-5 space-y-2">
                  <li>To provide and improve our job tracking service.</li>
                  <li>
                    To analyze trends and user behavior in aggregate,
                    non-personally identifiable form.
                  </li>
                  <li>
                    To communicate with you about your account and our service.
                  </li>
                </ul>
              </Section>

              <Section title="3. Data Retention and Deletion">
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    We retain your data only as long as necessary to provide our
                    service.
                  </li>
                  <li>You can request deletion of your data at any time.</li>
                </ul>
              </Section>

              <Section title="4. Data Security">
                <p>
                  We implement industry-standard security measures to protect
                  your data.
                </p>
              </Section>

              <Section title="5. Third-Party Access">
                <p>
                  We do not share your personal information with third parties
                  except as required by law or with your explicit consent.
                </p>
              </Section>

              <Section title="6. Google API Services">
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    Our use of information received from Gmail APIs adheres to
                    Google API Services User Data Policy, including the Limited
                    Use requirements.
                  </li>
                  <li>
                    We only access and use your Gmail data to provide job
                    tracking services.
                  </li>
                </ul>
              </Section>

              <Section title="7. Your Rights">
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    You can access, correct, or delete your personal information
                    at any time.
                  </li>
                  <li>
                    You can revoke our access to your Gmail account through your
                    Google Account settings.
                  </li>
                </ul>
              </Section>

              <Section title="8. Changes to Privacy Policy">
                <p>
                  We may update this Privacy Policy from time to time. We will
                  notify you of any significant changes.
                </p>
              </Section>

              <Section title="9. Contact Us">
                <p>
                  If you have any questions about this Privacy Policy, please
                  contact us at [Your Contact Information].
                </p>
              </Section>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function Section({ title, children }: any) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      {children}
    </div>
  );
}
