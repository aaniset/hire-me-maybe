import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function TermsAndConditions() {
  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Terms and Conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6 text-left">
              <Section title="1. Acceptance of Terms">
                <p>
                  By using Hire Me Maybe, you agree to these Terms and
                  Conditions and our Privacy Policy.
                </p>
              </Section>

              <Section title="2. Description of Service">
                <p>
                  Hire Me Maybe is a job tracking platform that integrates with
                  your Gmail account to automate job application tracking.
                </p>
              </Section>

              <Section title="3. Google API Services User Data Policy">
                <p>
                  We comply with the Google API Services User Data Policy,
                  including the Limited Use requirements.
                </p>
              </Section>

              <Section title="4. Use of the Service">
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    You must have a valid Gmail account to use Hire Me Maybe.
                  </li>
                  <li>
                    You are responsible for maintaining the confidentiality of
                    your account information.
                  </li>
                  <li>
                    You agree to use the service only for lawful purposes and in
                    accordance with these Terms.
                  </li>
                </ul>
              </Section>

              <Section title="5. Data Usage and Privacy">
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    We only access and use your Gmail data to provide and
                    improve our service.
                  </li>
                  <li>
                    We do not sell your personal information or use it for
                    advertising purposes.
                  </li>
                  <li>
                    You can revoke our access to your Gmail account at any time.
                  </li>
                </ul>
              </Section>

              <Section title="6. User Content">
                <p>
                  You retain all rights to your content. By using our service,
                  you grant us a license to use your content solely for the
                  purpose of providing and improving our service.
                </p>
              </Section>

              <Section title="7. Termination">
                <p>
                  We reserve the right to terminate or suspend your account for
                  violations of these Terms or for any other reason.
                </p>
              </Section>

              <Section title="8. Disclaimers and Limitations of Liability">
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    The service is provided "as is" without warranties of any
                    kind.
                  </li>
                  <li>
                    We are not liable for any indirect, incidental, special,
                    consequential, or punitive damages.
                  </li>
                </ul>
              </Section>

              <Section title="9. Changes to Terms">
                <p>
                  We may modify these Terms at any time. Continued use of the
                  service after changes constitutes acceptance of the new Terms.
                </p>
              </Section>

              <Section title="10. Governing Law">
                <p>
                  These Terms are governed by the laws of [Your Jurisdiction].
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
