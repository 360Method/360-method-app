import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Github, GitBranch, GitPullRequest, FileCode, Play, Users } from 'lucide-react';

export default function GitHubDemo() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Example: List repos
  const listRepos = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('githubRepos', {
        action: 'list'
      });
      setResult(data);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  // Example: Create issue
  const createIssue = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('githubIssues', {
        action: 'create',
        owner: 'your-username',
        repo: 'your-repo',
        data: {
          title: 'Test issue from 360° Method',
          body: 'Created via GitHub integration',
          labels: ['bug']
        }
      });
      setResult(data);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  // Example: Trigger workflow
  const triggerWorkflow = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('githubActions', {
        action: 'trigger',
        owner: 'your-username',
        repo: 'your-repo',
        workflow_id: 'deploy.yml',
        ref: 'main',
        inputs: { environment: 'production' }
      });
      setResult(data);
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Github className="w-8 h-8" />
          <h1 className="text-3xl font-bold">GitHub Integration</h1>
        </div>
        <p className="text-gray-600">
          Complete GitHub API integration: repos, issues, PRs, actions, webhooks, and more.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        
        {/* Repositories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="w-5 h-5" />
              Repositories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={listRepos} disabled={loading} className="w-full">
              List My Repos
            </Button>
            <p className="text-xs text-gray-500">
              Also: create, update, get branches
            </p>
          </CardContent>
        </Card>

        {/* Issues & PRs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitPullRequest className="w-5 h-5" />
              Issues & PRs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={createIssue} disabled={loading} className="w-full">
              Create Test Issue
            </Button>
            <p className="text-xs text-gray-500">
              Also: list, update, close, create PRs
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              GitHub Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={triggerWorkflow} disabled={loading} className="w-full">
              Trigger Workflow
            </Button>
            <p className="text-xs text-gray-500">
              Also: list workflows, get runs, logs
            </p>
          </CardContent>
        </Card>

        {/* User/Org */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User & Org Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={async () => {
              setLoading(true);
              const { data } = await base44.functions.invoke('githubUser', { action: 'me' });
              setResult(data);
              setLoading(false);
            }} disabled={loading} className="w-full">
              Get My Profile
            </Button>
            <p className="text-xs text-gray-500">
              Also: orgs, members, org repos
            </p>
          </CardContent>
        </Card>

        {/* Files */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCode className="w-5 h-5" />
              File Operations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={async () => {
              setLoading(true);
              const { data } = await base44.functions.invoke('githubFiles', {
                action: 'get',
                owner: 'your-username',
                repo: 'your-repo',
                path: 'README.md'
              });
              setResult(data);
              setLoading(false);
            }} disabled={loading} className="w-full">
              Read README.md
            </Button>
            <p className="text-xs text-gray-500">
              Also: list, create, update, delete
            </p>
          </CardContent>
        </Card>

        {/* Webhooks */}
        <Card>
          <CardHeader>
            <CardTitle>Webhooks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-2">
              Webhook endpoint: <code className="bg-gray-100 px-2 py-1 rounded text-xs">/api/githubWebhook</code>
            </p>
            <p className="text-xs text-gray-500">
              Configure in GitHub repo settings to receive push, PR, issue events
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Result Display */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 p-4 rounded overflow-auto max-h-96 text-xs">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}