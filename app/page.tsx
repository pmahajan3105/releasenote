"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/store";
import { 
  Brain, 
  Layers, 
  Zap, 
  Code, 
  TrendingUp, 
  PieChart, 
  HelpCircle,
  Github,
  Menu,
  X
} from "lucide-react";

function LandingNavbar() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-sm font-bold text-white">R</span>
            </div>
            <span className="text-xl font-bold text-gray-900">ReleaseNoteAI</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="#features" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Features
            </Link>
            <Link 
              href="#testimonials" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Testimonials
            </Link>
            <Link href="/docs" className="text-gray-600 hover:text-gray-900 transition-colors">
              Docs
            </Link>
            <Link href="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
              Sign In
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 border-t">
            <div className="flex flex-col space-y-4 pt-4">
              <Link 
                href="#features" 
                className="text-gray-600 hover:text-gray-900"
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpen(false);
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Features
              </Link>
              <Link 
                href="#testimonials" 
                className="text-gray-600 hover:text-gray-900"
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpen(false);
                  document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Testimonials
              </Link>
              <Link href="/docs" className="text-gray-600 hover:text-gray-900">
                Docs
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                Sign In
              </Link>
              <Link href="/signup">
                <Button className="w-full">Get Started</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default function ReleaseNoteLanding() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      <LandingNavbar />
      
      {/* Hero Section */}
      <section className="flex w-full flex-col items-center justify-center px-6 py-24">
        <div className="flex w-full max-w-4xl flex-col items-center gap-8 text-center">
          <Badge variant="secondary" className="mb-4">
            🚀 AI-Powered Release Notes
          </Badge>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-6xl">
            AI-powered release notes
          </h1>
          <p className="max-w-2xl text-xl text-gray-600">
            Transform your Git commits and tickets into professional release
            notes in seconds
          </p>
          <div className="flex gap-4">
            <Link href="/signup">
              <Button size="lg" className="h-12 px-8">
                Try Free Today
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="h-12 px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Demo Image */}
      <section className="flex w-full flex-col items-center px-6 py-12">
        <div className="w-full max-w-5xl">
          <img
            className="h-96 w-full rounded-lg object-cover shadow-2xl border"
            src="https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=1200&h=800&fit=crop"
            alt="ReleaseNoteAI Dashboard"
          />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="flex w-full flex-col items-center px-6 py-24 bg-gray-50">
        <div className="flex w-full max-w-6xl flex-col items-center gap-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Simple. Smart. Effective.
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to create professional release notes
            </p>
          </div>
          
          <div className="grid w-full gap-8 md:grid-cols-3">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 mb-4">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  AI-Powered Generation
                </h3>
                <p className="text-gray-600">
                  Our AI analyzes your commits and tickets to create professional
                  release notes automatically.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 mb-4">
                  <Layers className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Multiple Input Sources
                </h3>
                <p className="text-gray-600">
                  Connect GitHub, Jira, Linear, or paste your own content for
                  maximum flexibility.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 mb-4">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Instant Publishing
                </h3>
                <p className="text-gray-600">
                  Generate, edit, and publish release notes in minutes, not hours.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Audience Section */}
      <section className="flex w-full flex-col items-center px-6 py-24">
        <div className="flex w-full max-w-6xl flex-col items-center gap-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Tailored for Every Audience
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Generate release notes optimized for different stakeholders
            </p>
          </div>

          <div className="grid w-full gap-6 md:grid-cols-2">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 mb-4">
                  <Code className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Engineer
                </h3>
                <p className="text-gray-600">
                  Technical changelog with detailed implementation notes and API
                  changes.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 mb-4">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Marketing
                </h3>
                <p className="text-gray-600">
                  Blog-style summary highlighting key features and business
                  benefits.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 mb-4">
                  <PieChart className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  C-Level
                </h3>
                <p className="text-gray-600">
                  Executive brief focusing on business impact and strategic value.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 mb-4">
                  <HelpCircle className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Support Team
                </h3>
                <p className="text-gray-600">
                  Customer-focused notes with troubleshooting and feature
                  guidance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section id="testimonials" className="flex w-full flex-col items-center px-6 py-24 bg-gray-50">
        <div className="flex w-full max-w-6xl flex-col items-center gap-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Trusted by Leading Teams
            </h2>
          </div>

          {/* Testimonials */}
          <div className="grid w-full gap-8 md:grid-cols-2">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <p className="text-gray-600 italic mb-6">
                  "ReleaseNoteAI has transformed how we communicate updates. The
                  persona-based outputs are a game-changer for our
                  cross-functional teams."
                </p>
                <div className="flex items-center gap-4">
                  <img
                    className="h-12 w-12 rounded-full object-cover"
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=48&h=48&fit=crop"
                    alt="Sarah Chen"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Sarah Chen</p>
                    <p className="text-sm text-gray-600">Product Manager at TechCorp</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <p className="text-gray-600 italic mb-6">
                  "The automated release notes save us hours of work each sprint.
                  The technical accuracy is impressive."
                </p>
                <div className="flex items-center gap-4">
                  <img
                    className="h-12 w-12 rounded-full object-cover"
                    src="https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=48&h=48&fit=crop"
                    alt="Michael Torres"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Michael Torres</p>
                    <p className="text-sm text-gray-600">Engineering Lead at CloudScale</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="flex w-full flex-wrap items-center justify-center gap-12">
            <div className="flex flex-col items-center gap-2">
              <span className="text-3xl font-bold text-blue-600">10,000+</span>
              <span className="text-sm text-gray-600">Release Notes Generated</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-3xl font-bold text-blue-600">500+</span>
              <span className="text-sm text-gray-600">Development Teams</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-3xl font-bold text-blue-600">99.9%</span>
              <span className="text-sm text-gray-600">Uptime</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="flex w-full flex-col items-center px-6 py-24">
        <div className="flex w-full max-w-4xl flex-col items-center gap-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Ready to transform your release notes?
          </h2>
          <p className="text-xl text-gray-600">
            Join thousands of teams already using ReleaseNoteAI
          </p>
          <div className="flex gap-4">
            <Link href="/signup">
              <Button size="lg" className="h-12 px-8">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="h-12 px-8">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-sm font-bold text-white">R</span>
              </div>
              <span className="text-lg font-bold text-gray-900">ReleaseNoteAI</span>
              <span className="text-sm text-gray-500 ml-4">
                © 2025 ReleaseNoteAI. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-8">
              <Link 
                href="#features" 
                className="text-sm text-gray-600 hover:text-gray-900"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Features
              </Link>
              <Link 
                href="#testimonials" 
                className="text-sm text-gray-600 hover:text-gray-900"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Testimonials
              </Link>
              <Link href="/docs" className="text-sm text-gray-600 hover:text-gray-900">
                Documentation
              </Link>
              <Link href="/support" className="text-sm text-gray-600 hover:text-gray-900">
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 