'use client';

import { Rocket, Lightbulb, Map, Server, Megaphone, Users, Wrench, BarChart3, Check, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export default function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 3000);
    setEmail('');
  };

  const features = [
    {
      icon: Lightbulb,
      title: 'Ideation',
      description: 'Capture, validate, and promote ideas to projects with AI-assisted scoring'
    },
    {
      icon: Map,
      title: 'Product & Planning',
      description: 'Transform chaos into clear roadmaps with automated feature tracking'
    },
    {
      icon: Server,
      title: 'DevOps-lite',
      description: 'Get deployment visibility without the complexity'
    },
    {
      icon: Megaphone,
      title: 'Marketing & Launch',
      description: 'Ship loud with reusable launch playbooks and campaign tracking'
    },
    {
      icon: Users,
      title: 'User & Revenue',
      description: 'Understand your users and revenue like a human, not a spreadsheet'
    },
    {
      icon: Wrench,
      title: 'Ops & Support',
      description: 'Fewer fires, faster fixes with auto-linked error tracking'
    }
  ];

  const benefits = [
    'Replace 5+ tools with one unified platform',
    'Built specifically for indie developers',
    'No bloat, just what you need',
    'Beautiful, intuitive interface',
    'Dark mode support',
    'Focus on building, not tooling'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 transition-colors">
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Rocket className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span className="text-2xl font-bold text-slate-900 dark:text-white">SoloOS</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Sun className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                ) : (
                  <Moon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                )}
              </button>
              <button
                onClick={onLogin}
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
              >
                Log In
              </button>
              <button
                onClick={onGetStarted}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-600/30"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              One App to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400">
                Rule Them All
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
              The all-in-one platform for indie developers. Replace your 5+ app stack with one beautiful, powerful workspace.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg rounded-lg font-medium transition-all shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-600/40 hover:-translate-y-0.5"
              >
                Start Building Today
              </button>
              <button className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-lg rounded-lg font-medium border-2 border-slate-200 dark:border-slate-700 hover:border-blue-600 dark:hover:border-blue-400 transition-all">
                Watch Demo
              </button>
            </div>
            <div className="mt-12 flex justify-center">
              <div className="inline-flex items-center px-6 py-3 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700">
                <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                <span className="text-slate-700 dark:text-slate-300">
                  <span className="font-bold text-slate-900 dark:text-white">500+</span> indie devs building smarter
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900 transition-colors">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Everything You Need, Nothing You Don&apos;t
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400">
                Six powerful modules designed for solo builders and small teams
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl hover:shadow-xl transition-all hover:-translate-y-1 border border-slate-200 dark:border-slate-700"
                  >
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 dark:from-blue-700 dark:to-cyan-700 rounded-2xl p-12 shadow-2xl">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-6">
                    Why Indie Devs Love SoloOS
                  </h2>
                  <ul className="space-y-4">
                    {benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-6 w-6 text-cyan-200 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-white text-lg">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
                  <div className="text-center mb-6">
                    <div className="text-5xl font-bold text-white mb-2">$0</div>
                    <div className="text-cyan-200 text-lg">Free during beta</div>
                  </div>
                  <button
                    onClick={onGetStarted}
                    className="w-full py-4 bg-white hover:bg-slate-100 text-blue-600 rounded-lg font-bold text-lg transition-colors shadow-xl"
                  >
                    Get Early Access
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900 transition-colors">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Stay in the Loop
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
              Get updates on new features, tips for indie devs, and exclusive beta access
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-6 py-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-600 dark:focus:border-blue-400 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg"
              >
                Subscribe
              </button>
            </form>
            {subscribed && (
              <p className="mt-4 text-green-600 dark:text-green-400 font-medium">
                Thanks for subscribing! Check your inbox.
              </p>
            )}
          </div>
        </section>

        <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <Rocket className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <span className="text-xl font-bold text-slate-900 dark:text-white">SoloOS</span>
              </div>
              <div className="text-slate-600 dark:text-slate-400">
                © 2026 SoloOS. Built for indie devs, by indie devs.
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
