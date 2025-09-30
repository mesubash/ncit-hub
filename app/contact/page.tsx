import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ArrowLeft, Mail, Phone, MapPin, Clock } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-xl font-bold text-primary">
                College Hub
              </Link>
              <div className="hidden md:flex space-x-6">
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
                <Link href="/blogs" className="text-muted-foreground hover:text-primary transition-colors">
                  Blogs
                </Link>
                <Link href="/events" className="text-muted-foreground hover:text-primary transition-colors">
                  Events
                </Link>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About
                </Link>
                <Link href="/contact" className="text-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin">Admin</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-4xl font-bold text-foreground mb-4">Contact Us</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Have questions, suggestions, or want to contribute to College Hub? We'd love to hear from you!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john.doe@college.edu" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="What's this about?" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Tell us more about your inquiry..." rows={6} />
                </div>

                <Button className="w-full">Send Message</Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
                <CardDescription>Here are the different ways you can reach us.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Mail className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground">Email</h3>
                    <p className="text-muted-foreground">info@college.edu</p>
                    <p className="text-sm text-muted-foreground">We typically respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Phone className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground">Phone</h3>
                    <p className="text-muted-foreground">(555) 123-4567</p>
                    <p className="text-sm text-muted-foreground">Monday - Friday, 9:00 AM - 5:00 PM</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <MapPin className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground">Address</h3>
                    <p className="text-muted-foreground">
                      123 College Avenue
                      <br />
                      City, State 12345
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Clock className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground">Office Hours</h3>
                    <p className="text-muted-foreground">
                      Monday - Friday: 9:00 AM - 5:00 PM
                      <br />
                      Saturday: 10:00 AM - 2:00 PM
                      <br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">How can I submit a blog post?</h4>
                  <p className="text-sm text-muted-foreground">
                    Contact us through the form or email with your blog post idea. We'll review it and get back to you
                    within 2-3 business days.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">Can I promote my event on College Hub?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes! Send us your event details and we'll help you reach the college community through our events
                    section.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">How do I report an issue with the website?</h4>
                  <p className="text-sm text-muted-foreground">
                    Please use the contact form above or email us directly with details about the issue you're
                    experiencing.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
