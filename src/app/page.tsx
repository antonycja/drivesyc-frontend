'use client'
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Car, Users, Clock, Star, CheckCircle, GraduationCap, Building2, MapPin, Shield, Phone, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth/utils/authProvider";

export default function Home() {

  const auth = useAuth()

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="text-center max-w-4xl mx-auto">
        <h1>{auth.isAuthenticated ? "You are logged": "not logged in"}</h1>
          <Badge variant="secondary" className="mb-6 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
            Connect Driving Schools with Learners
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Learn to Drive with <span className="text-blue-600">Confidence</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto">
            Whether you're a driving school managing lessons or a learner booking your next session, 
            DriveSync makes the entire process simple, efficient, and transparent.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card className="p-6 hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800 cursor-pointer group">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">For Driving Schools</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                  Manage instructors, vehicles, and bookings all in one place
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer">
                  School Dashboard
                </Button>
              </div>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-green-200 dark:hover:border-green-800 cursor-pointer group">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <GraduationCap className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">For Learners</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                  Book lessons, track progress, and connect with instructors
                </p>
                <Button className="w-full bg-green-600 hover:bg-green-700 cursor-pointer">
                  Book a Lesson
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 dark:bg-gray-800 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Everything You Need in One Platform
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Powerful features designed for both driving schools and learners to create the best learning experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white dark:bg-gray-900 border-0 shadow-sm hover:shadow-md transition-all">
              <CardHeader>
                <CalendarDays className="h-10 w-10 text-blue-600 dark:text-blue-400 mb-4" />
                <CardTitle>Smart Scheduling</CardTitle>
                <CardDescription>
                  Real-time availability, automatic conflict resolution, and easy rescheduling for both schools and learners.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white dark:bg-gray-900 border-0 shadow-sm hover:shadow-md transition-all">
              <CardHeader>
                <MapPin className="h-10 w-10 text-green-600 dark:text-green-400 mb-4" />
                <CardTitle>Location Management</CardTitle>
                <CardDescription>
                  Multiple pickup points, route optimization, and GPS tracking for enhanced safety and convenience.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white dark:bg-gray-900 border-0 shadow-sm hover:shadow-md transition-all">
              <CardHeader>
                <Users className="h-10 w-10 text-purple-600 dark:text-purple-400 mb-4" />
                <CardTitle>Instructor Matching</CardTitle>
                <CardDescription>
                  Smart matching based on availability, expertise, and learner preferences for optimal learning outcomes.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white dark:bg-gray-900 border-0 shadow-sm hover:shadow-md transition-all">
              <CardHeader>
                <Clock className="h-10 w-10 text-orange-600 dark:text-orange-400 mb-4" />
                <CardTitle>Progress Tracking</CardTitle>
                <CardDescription>
                  Detailed progress reports, milestone tracking, and performance analytics for continuous improvement.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white dark:bg-gray-900 border-0 shadow-sm hover:shadow-md transition-all">
              <CardHeader>
                <Shield className="h-10 w-10 text-red-600 dark:text-red-400 mb-4" />
                <CardTitle>Safety First</CardTitle>
                <CardDescription>
                  Background-checked instructors, vehicle safety reports, and emergency contact integration.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white dark:bg-gray-900 border-0 shadow-sm hover:shadow-md transition-all">
              <CardHeader>
                <Phone className="h-10 w-10 text-teal-600 dark:text-teal-400 mb-4" />
                <CardTitle>Mobile Ready</CardTitle>
                <CardDescription>
                  Full mobile app experience for booking, notifications, and communication on the go.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* For Schools Section */}
      <section id="for-schools" className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4 text-blue-600 border-blue-200">
                For Driving Schools
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                Streamline Your Operations
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Manage your entire driving school with powerful tools designed to increase efficiency, 
                reduce administrative burden, and grow your business.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Instructor Management</h4>
                    <p className="text-gray-600 dark:text-gray-300">Track availability, performance, and scheduling conflicts automatically.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Fleet Management</h4>
                    <p className="text-gray-600 dark:text-gray-300">Monitor vehicle usage, maintenance schedules, and availability in real-time.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Revenue Analytics</h4>
                    <p className="text-gray-600 dark:text-gray-300">Comprehensive reports on bookings, revenue, and business performance.</p>
                  </div>
                </div>
              </div>
              
              <Button size="lg" className="mt-8 bg-blue-600 hover:bg-blue-700">
                Start Free Trial
              </Button>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 shadow-xl">
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Today's Bookings</span>
                      <Badge variant="secondary">24</Badge>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">96%</div>
                    <div className="text-sm text-green-600 dark:text-green-400">+12% from yesterday</div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Active Instructors</span>
                      <Badge variant="secondary">18/20</Badge>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">90%</div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">Utilization rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Learners Section */}
      <section id="for-learners" className="bg-gray-50 dark:bg-gray-800 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8 shadow-xl">
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <GraduationCap className="h-10 w-10 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sarah's Progress</h4>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">75%</div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Course Completion</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Theory</span>
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Basic Maneuvers</span>
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Highway Driving</span>
                      <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <Badge variant="outline" className="mb-4 text-green-600 border-green-200">
                For Learners
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                Your Journey to Independence
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Take control of your learning experience with easy booking, progress tracking, 
                and direct communication with certified instructors.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Star className="h-6 w-6 text-yellow-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Choose Your Instructor</h4>
                    <p className="text-gray-600 dark:text-gray-300">Browse instructor profiles, ratings, and specialties to find your perfect match.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <CalendarDays className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Flexible Scheduling</h4>
                    <p className="text-gray-600 dark:text-gray-300">Book lessons that fit your schedule with instant confirmation and easy rescheduling.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <Clock className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Track Your Progress</h4>
                    <p className="text-gray-600 dark:text-gray-300">Monitor your learning journey with detailed progress reports and milestone achievements.</p>
                  </div>
                </div>
              </div>
              
              <Button size="lg" className="mt-8 bg-green-600 hover:bg-green-700">
                Find Driving Schools
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 lg:py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            Join thousands of driving schools and learners who trust DriveSync for their driving education needs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white flex-1">
              <Building2 className="h-5 w-5 mr-2" />
              For Schools
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/10 flex-1">
              <GraduationCap className="h-5 w-5 mr-2" />
              For Learners
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Car className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">DriveSync</span>
              </div>
              <p className="text-gray-400 text-sm">
                Connecting driving schools with learners for a better driving education experience.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Schools</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div><a href="#" className="hover:text-white transition-colors">School Dashboard</a></div>
                <div><a href="#" className="hover:text-white transition-colors">Instructor Management</a></div>
                <div><a href="#" className="hover:text-white transition-colors">Vehicle Tracking</a></div>
                <div><a href="#" className="hover:text-white transition-colors">Analytics</a></div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Learners</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div><a href="#" className="hover:text-white transition-colors">Find Schools</a></div>
                <div><a href="#" className="hover:text-white transition-colors">Book Lessons</a></div>
                <div><a href="#" className="hover:text-white transition-colors">Track Progress</a></div>
                <div><a href="#" className="hover:text-white transition-colors">Find Instructors</a></div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div><a href="#" className="hover:text-white transition-colors">Help Center</a></div>
                <div><a href="#" className="hover:text-white transition-colors">Contact Us</a></div>
                <div><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></div>
                <div><a href="#" className="hover:text-white transition-colors">Terms of Service</a></div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2024 DriveSync. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}