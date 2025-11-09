import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, Phone, MapPin, Send, Building2, MessageSquare, 
  Facebook, Twitter, Instagram, Linkedin, Github 
} from "lucide-react";
import { motion } from "framer-motion";

const Contact = () => {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [sponsorForm, setSponsorForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    interest: "",
    message: "",
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Contact form submitted:", contactForm);
    alert("Thank you for your message! We'll get back to you soon.");
    setContactForm({ name: "", email: "", message: "" });
  };

  const handleSponsorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Sponsor form submitted:", sponsorForm);
    alert("Thank you for your interest in sponsoring NDL! We'll contact you soon.");
    setSponsorForm({
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      interest: "",
      message: "",
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#1A1A1A]">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
            Get in Touch
          </h1>
          <p className="text-muted-foreground text-lg">
            Have questions? Want to partner with us? We'd love to hear from you!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Contact Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Reach out to us through any of these channels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">Email</div>
                  <div className="text-sm text-muted-foreground">info@ndl.africa</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">Phone</div>
                  <div className="text-sm text-muted-foreground">+233 XX XXX XXXX</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">Headquarters</div>
                  <div className="text-sm text-muted-foreground">
                    Silicon Valley of Africa<br />
                    Accra, Ghana
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>Follow Us</CardTitle>
              <CardDescription>Stay connected on social media</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "Facebook", icon: Facebook, url: "https://facebook.com" },
                  { name: "Twitter", icon: Twitter, url: "https://twitter.com" },
                  { name: "Instagram", icon: Instagram, url: "https://instagram.com" },
                  { name: "LinkedIn", icon: Linkedin, url: "https://linkedin.com" },
                  { name: "GitHub", icon: Github, url: "https://github.com" },
                ].map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      className="p-4 rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center gap-2"
                    >
                      <Icon className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">{social.name}</span>
                    </motion.a>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Address Card */}
          <Card>
            <CardHeader>
              <CardTitle>Visit Us</CardTitle>
              <CardDescription>Our physical location</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="font-semibold mb-2">Silicon Valley of Africa</div>
                  <div className="text-sm text-muted-foreground">
                    123 Innovation Street<br />
                    Accra, Ghana<br />
                    West Africa
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <div className="font-semibold mb-1">Office Hours</div>
                  <div>Monday - Friday: 9:00 AM - 5:00 PM</div>
                  <div>Saturday: 10:00 AM - 2:00 PM</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Forms */}
        <Tabs defaultValue="contact" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="contact">
              <MessageSquare className="mr-2 h-4 w-4" />
              General Inquiry
            </TabsTrigger>
            <TabsTrigger value="sponsor">
              <Building2 className="mr-2 h-4 w-4" />
              Sponsor/Partner
            </TabsTrigger>
          </TabsList>

          {/* Contact Form */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>We'll get back to you as soon as possible</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Your message..."
                      rows={6}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sponsor Form */}
          <TabsContent value="sponsor">
            <Card>
              <CardHeader>
                <CardTitle>Become a Sponsor or Partner</CardTitle>
                <CardDescription>Join us in supporting the next generation of developers</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSponsorSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        placeholder="Your company name"
                        value={sponsorForm.companyName}
                        onChange={(e) => setSponsorForm({ ...sponsorForm, companyName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Contact Name</Label>
                      <Input
                        id="contactName"
                        placeholder="Your name"
                        value={sponsorForm.contactName}
                        onChange={(e) => setSponsorForm({ ...sponsorForm, contactName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sponsorEmail">Email</Label>
                      <Input
                        id="sponsorEmail"
                        type="email"
                        placeholder="your.email@company.com"
                        value={sponsorForm.email}
                        onChange={(e) => setSponsorForm({ ...sponsorForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+233 XX XXX XXXX"
                        value={sponsorForm.phone}
                        onChange={(e) => setSponsorForm({ ...sponsorForm, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interest">Interest Type</Label>
                    <Input
                      id="interest"
                      placeholder="e.g., Sponsorship, Partnership, Collaboration"
                      value={sponsorForm.interest}
                      onChange={(e) => setSponsorForm({ ...sponsorForm, interest: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sponsorMessage">Message</Label>
                    <Textarea
                      id="sponsorMessage"
                      placeholder="Tell us about your interest in partnering with NDL..."
                      rows={6}
                      value={sponsorForm.message}
                      onChange={(e) => setSponsorForm({ ...sponsorForm, message: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Building2 className="mr-2 h-4 w-4" />
                    Submit Partnership Inquiry
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;

