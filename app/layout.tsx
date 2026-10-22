import './globals.css';
import React from 'react';
import Topbar from '../src/components/shell/Topbar';
import PodcastPlayer from '../src/components/PodcastPlayer';
import Script from "next/script";

export const metadata = {
  title: 'DCSPrep',
  description: 'Onboarding for Library & ICT Support — Dubbo Christian School'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <header>
            <Topbar />
          </header>

          <main className="flex-1 container py-8">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              <div className="md:col-span-1">
                {/* Sidebar area for desktop */}
                <div className="sticky top-6">
                  <div className="hidden md:block">
                    {/* lazy import-like static sidebar content to be replaced by component pages */}
                    <div className="bg-white p-3 rounded shadow-sm text-sm">
                      <div className="font-semibold">Navigation</div>
                      <div className="mt-2 text-xs text-slate-500">Use the page links to run the modules</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-5">
                {children}
              </div>
            </div>
          </main>

          <footer className="bg-white border-t py-4 mt-8">
            <div className="container text-sm text-slate-500">© {new Date().getFullYear()} Dubbo Christian School — DCSPrep</div>
          </footer>
        </div>
        <PodcastPlayer />
        <Script
          src="https://cloud.umami.is/script.js"
          strategy="afterInteractive"
          data-website-id="__UMAMI_WEBSITE_ID__"
          data-do-not-track="true"
          data-performance="true"
          data-domains="dcs-prep.vercel.app"
          data-tag="DCSPrep"
        />
      </body>
    </html>
  );
}
