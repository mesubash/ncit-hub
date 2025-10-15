import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import Link from "next/link"
import { ArrowLeft, Shield, Eye, Lock, Database, Users, AlertTriangle } from "lucide-react"

export default function PrivacyPolicyPage() {
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
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
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
                  <Eye className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mt-0 mb-2">1. Introduction</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Welcome to NCIT Hub's Privacy Policy. We at Nepal College of Information Technology (NCIT) are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-3">
                    By using NCIT Hub, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our Service.
                  </p>
                </div>
              </div>
            </section>

            {/* Information We Collect */}
            <section className="mb-8">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-purple-500/10 rounded-lg mt-1">
                  <Database className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mt-0 mb-2">2. Information We Collect</h2>
                  
                  <h3 className="text-xl font-semibold mt-4 mb-2">2.1 Personal Information</h3>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    When you register for an account, we collect the following information:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>Name:</strong> Your full name as provided during registration</li>
                    <li><strong>Email Address:</strong> Your official NCIT email address</li>
                    <li><strong>Password:</strong> Encrypted and stored securely</li>
                    <li><strong>Role:</strong> Student, Faculty, or Administrator</li>
                    <li><strong>Academic Information:</strong> Department, program type, semester/year, specialization (for students and faculty)</li>
                    <li><strong>Profile Information:</strong> Bio, avatar image, social links (optional)</li>
                  </ul>

                  <h3 className="text-xl font-semibold mt-4 mb-2">2.2 Content You Create</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Blog posts, articles, and written content</li>
                    <li>Comments and interactions on posts</li>
                    <li>Event registrations and participation records</li>
                    <li>Likes, bookmarks, and engagement metrics</li>
                    <li>Uploaded images and media files</li>
                  </ul>

                  <h3 className="text-xl font-semibold mt-4 mb-2">2.3 Automatically Collected Information</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>Usage Data:</strong> Pages visited, time spent, features used</li>
                    <li><strong>Device Information:</strong> Browser type, operating system, device identifiers</li>
                    <li><strong>IP Address:</strong> Your internet protocol address for security and analytics</li>
                    <li><strong>Cookies:</strong> Small data files stored on your device to enhance user experience</li>
                    <li><strong>Log Data:</strong> Server logs including timestamps, errors, and system events</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section className="mb-8">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-green-500/10 rounded-lg mt-1">
                  <Users className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mt-0 mb-2">3. How We Use Your Information</h2>
                  
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    We use the collected information for the following purposes:
                  </p>

                  <h3 className="text-xl font-semibold mt-4 mb-2">3.1 Service Provision</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>To create and manage your account</li>
                    <li>To provide access to blogs, events, and campus information</li>
                    <li>To facilitate event registrations and participation tracking</li>
                    <li>To enable content creation, publication, and moderation</li>
                    <li>To personalize your experience on the platform</li>
                  </ul>

                  <h3 className="text-xl font-semibold mt-4 mb-2">3.2 Communication</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>To send you notifications about your account activity</li>
                    <li>To notify you of event updates, blog approvals, and system changes</li>
                    <li>To respond to your inquiries and support requests</li>
                    <li>To send important announcements related to NCIT campus</li>
                  </ul>

                  <h3 className="text-xl font-semibold mt-4 mb-2">3.3 Security and Safety</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>To monitor and prevent fraudulent activity</li>
                    <li>To enforce our Terms of Service and community guidelines</li>
                    <li>To protect against security threats and unauthorized access</li>
                    <li>To maintain the integrity of the platform</li>
                  </ul>

                  <h3 className="text-xl font-semibold mt-4 mb-2">3.4 Analytics and Improvement</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>To analyze usage patterns and improve platform features</li>
                    <li>To understand user preferences and optimize content delivery</li>
                    <li>To generate insights for NCIT administration</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Information Sharing */}
            <section className="mb-8">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-orange-500/10 rounded-lg mt-1">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mt-0 mb-2">4. Information Sharing and Disclosure</h2>
                  
                  <h3 className="text-xl font-semibold mt-4 mb-2">4.1 Within NCIT Community</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Your published blog posts are visible to all NCIT Hub users</li>
                    <li>Your profile information (name, role, department) may be visible to other users</li>
                    <li>Event participation may be visible to event organizers and admins</li>
                    <li>Comments and interactions are visible to other users</li>
                  </ul>

                  <h3 className="text-xl font-semibold mt-4 mb-2">4.2 With NCIT Administration</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We may share anonymized usage data with NCIT administration for academic and operational purposes, such as understanding student engagement and improving campus services.
                  </p>

                  <h3 className="text-xl font-semibold mt-4 mb-2">4.3 Service Providers</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We use Supabase for authentication and database services. These third-party providers have access to your information only to perform tasks on our behalf and are obligated to protect it.
                  </p>

                  <h3 className="text-xl font-semibold mt-4 mb-2">4.4 Legal Requirements</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We may disclose your information if required by law, court order, or to protect the rights, property, or safety of NCIT, our users, or others.
                  </p>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 font-semibold mb-2">
                      <AlertTriangle className="inline h-4 w-4 mr-1" />
                      Important Note
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      We DO NOT sell, rent, or trade your personal information to third parties for marketing purposes.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Security */}
            <section className="mb-8">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-red-500/10 rounded-lg mt-1">
                  <Lock className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mt-0 mb-2">5. Data Security</h2>
                  
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    We implement industry-standard security measures to protect your personal information:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>Encryption:</strong> All data transmission is encrypted using SSL/TLS protocols</li>
                    <li><strong>Password Security:</strong> Passwords are hashed and salted using bcrypt</li>
                    <li><strong>Access Controls:</strong> Role-based access controls limit data access to authorized personnel</li>
                    <li><strong>Regular Backups:</strong> Data is regularly backed up to prevent loss</li>
                    <li><strong>Security Monitoring:</strong> Continuous monitoring for suspicious activity and threats</li>
                  </ul>

                  <p className="text-muted-foreground leading-relaxed mt-4">
                    However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
                  </p>
                </div>
              </div>
            </section>

            {/* Your Rights */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-3">6. Your Data Rights</h2>
              
              <p className="text-muted-foreground leading-relaxed mb-3">
                You have the following rights regarding your personal information:
              </p>

              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <strong>Access:</strong> You can view and update your profile information at any time through your account settings
                </li>
                <li>
                  <strong>Rectification:</strong> You can correct inaccurate or incomplete information
                </li>
                <li>
                  <strong>Deletion:</strong> You can request deletion of your account and associated data by contacting us. Note that some information may be retained for legal or legitimate business purposes
                </li>
                <li>
                  <strong>Data Portability:</strong> You can request a copy of your data in a machine-readable format
                </li>
                <li>
                  <strong>Withdrawal of Consent:</strong> You can withdraw consent for data processing at any time, which may limit your use of certain features
                </li>
              </ul>

              <p className="text-muted-foreground leading-relaxed mt-4">
                To exercise these rights, please contact us at privacy@ncithub.edu.np
              </p>
            </section>

            {/* Cookies */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-3">7. Cookies and Tracking Technologies</h2>
              
              <p className="text-muted-foreground leading-relaxed mb-3">
                We use cookies and similar tracking technologies to enhance your experience:
              </p>

              <h3 className="text-xl font-semibold mt-4 mb-2">7.1 Types of Cookies We Use</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><strong>Essential Cookies:</strong> Required for authentication and basic functionality</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences (e.g., theme)</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how users interact with the platform</li>
              </ul>

              <p className="text-muted-foreground leading-relaxed mt-4">
                You can control cookies through your browser settings. However, disabling cookies may limit your ability to use certain features of NCIT Hub.
              </p>
            </section>

            {/* Data Retention */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-3">8. Data Retention</h2>
              
              <p className="text-muted-foreground leading-relaxed mb-3">
                We retain your personal information for as long as necessary to:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>Provide you with our services</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes and enforce our agreements</li>
                <li>Maintain historical records for NCIT archives</li>
              </ul>

              <p className="text-muted-foreground leading-relaxed mt-4">
                When you delete your account, we will delete or anonymize your personal information within 30 days, except where retention is required by law or for legitimate business purposes.
              </p>
            </section>

            {/* Children's Privacy */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-3">9. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                NCIT Hub is intended for use by students, faculty, and staff of Nepal College of Information Technology who are 18 years or older. We do not knowingly collect information from individuals under 18. If you are under 18, please do not use this platform.
              </p>
            </section>

            {/* International Data Transfers */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-3">10. International Data Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your information may be stored and processed on servers located outside of Nepal, including in countries that may have different data protection laws. By using NCIT Hub, you consent to the transfer of your information to these locations.
              </p>
            </section>

            {/* Changes to Privacy Policy */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-3">11. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We may update our Privacy Policy from time to time. We will notify you of any significant changes by:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>Posting the new Privacy Policy on this page</li>
                <li>Updating the "Last updated" date at the top of this policy</li>
                <li>Sending you an email notification (for material changes)</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Your continued use of NCIT Hub after any changes constitutes acceptance of the updated Privacy Policy.
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-8 bg-muted/30 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-3 mt-0">12. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li><strong>Privacy Officer:</strong> privacy@ncithub.edu.np</li>
                <li><strong>General Support:</strong> support@ncithub.edu.np</li>
                <li><strong>Phone:</strong> +977-1-5201003</li>
                <li><strong>Address:</strong> Nepal College of Information Technology (NCIT), Balkumari, Lalitpur, Nepal</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We will respond to your inquiry within 7 business days.
              </p>
            </section>

            {/* Acknowledgment */}
            <section className="border-t pt-6">
              <p className="text-sm text-muted-foreground italic">
                By using NCIT Hub, you acknowledge that you have read and understood this Privacy Policy and agree to its terms. This Privacy Policy is effective as of the date stated at the top of this document.
              </p>
            </section>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href="/terms">
              View Terms of Service
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
