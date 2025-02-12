
import os
from github import Github

def get_issues(repo):
    issues = repo.get_issues(state='open')
    return issues

def write_issues_to_md(issues, md_file):
    os.makedirs(os.path.dirname(md_file), exist_ok=True)
    with open(md_file, 'w', encoding='utf-8') as f:
        for issue in issues:
            f.write(f"## {issue.title}\n")
            f.write(issue.body or "")
            f.write("\n\n")

def main():
    token = os.getenv('GITHUB_TOKEN')
    g = Github(token)
    repo = g.get_repo('myogg/Gitblog')
    issues = get_issues(repo)
    write_issues_to_md(issues, 'public/index.md')

if __name__ == "__main__":
    main()
