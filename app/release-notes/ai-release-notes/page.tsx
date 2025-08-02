"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { FeatherGitBranch } from "@subframe/core";
import { FeatherGithub } from "@subframe/core";
import { FeatherTrello } from "@subframe/core";
import { Badge } from "@/components/ui/components/Badge";
import { TextField } from "@/components/ui/components/TextField";
import { Button } from "@/ui/components/Button";
import { Checkbox } from "@/ui/components/Checkbox";
import { FeatherRefreshCw } from "@subframe/core";
import { TextArea } from "@/components/ui/components/TextArea";

interface Repository {
  id: string;
  name: string;
  description: string;
  owner: string;
}

interface Commit {
  id: string;
  message: string;
  description: string;
  hash: string;
  type: string;
}

function AiReleaseNotes() {
  const router = useRouter();
  const pathname = usePathname();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepository, setSelectedRepository] = useState<Repository | null>(null);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [selectedCommits, setSelectedCommits] = useState<string[]>([]);
  const [githubConnected, setGithubConnected] = useState(true);
  const [githubUsername, setGithubUsername] = useState("johndoe");
  
  useEffect(() => {
    // Fetch repositories from GitHub API
    const fetchRepositories = async () => {
      try {
        // Mock data - replace with actual API call
        const mockRepos: Repository[] = [
          { id: "1", name: "awesome-project", description: "An awesome web application", owner: "johndoe" },
          { id: "2", name: "mobile-app", description: "React Native mobile app", owner: "johndoe" },
          { id: "3", name: "api-service", description: "Backend API service", owner: "johndoe" },
          { id: "4", name: "frontend-ui", description: "Frontend UI components", owner: "johndoe" },
        ];
        setRepositories(mockRepos);
      } catch (error) {
        console.error("Failed to fetch repositories:", error);
      }
    };

    if (githubConnected) {
      fetchRepositories();
    }
  }, [githubConnected]);

  const handleRepositorySelect = (repo: Repository) => {
    setSelectedRepository(repo);
    setCommits([]); // Clear previous commits
    setSelectedCommits([]); // Clear selected commits
  };

  const handleContinueReview = async () => {
    if (!selectedRepository) {
      alert("Please select a repository first.");
      return;
    }

    try {
      // Mock data - replace with actual API call to fetch commits
      const mockCommits: Commit[] = [
        {
          id: "1",
          message: "feat: Add user authentication system",
          description: "Implements OAuth2 flow and session management",
          hash: "a1b2c3d",
          type: "Feature"
        },
        {
          id: "2",
          message: "fix: Resolve login redirect issue",
          description: "Updates callback handling for OAuth flow",
          hash: "e4f5g6h",
          type: "Bug Fix"
        },
        {
          id: "3",
          message: "docs: Update README with new setup instructions",
          description: "Added detailed installation and configuration steps",
          hash: "i7j8k9l",
          type: "Documentation"
        },
        {
          id: "4",
          message: "refactor: Optimize database queries",
          description: "Improved performance for user data retrieval",
          hash: "m1n2o3p",
          type: "Refactor"
        }
      ];
      setCommits(mockCommits);
    } catch (error) {
      console.error("Failed to fetch commits:", error);
    }
  };

  const handleCommitSelect = (commitId: string) => {
    setSelectedCommits(prev => 
      prev.includes(commitId) 
        ? prev.filter(id => id !== commitId)
        : [...prev, commitId]
    );
  };
  
  const handleTabChange = (index: number) => {
    if (index === 1) { // Jira tab
      router.push('/release-notes/jira-story-hub');
    }
    // For GitHub tab (index 0), we're already on the correct page
  };

  return (
    <DefaultPageLayout>
      <div className="container max-w-none flex h-full w-full flex-col items-start">
        <div className="flex w-full flex-col items-start gap-6 border-b border-solid border-neutral-border px-8 py-6">
          <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2">
            <div className="flex items-center gap-3">
              <FeatherGitBranch className="text-heading-1 font-heading-1 text-brand-600" />
              <span className="text-heading-1 font-heading-1 text-brand-600">
                Generate Release Notes
              </span>
            </div>
            <span className="text-heading-3 font-heading-3 text-neutral-500">
              Transform your code changes into professional release notes
            </span>
          </div>
          <div className="flex w-full flex-col items-start gap-4">
            <span className="text-body-bold font-body-bold text-default-font">
              Choose Integration Source
            </span>
            <div className="flex border-b border-neutral-border h-auto w-full max-w-[448px] flex-none">
              <button
                onClick={() => handleTabChange(0)}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors cursor-pointer ${
                  pathname.includes('ai-release-notes')
                    ? "border-brand text-brand"
                    : "border-transparent text-neutral-600 hover:text-brand hover:border-brand"
                }`}
              >
                GitHub
              </button>
              <button
                onClick={() => handleTabChange(1)}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors cursor-pointer ${
                  pathname.includes('jira-story-hub')
                    ? "border-brand text-brand"
                    : "border-transparent text-neutral-600 hover:text-brand hover:border-brand"
                }`}
              >
                Jira
              </button>
            </div>
          </div>
        </div>
        <div className="container max-w-none flex w-full grow shrink-0 basis-0 flex-col items-start gap-8 bg-default-background py-12 overflow-auto">
          <div className="flex w-full max-w-[1024px] flex-col items-start gap-8">
            <div className="flex w-full flex-col items-start gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-8 py-8">
              <div className="flex w-full items-center justify-between">
                <span className="text-heading-2 font-heading-2 text-default-font">
                  1. Select Repository
                </span>
                <Badge 
                  variant={githubConnected ? "success" : "error"} 
                  icon={<FeatherGithub />}
                >
                  {githubConnected ? `Connected as ${githubUsername}` : "Not Connected"}
                </Badge>
              </div>
              
              {githubConnected ? (
                <div className="flex w-full flex-col items-start gap-4">
                  <span className="text-body font-body text-subtext-color">
                    Select a repository to generate release notes
                  </span>
                  <div className="w-full max-h-48 overflow-y-auto border border-solid border-neutral-border rounded-md">
                    {repositories.slice(0, 2).map((repo, index) => (
                      <div
                        key={repo.id}
                        className={`flex items-center gap-4 p-4 cursor-pointer transition-colors hover:bg-neutral-50 ${
                          selectedRepository?.id === repo.id ? "bg-brand-50 border-l-4 border-l-brand" : ""
                        } ${index > 0 ? "border-t border-neutral-border" : ""}`}
                        onClick={() => handleRepositorySelect(repo)}
                      >
                        <input
                          type="radio"
                          name="repository"
                          checked={selectedRepository?.id === repo.id}
                          onChange={() => handleRepositorySelect(repo)}
                          className="text-brand focus:ring-brand"
                        />
                        <div className="flex-1">
                          <div className="text-body-bold font-body-bold text-default-font">
                            {repo.name}
                          </div>
                          <div className="text-body font-body text-subtext-color">
                            {repo.description}
                          </div>
                        </div>
                      </div>
                    ))}
                    {repositories.length > 2 && (
                      <div className="max-h-32 overflow-y-scroll">
                        {repositories.slice(2).map((repo, index) => (
                          <div
                            key={repo.id}
                            className={`flex items-center gap-4 p-4 cursor-pointer transition-colors hover:bg-neutral-50 border-t border-neutral-border ${
                              selectedRepository?.id === repo.id ? "bg-brand-50 border-l-4 border-l-brand" : ""
                            }`}
                            onClick={() => handleRepositorySelect(repo)}
                          >
                            <input
                              type="radio"
                              name="repository"
                              checked={selectedRepository?.id === repo.id}
                              onChange={() => handleRepositorySelect(repo)}
                              className="text-brand focus:ring-brand"
                            />
                            <div className="flex-1">
                              <div className="text-body-bold font-body-bold text-default-font">
                                {repo.name}
                              </div>
                              <div className="text-body font-body text-subtext-color">
                                {repo.description}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="text-body font-body text-subtext-color">
                    Please connect your GitHub account to select repositories
                  </span>
                </div>
              )}
              
              <Button
                onClick={handleContinueReview}
                disabled={!selectedRepository}
              >
                Continue to Review Changes
              </Button>
            </div>
            <div className="flex w-full flex-col items-start gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-8 py-8">
              <div className="flex w-full items-center justify-between">
                <span className="text-heading-2 font-heading-2 text-default-font">
                  2. Review Changes
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="neutral-secondary"
                    onClick={() => setSelectedCommits(commits.map(c => c.id))}
                    disabled={commits.length === 0}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="neutral-secondary"
                    onClick={() => setSelectedCommits([])}
                    disabled={commits.length === 0}
                  >
                    None
                  </Button>
                </div>
              </div>
              
              {commits.length > 0 ? (
                <div className="flex w-full flex-col items-start gap-4">
                  <span className="text-heading-3 font-heading-3 text-default-font">
                    Recent Commits
                  </span>
                  <div className="w-full max-h-64 overflow-y-auto border border-solid border-neutral-border rounded-md">
                    {commits.slice(0, 2).map((commit, index) => (
                      <div 
                        key={commit.id}
                        className={`flex w-full items-start gap-4 px-6 py-4 cursor-pointer transition-colors hover:bg-neutral-50 ${
                          selectedCommits.includes(commit.id) ? "bg-brand-50" : ""
                        } ${index > 0 ? "border-t border-neutral-border" : ""}`}
                        onClick={() => handleCommitSelect(commit.id)}
                      >
                        <Checkbox
                          label=""
                          checked={selectedCommits.includes(commit.id)}
                          onCheckedChange={() => handleCommitSelect(commit.id)}
                        />
                        <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
                          <span className="text-body-bold font-body-bold text-default-font">
                            {commit.message}
                          </span>
                          <span className="text-body font-body text-subtext-color">
                            {commit.description}
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge variant="neutral">{commit.hash}</Badge>
                            <Badge variant={commit.type === "Bug Fix" ? "error" : "success"}>
                              {commit.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                    {commits.length > 2 && (
                      <div className="max-h-32 overflow-y-scroll">
                        {commits.slice(2).map((commit, index) => (
                          <div 
                            key={commit.id}
                            className={`flex w-full items-start gap-4 px-6 py-4 cursor-pointer transition-colors hover:bg-neutral-50 border-t border-neutral-border ${
                              selectedCommits.includes(commit.id) ? "bg-brand-50" : ""
                            }`}
                            onClick={() => handleCommitSelect(commit.id)}
                          >
                            <Checkbox
                              label=""
                              checked={selectedCommits.includes(commit.id)}
                              onCheckedChange={() => handleCommitSelect(commit.id)}
                            />
                            <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
                              <span className="text-body-bold font-body-bold text-default-font">
                                {commit.message}
                              </span>
                              <span className="text-body font-body text-subtext-color">
                                {commit.description}
                              </span>
                              <div className="flex items-center gap-2">
                                <Badge variant="neutral">{commit.hash}</Badge>
                                <Badge variant={commit.type === "Bug Fix" ? "error" : "success"}>
                                  {commit.type}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="text-body font-body text-subtext-color">
                    {selectedRepository ? "No commits found for this repository" : "Select a repository to view commits"}
                  </span>
                </div>
              )}
              
              <Button
                onClick={() => {}}
                disabled={selectedCommits.length === 0}
              >
                Generate Release Notes
              </Button>
            </div>
            <div className="flex w-full flex-col items-start gap-6 rounded-md border border-solid border-neutral-border bg-default-background px-8 py-8">
              <div className="flex w-full items-center justify-between">
                <span className="text-heading-2 font-heading-2 text-default-font">
                  3. Preview &amp; Customize
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="neutral-secondary"
                    icon={<FeatherRefreshCw />}
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  >
                    Regenerate
                  </Button>
                  <Button
                    variant="neutral-secondary"
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  >
                    Choose Template
                  </Button>
                </div>
              </div>
              <div className="flex w-full flex-col items-start gap-4">
                <TextArea
                  className="h-auto w-full flex-none"
                  label="Release Notes Preview"
                  helpText="AI-generated release notes based on selected changes"
                >
                  <TextArea.Input
                    className="h-auto min-h-[240px] w-full flex-none font-monospace-body"
                    placeholder={
                      "# Release v2.1.0\n\n## 🚀 New Features\n- User authentication system with OAuth support\n- Enhanced security measures\n\n## 🐛 Bug Fixes\n- Fixed login redirect issue\n- Resolved session handling"
                    }
                    value=""
                    onChange={(
                      event: React.ChangeEvent<HTMLTextAreaElement>
                    ) => {}}
                  />
                </TextArea>
                <div className="flex w-full flex-wrap items-start gap-4">
                  <TextField
                    className="h-auto w-64 flex-none"
                    label="Tone"
                    helpText="Writing style"
                  >
                    <TextField.Input
                      placeholder="Professional"
                      value=""
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => {}}
                    />
                  </TextField>
                  <TextField
                    className="h-auto w-64 flex-none"
                    label="Audience"
                    helpText="Target readers"
                  >
                    <TextField.Input
                      placeholder="Developers"
                      value=""
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => {}}
                    />
                  </TextField>
                  <TextField
                    className="h-auto w-64 flex-none"
                    label="Format"
                    helpText="Output format"
                  >
                    <TextField.Input
                      placeholder="Markdown"
                      value=""
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => {}}
                    />
                  </TextField>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="neutral-secondary"
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                >
                  Save Draft
                </Button>
                <Button
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                >
                  Publish Release Notes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultPageLayout>
  );
}

export default AiReleaseNotes;
