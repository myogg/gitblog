from github import Github
import os

# 使用 GitHub Token 进行认证
g = Github(os.getenv('GITHUB_TOKEN'))
repo = g.get_repo("your-username/your-repo")

# 获取所有 Issues
issues = repo.get_issues(state="all")

# 生成 Markdown 文件
with open("docs/issues.md", "w") as f:
    for issue in issues:
        f.write(f"# {issue.title}\n\n")
        f.write(f"{issue.body}\n\n")
        f.write(f"**State:** {issue.state}\n\n")
        f.write("---\n\n")

# 如果需要，可以生成 HTML 文件
# 使用 Markdown 转换工具将 Markdown 转换为 HTML
