import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import Link from "next/link"
import { ArrowLeft, Users, BookOpen, Calendar, Award, Code, Globe, Github, Linkedin, Mail } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-4xl font-bold text-foreground mb-4">About NCIT Hub</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            NCIT Hub is your central destination for staying connected with campus life, academic updates, and community
            events at Nepal College of Information Technology (NCIT).
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
          <div className="prose prose-lg max-w-none text-muted-foreground">
            <p className="text-lg leading-relaxed mb-6">
              At NCIT Hub, we believe that staying informed and connected is essential to making the most of your
              college experience. Our platform serves as the digital heart of our NCIT campus community, bringing
              together students, faculty, staff, and visitors through shared stories, important announcements, and
              exciting events.
            </p>
            <p className="text-lg leading-relaxed">
              We're committed to fostering a vibrant, inclusive community where every voice matters and every story has
              the potential to inspire, inform, and connect us all within Nepal's premier technology institute.
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">What We Offer</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="text-center">
                <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Student Blogs</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Share your experiences, insights, and knowledge with the NCIT community through our student blog
                  platform.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Campus Events</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Discover upcoming tech fests, workshops, seminars, and cultural activities happening at NCIT.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Community</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Connect with fellow NCIT students, faculty, and alumni through shared interests and academic pursuits.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Celebrate student and faculty achievements, research breakthroughs, and academic milestones.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Innovation</h3>
              <p className="text-muted-foreground">
                We embrace technology and innovation, reflecting NCIT's commitment to advancing Nepal's IT sector
                through education and research.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Collaboration</h3>
              <p className="text-muted-foreground">
                We believe in the power of collaboration and knowledge sharing to build a stronger tech community in
                Nepal and beyond.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Excellence</h3>
              <p className="text-muted-foreground">
                We strive for excellence in everything we do, from academic pursuits to community engagement, upholding
                NCIT's standards of quality education.
              </p>
            </div>
          </div>
        </section>

        <section id="developer" className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Developer Information</h2>
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Code className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Built with ❤️ for NCIT</CardTitle>
                  <CardDescription>Developed by passionate students and tech enthusiasts</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Developer Profile Section */}
              <div className="bg-muted/30 rounded-lg p-6 mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-2 bg-primary/20 rounded-full">
                    <Code className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-lg">Lead Developer</h4>
                    <p className="text-muted-foreground">Member of Nepal Tech Community</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-foreground">Subash Singh Dhami</h5>
                  <p className="text-sm text-muted-foreground">BE Software Engineering</p>
                  <p className="text-sm text-muted-foreground">
                    Passionate about building innovative solutions for educational institutions and fostering tech
                    communities in Nepal. Committed to creating platforms that enhance student engagement and academic
                    collaboration.
                  </p>
                </div>
              </div>

              <p className="text-muted-foreground">
                This platform was developed as a community initiative to enhance communication and engagement within the
                NCIT ecosystem. Built using modern web technologies including Next.js, TypeScript, and Tailwind CSS, it
                represents the innovative spirit of our institution.
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Technology Stack</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Next.js 15 with App Router</li>
                    <li>• TypeScript for type safety</li>
                    <li>• Tailwind CSS for styling</li>
                    <li>• Shadcn/ui components</li>
                    <li>• Modern authentication system</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Features</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Student blog submission system</li>
                    <li>• Admin review and moderation</li>
                    <li>• Role-based access control</li>
                    <li>• Responsive design</li>
                    <li>• Real-time updates</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="community" className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8">Managed by Nepal Tech Community</h2>
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <Globe className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Nepal Tech Community</CardTitle>
                  <CardDescription>Fostering innovation and collaboration in Nepal's tech ecosystem</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                This platform is proudly managed and maintained by the Nepal Tech Community, a vibrant network of
                developers, designers, entrepreneurs, and tech enthusiasts working together to advance Nepal's
                technology sector.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Our Mission</h4>
                  <p className="text-sm text-muted-foreground">
                    To create a thriving tech ecosystem in Nepal by connecting talented individuals, sharing knowledge,
                    and building innovative solutions that address local and global challenges.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Community Impact</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Supporting student developers</li>
                    <li>• Organizing tech meetups and workshops</li>
                    <li>• Mentoring emerging talent</li>
                    <li>• Promoting open source culture</li>
                    <li>• Building bridges with industry</li>
                  </ul>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold text-foreground mb-3">Get Involved</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Join our community and be part of Nepal's growing tech movement. Whether you're a student,
                  professional, or simply passionate about technology, there's a place for you.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="https://github.com/nepal-tech-community" target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href="https://linkedin.com/company/nepal-tech-community"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="mailto:community@nepaltech.org">
                      <Mail className="h-4 w-4 mr-2" />
                      Contact
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Contact CTA */}
        <section className="text-center bg-muted/30 rounded-lg p-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Get Involved</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Have a story to share or an event to promote? We'd love to hear from you! NCIT Hub is built by the
            community, for the community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/register">Join Our Community</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
