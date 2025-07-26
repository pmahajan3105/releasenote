"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "./Button";

interface ModernNavbarProps {
  className?: string;
}

export function ModernNavbar({ className }: ModernNavbarProps) {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login');
  };

  const handleSignup = () => {
    router.push('/signup');
  };

  const handleFeatures = () => {
    // router.push('/features'); // Uncomment when you have this page
  };

  const handlePricing = () => {
    // router.push('/pricing'); // Uncomment when you have this page
  };

  const handleDocs = () => {
    // router.push('/docs'); // Uncomment when you have this page
  };

  return (
    <nav className={`flex w-full max-w-[1024px] items-center justify-between py-4 ${className || ''}`}>
      <div className="flex items-center gap-2">
        <img 
          className="h-8 w-8" 
          src="/logo.svg" 
          alt="ReleaseNoteAI" 
        />
        <span className="font-['Inter'] text-[18px] font-[600] text-default-font">
          ReleaseNoteAI
        </span>
      </div>
      <div className="flex items-center gap-8">
        <button 
          className="font-['Inter'] text-[14px] font-[500] text-subtext-color cursor-pointer hover:text-default-font transition-colors"
          onClick={handleFeatures}
        >
          Features
        </button>
        <button 
          className="font-['Inter'] text-[14px] font-[500] text-subtext-color cursor-pointer hover:text-default-font transition-colors"
          onClick={handlePricing}
        >
          Pricing
        </button>
        <button 
          className="font-['Inter'] text-[14px] font-[500] text-subtext-color cursor-pointer hover:text-default-font transition-colors"
          onClick={handleDocs}
        >
          Documentation
        </button>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="medium"
            onClick={handleLogin}
          >
            Login
          </Button>
          <Button 
            variant="primary" 
            size="medium"
            onClick={handleSignup}
          >
            Sign Up
          </Button>
        </div>
      </div>
    </nav>
  );
}
