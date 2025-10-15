import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import Link from "next/link"
import { ArrowLeft, FileText, Shield, AlertCircle, Users, BookOpen } from "lucide-react"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container max-w-4xl mx-auto px-4 py-8 sm:py-12 md:py-16">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <Card className="border-2">
          <CardContent className="prose prose-sm sm:prose max-w-none p-6 sm:p-8 dark:prose-invert">
            {/* Introduction */}
            <section className="mb-8">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg mt-1">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mt-0 mb-2">1. Introduction</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Welcome to NCIT Hub ("we," "our," or "us"). These Terms of Service ("Terms") govern your access to and use of the NCIT Hub platform, including our website, mobile applications, and services (collectively, the "Service"). By accessing or using our Service, you agree to be bound by these Terms.
                  </p>
                </div>
              </div>
            </section>

            {/* Acceptance of Terms */}
            <section className="mb-8">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-green-500/10 rounded-lg mt-1">
                  <Shield className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mt-0 mb-2">2. Acceptance of Terms</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    By creating an account and using NCIT Hub, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, please do not use our Service.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    These Terms apply to all users of the Service, including students, faculty members, and administrators of Nepal College of Information Technology (NCIT).
                  </p>
                </div>
              </div>
            </section>

            {/* User Accounts */}
            <section className="mb-8">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-purple-500/10 rounded-lg mt-1">
                  <Users className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mt-0 mb-2">3. User Accounts</h2>
                  
                  <h3 className="text-xl font-semibold mt-4 mb-2">3.1 Account Registration</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>You must provide accurate and complete information during registration</li>
                    <li>You must be a current student, faculty member, or authorized administrator of NCIT</li>
                    <li>You must use your official NCIT email address for registration</li>
                    <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                    <li>You must notify us immediately of any unauthorized access to your account</li>
                  </ul>

                  <h3 className="text-xl font-semibold mt-4 mb-2">3.2 Account Types</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>Student Accounts:</strong> For enrolled NCIT students to share blogs, register for events, and engage with campus content</li>
                    <li><strong>Faculty Accounts:</strong> For NCIT faculty members to publish educational content and manage student activities</li>
                    <li><strong>Admin Accounts:</strong> For authorized administrators to moderate content and manage platform operations</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Acceptable Use */}
            <section className="mb-8">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-orange-500/10 rounded-lg mt-1">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mt-0 mb-2">4. Acceptable Use Policy</h2>
                  
                  <h3 className="text-xl font-semibold mt-4 mb-2">4.1 You Agree Not To:</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Post content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable</li>
                    <li>Impersonate any person or entity, or falsely state or misrepresent your affiliation with NCIT</li>
                    <li>Upload viruses or malicious code, or interfere with the proper functioning of the Service</li>
                    <li>Attempt to gain unauthorized access to any portion of the Service or related systems</li>
                    <li>Engage in any form of automated data collection (scraping, crawling, etc.) without permission</li>
                    <li>Harass, bully, or discriminate against other users</li>
                    <li>Post spam, advertisements, or promotional content without authorization</li>
                    <li>Violate any applicable local, state, national, or international law</li>
                  </ul>

                  <h3 className="text-xl font-semibold mt-4 mb-2">4.2 Content Standards</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    All content posted on NCIT Hub must align with academic integrity standards and respect the diverse NCIT community. Content should be educational, informative, or contribute positively to campus discourse.
                  </p>
                </div>
              </div>
            </section>

            {/* Content Ownership */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-3">5. Content Ownership and License</h2>
              
              <h3 className="text-xl font-semibold mt-4 mb-2">5.1 Your Content</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                You retain all rights to the content you post on NCIT Hub. By posting content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, reproduce, and distribute your content on the platform for operational purposes.
              </p>

              <h3 className="text-xl font-semibold mt-4 mb-2">5.2 Platform Content</h3>
              <p className="text-muted-foreground leading-relaxed">
                All content provided by NCIT Hub, including but not limited to text, graphics, logos, and software, is the property of NCIT Hub or its licensors and is protected by intellectual property laws.
              </p>
            </section>

            {/* Content Moderation */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-3">6. Content Moderation</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                NCIT Hub administrators reserve the right to review, moderate, edit, or remove any content that violates these Terms or is deemed inappropriate. Blog posts submitted by students require admin approval before publication.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We may, but are not obligated to, monitor or review content. We reserve the right to remove content and terminate accounts at our discretion.
              </p>
            </section>

            {/* Privacy */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-3">7. Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your use of NCIT Hub is also governed by our{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
                , which describes how we collect, use, and protect your personal information.
              </p>
            </section>

            {/* Disclaimers */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-3">8. Disclaimers</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We do not warrant that the Service will be uninterrupted, secure, or error-free. We do not guarantee the accuracy, completeness, or reliability of any content on the platform.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-3">9. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, NCIT HUB SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
              </p>
            </section>

            {/* Termination */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-3">10. Termination</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We reserve the right to suspend or terminate your account at any time, with or without notice, for any reason, including but not limited to violation of these Terms.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Upon termination, your right to use the Service will immediately cease. We may also delete your account and all associated content.
              </p>
            </section>

            {/* Changes to Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-3">11. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the updated Terms on the platform. Your continued use of the Service after such changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            {/* Governing Law */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-3">12. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of Nepal. Any disputes arising from these Terms or your use of the Service shall be subject to the exclusive jurisdiction of the courts of Nepal.
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-8 bg-muted/30 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-3 mt-0">13. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li><strong>Email:</strong> support@ncithub.edu.np</li>
                <li><strong>Phone:</strong> +977-1-5201003</li>
                <li><strong>Address:</strong> Nepal College of Information Technology (NCIT), Balkumari, Lalitpur, Nepal</li>
              </ul>
            </section>

            {/* Acknowledgment */}
            <section className="border-t pt-6">
              <p className="text-sm text-muted-foreground italic">
                By using NCIT Hub, you acknowledge that you have read these Terms of Service and agree to be bound by them. These Terms constitute a legally binding agreement between you and NCIT Hub.
              </p>
            </section>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href="/privacy">
              View Privacy Policy
            </Link>
          </Button>
          <Button asChild>
            <Link href="/register">
              Create Account
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
