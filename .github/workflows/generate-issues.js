const fs = require('fs');
const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

async function fetchIssues() {
  const issues = await octokit.issues.listForRepo({
    owner: 'myogg',
    repo: 'Gitblog',
  });

  const issuesContent = issues.data.map(issue => {
    return `## ${issue.title}\n\n${issue.body}\n\n---\n`;
  }).join('\n');

  fs.writeFileSync('issues.md', issuesContent);
}

fetchIssues().catch(err => console.error(err));
