import React from 'react';

const UserFlowDiagram = () => {
  const Box = ({
    children,
    className = "",
    width = "w-48",
    height = "h-24"
  }: {
    children: React.ReactNode
    className?: string
    width?: string
    height?: string
  }) => (
    <div className={`${width} ${height} border-2 border-slate-300 rounded-lg flex items-center justify-center text-center p-2 text-sm font-medium bg-white ${className}`}>
      {children}
    </div>
  );

  const Arrow = ({
    direction = "right",
    className = ""
  }: {
    direction?: "right" | "down"
    className?: string
  }) => {
    const arrowClass = direction === "down" ? "rotate-90" : "";
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <svg className={`w-8 h-8 text-slate-400 ${arrowClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    );
  };

  const DecisionBox = ({
    children,
    className = ""
  }: {
    children: React.ReactNode
    className?: string
  }) => (
    <div className={`w-40 h-20 border-2 border-blue-300 rounded-lg bg-blue-50 flex items-center justify-center text-center p-2 text-sm font-medium transform rotate-45 ${className}`}>
      <div className="transform -rotate-45">{children}</div>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto p-8 bg-slate-50">
      <h1 className="text-3xl font-bold mb-8 text-center">ReleaseNoteAI User Flow</h1>
      
      {/* Authentication Flow */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-6 text-blue-600">1. Authentication & Onboarding Flow</h2>
        <div className="flex items-center space-x-4 flex-wrap">
          <Box className="bg-green-50 border-green-300">Landing Page<br/>Login/Signup</Box>
          <Arrow />
          <Box className="bg-green-50 border-green-300">Enter Email<br/>Send Magic Link</Box>
          <Arrow />
          <Box className="bg-green-50 border-green-300">Click Magic Link<br/>Email Verification</Box>
          <Arrow />
          <DecisionBox>New User?</DecisionBox>
          <Arrow />
          <Box className="bg-green-50 border-green-300">Create Organization<br/>Setup Profile</Box>
        </div>
        <div className="mt-4 ml-80">
          <Arrow direction="down" />
          <Box className="bg-blue-50 border-blue-300 mt-2">Dashboard<br/>Welcome Screen</Box>
        </div>
      </div>

      {/* Dashboard Flow */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-6 text-purple-600">2. Dashboard & Main Navigation</h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-4">
            <Box className="bg-purple-50 border-purple-300 w-full">Dashboard Home<br/>Onboarding Progress<br/>Metrics Cards</Box>
            <Arrow direction="down" />
            <Box className="bg-purple-50 border-purple-300 w-full">Recent Releases<br/>Continue Drafting<br/>Scheduled Notes</Box>
          </div>
          
          <div className="space-y-4">
            <Box className="bg-orange-50 border-orange-300 w-full">Release Notes<br/>• Create<br/>• Published<br/>• Draft<br/>• Scheduled</Box>
            <Arrow direction="down" />
            <Box className="bg-orange-50 border-orange-300 w-full">Quick Actions<br/>Create New Release<br/>Setup Integration</Box>
          </div>
          
          <div className="space-y-4">
            <Box className="bg-gray-50 border-gray-300 w-full">Settings<br/>• Setup<br/>• AI Context<br/>• Templates<br/>• Team</Box>
            <Arrow direction="down" />
            <Box className="bg-gray-50 border-gray-300 w-full">Support & Help<br/>Documentation<br/>Contact</Box>
          </div>
        </div>
      </div>

      {/* Release Creation Flow */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-6 text-red-600">3. Release Note Creation Flow</h2>
        <div className="space-y-6">
          {/* Creation Options */}
          <div className="flex items-center space-x-4">
            <Box className="bg-red-50 border-red-300">Click "Create Release"</Box>
            <Arrow />
            <Box className="bg-red-50 border-red-300 w-56">Choose Creation Method:<br/>• Reno AI Copilot<br/>• Connect Integration<br/>• Manual Editor</Box>
          </div>
          
          {/* Reno AI Flow */}
          <div className="ml-8 space-y-4">
            <h3 className="font-medium text-red-500">Reno AI Copilot Path:</h3>
            <div className="flex items-center space-x-4">
              <Box className="bg-red-100 border-red-400">Paste Draft Text<br/>AI Enhancement</Box>
              <Arrow />
              <Box className="bg-red-100 border-red-400">Reno Suggestions<br/>Apply/Dismiss</Box>
              <Arrow />
              <Box className="bg-red-100 border-red-400">Rich Text Editor<br/>Final Editing</Box>
              <Arrow />
              <Box className="bg-red-100 border-red-400">Preview & Publish</Box>
            </div>
          </div>
          
          {/* Integration Flow */}
          <div className="ml-8 space-y-4">
            <h3 className="font-medium text-red-500">Integration Path:</h3>
            <div className="flex items-center space-x-4">
              <Box className="bg-red-100 border-red-400">Select Integration<br/>(Linear/Jira/GitHub)</Box>
              <Arrow />
              <Box className="bg-red-100 border-red-400">Filter Tickets<br/>Date Range & Labels</Box>
              <Arrow />
              <Box className="bg-red-100 border-red-400">AI Generation<br/>From Ticket Data</Box>
              <Arrow />
              <Box className="bg-red-100 border-red-400">Edit & Publish</Box>
            </div>
          </div>
          
          {/* Publishing Options */}
          <div className="ml-8 space-y-4">
            <h3 className="font-medium text-red-500">Publishing Options:</h3>
            <div className="flex items-center space-x-4">
              <Box className="bg-red-100 border-red-400">Final Review<br/>Add Featured Image</Box>
              <Arrow />
              <DecisionBox>Publish Now?</DecisionBox>
              <div className="flex flex-col space-y-2">
                <Box className="bg-green-100 border-green-400 w-32 h-16">Publish<br/>Immediately</Box>
                <Box className="bg-yellow-100 border-yellow-400 w-32 h-16">Schedule<br/>For Later</Box>
                <Box className="bg-gray-100 border-gray-400 w-32 h-16">Save as<br/>Draft</Box>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Setup Flow */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-6 text-teal-600">4. Integration Setup Flow</h2>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Box className="bg-teal-50 border-teal-300">Settings → Setup<br/>Integration Page</Box>
            <Arrow />
            <Box className="bg-teal-50 border-teal-300 w-56">Select Service:<br/>• Linear (Primary)<br/>• Jira (Secondary)<br/>• GitHub (Tertiary)</Box>
          </div>
          
          <div className="ml-8 space-y-4">
            <div className="flex items-center space-x-4">
              <Box className="bg-teal-100 border-teal-400">OAuth Connection<br/>Authorize Service</Box>
              <Arrow />
              <Box className="bg-teal-100 border-teal-400">Select Projects<br/>Teams/Repositories</Box>
              <Arrow />
              <Box className="bg-teal-100 border-teal-400">Configure Filters<br/>Status, Labels, Dates</Box>
              <Arrow />
              <Box className="bg-teal-100 border-teal-400">Test Connection<br/>Save Configuration</Box>
            </div>
          </div>
          
          <div className="ml-8">
            <Box className="bg-green-100 border-green-400 w-56">Integration Active<br/>Ready for Use<br/>Health Status: ✓</Box>
          </div>
        </div>
      </div>

      {/* AI Customization Flow */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-6 text-indigo-600">5. AI Customization Flow</h2>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Box className="bg-indigo-50 border-indigo-300">Settings → AI Context</Box>
            <Arrow />
            <Box className="bg-indigo-50 border-indigo-300 w-64">AI Configuration Form:<br/>• Company Description<br/>• Target Audience<br/>• Brand Voice Tones<br/>• Preferred/Avoid Terms</Box>
          </div>
          
          <div className="ml-8 space-y-4">
            <div className="flex items-center space-x-4">
              <Box className="bg-indigo-100 border-indigo-400">Fill Form Fields<br/>Select Tones</Box>
              <Arrow />
              <Box className="bg-indigo-100 border-indigo-400">Generate Sample<br/>Preview AI Voice</Box>
              <Arrow />
              <Box className="bg-indigo-100 border-indigo-400">Review Sample<br/>Adjust Settings</Box>
              <Arrow />
              <Box className="bg-indigo-100 border-indigo-400">Save Configuration<br/>Apply to All Releases</Box>
            </div>
          </div>
        </div>
      </div>

      {/* Template Management Flow */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-6 text-pink-600">6. Template Management Flow</h2>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Box className="bg-pink-50 border-pink-300">Settings → Templates</Box>
            <Arrow />
            <Box className="bg-pink-50 border-pink-300 w-64">Template Management:<br/>• Pre-made Templates (4)<br/>• Custom Templates (0-5)<br/>• Upload New</Box>
          </div>
          
          {/* Pre-made Templates */}
          <div className="ml-8 space-y-4">
            <h3 className="font-medium text-pink-500">Pre-made Templates:</h3>
            <div className="flex items-center space-x-4">
              <Box className="bg-pink-100 border-pink-400 w-40">Modern<br/>Traditional<br/>Changelog<br/>Minimal</Box>
              <Arrow />
              <Box className="bg-pink-100 border-pink-400">Preview Template<br/>Select for Use</Box>
              <Arrow />
              <Box className="bg-pink-100 border-pink-400">Apply to Release<br/>Ready to Edit</Box>
            </div>
          </div>
          
          {/* Custom Templates */}
          <div className="ml-8 space-y-4">
            <h3 className="font-medium text-pink-500">Custom Templates:</h3>
            <div className="flex items-center space-x-4">
              <Box className="bg-pink-100 border-pink-400">Upload PDF<br/>(Max 500KB)</Box>
              <Arrow />
              <Box className="bg-pink-100 border-pink-400">Validate File<br/>Name Template</Box>
              <Arrow />
              <Box className="bg-pink-100 border-pink-400">Template List<br/>Preview/Edit/Delete</Box>
              <Arrow />
              <Box className="bg-pink-100 border-pink-400">Counter: X/5<br/>Ready for Use</Box>
            </div>
          </div>
        </div>
      </div>

      {/* Public Publishing Flow */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-6 text-yellow-600">7. Public Publishing & Customization Flow</h2>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Box className="bg-yellow-50 border-yellow-300">Published Release</Box>
            <Arrow />
            <Box className="bg-yellow-50 border-yellow-300 w-64">Auto-Generate Public URL<br/>/notes/[org]/[slug]<br/>SEO Optimized</Box>
            <Arrow />
            <Box className="bg-yellow-50 border-yellow-300">Public Page Live<br/>Social Sharing<br/>Mobile Responsive</Box>
          </div>
          
          {/* Customization */}
          <div className="ml-8 space-y-4">
            <h3 className="font-medium text-yellow-600">Customization Options:</h3>
            <div className="flex items-center space-x-4">
              <Box className="bg-yellow-100 border-yellow-400">Settings → Appearance</Box>
              <Arrow />
              <Box className="bg-yellow-100 border-yellow-400 w-64">Brand Customization:<br/>• Colors & Fonts<br/>• Logo Upload<br/>• Custom CSS/JS<br/>• Domain Settings</Box>
              <Arrow />
              <Box className="bg-yellow-100 border-yellow-400">Apply Changes<br/>Preview Public Page</Box>
            </div>
          </div>
          
          {/* Custom Domain */}
          <div className="ml-8 space-y-4">
            <h3 className="font-medium text-yellow-600">Custom Domain Setup:</h3>
            <div className="flex items-center space-x-4">
              <Box className="bg-yellow-100 border-yellow-400">Enter Custom Domain<br/>releases.company.com</Box>
              <Arrow />
              <Box className="bg-yellow-100 border-yellow-400">DNS Verification<br/>Setup Instructions</Box>
              <Arrow />
              <Box className="bg-yellow-100 border-yellow-400">SSL Certificate<br/>Domain Active</Box>
            </div>
          </div>
        </div>
      </div>

      {/* Settings & Team Management Flow */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-6 text-gray-600">8. Settings & Team Management Flow</h2>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Box className="bg-gray-50 border-gray-300">Settings Menu</Box>
            <Arrow />
            <Box className="bg-gray-50 border-gray-300 w-64">Settings Categories:<br/>• General<br/>• Appearance<br/>• SEO<br/>• AI Context<br/>• Templates<br/>• Team<br/>• Billing</Box>
          </div>
          
          {/* Team Management */}
          <div className="ml-8 space-y-4">
            <h3 className="font-medium text-gray-600">Team Management:</h3>
            <div className="flex items-center space-x-4">
              <Box className="bg-gray-100 border-gray-400">Team Settings</Box>
              <Arrow />
              <Box className="bg-gray-100 border-gray-400 w-64">Member Management:<br/>• Current Members<br/>• Invite New<br/>• Assign Roles<br/>• Permissions</Box>
              <Arrow />
              <Box className="bg-gray-100 border-gray-400">Send Invitations<br/>Role Assignment</Box>
            </div>
          </div>
          
          {/* Roles & Permissions */}
          <div className="ml-8 space-y-4">
            <h3 className="font-medium text-gray-600">Role System:</h3>
            <div className="grid grid-cols-4 gap-4">
              <Box className="bg-red-100 border-red-400 w-32 h-20">Owner<br/>Full Access</Box>
              <Box className="bg-orange-100 border-orange-400 w-32 h-20">Admin<br/>No Billing</Box>
              <Box className="bg-blue-100 border-blue-400 w-32 h-20">Editor<br/>Content Only</Box>
              <Box className="bg-green-100 border-green-400 w-32 h-20">Viewer<br/>Read Only</Box>
            </div>
          </div>
        </div>
      </div>

      {/* Complete User Journey */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-6 text-black">Complete User Journey (End-to-End)</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-xs">
            <Box className="bg-green-50 border-green-300 w-24 h-16">Signup</Box>
            <Arrow />
            <Box className="bg-purple-50 border-purple-300 w-24 h-16">Dashboard</Box>
            <Arrow />
            <Box className="bg-teal-50 border-teal-300 w-24 h-16">Setup Integration</Box>
            <Arrow />
            <Box className="bg-indigo-50 border-indigo-300 w-24 h-16">AI Config</Box>
            <Arrow />
            <Box className="bg-pink-50 border-pink-300 w-24 h-16">Templates</Box>
            <Arrow />
            <Box className="bg-red-50 border-red-300 w-24 h-16">Create Release</Box>
            <Arrow />
            <Box className="bg-yellow-50 border-yellow-300 w-24 h-16">Publish</Box>
            <Arrow />
            <Box className="bg-gray-50 border-gray-300 w-24 h-16">Public Page</Box>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserFlowDiagram;
