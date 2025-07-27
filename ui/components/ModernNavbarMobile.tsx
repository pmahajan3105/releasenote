"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./Button";

interface ModernNavbarMobileProps {
  className?: string;
}

export function ModernNavbarMobile({ className }: ModernNavbarMobileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login');
    setIsOpen(false);
  };

  const handleSignup = () => {
    router.push('/signup');
    setIsOpen(false);
  };

  const handleFeatures = () => {
    // router.push('/features'); // Uncomment when you have this page
    setIsOpen(false);
  };

  const handlePricing = () => {
    // router.push('/pricing'); // Uncomment when you have this page
    setIsOpen(false);
  };

  const handleDocs = () => {
    // router.push('/docs'); // Uncomment when you have this page
    setIsOpen(false);
  };

  return (
    <nav className={`flex w-full flex-col ${className || ''}`}>
      <div className="flex w-full items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <img className="h-8 w-8" src="/logo.svg" alt="ReleaseNoteAI" />
          <span className="font-['Inter'] text-[18px] font-[600] text-default-font">
            ReleaseNoteAI
          </span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-8 w-8 items-center justify-center"
        >
          <span className="text-[20px]">{isOpen ? '✕' : '☰'}</span>
        </button>
      </div>
      {isOpen && (
        <div className="flex flex-col gap-4 py-4 border-t border-neutral-200">
          <button 
            className="font-['Inter'] text-[14px] font-[500] text-subtext-color text-left hover:text-default-font transition-colors"
            onClick={handleFeatures}
          >
            Features
          </button>
          <button 
            className="font-['Inter'] text-[14px] font-[500] text-subtext-color text-left hover:text-default-font transition-colors"
            onClick={handlePricing}
          >
            Pricing
          </button>
          <button 
            className="font-['Inter'] text-[14px] font-[500] text-subtext-color text-left hover:text-default-font transition-colors"
            onClick={handleDocs}
          >
            Documentation
          </button>
          <div className="flex flex-col gap-2 pt-2">
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
      )}
    </nav>
  );
}