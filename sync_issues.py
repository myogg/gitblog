from github import Github
import os

# 使用 GitHub Token 进行认证
g = Github(os.getenv('GITHUB_TOKEN'))

# 获取仓库
repo = g.get_repo("myogg/Gitblog")

# 获取所有 Issues
issues = repo.get_issues(state="all")

# 生成 Markdown 文件
with open("docs/index.md", "w") as f:
    f.write("# Issues\n\n")
    for issue in issues:
        f.write(f"## [{issue.title}]({issue.html_url})\n\n")
        f.write(f"**State:** {issue.state}\n\n")
        f.write(f"**Created at:** {issue.created_at}\n\n")
        f.write(f"**Body:**\n\n{issue.body}\n\n")
        f.write("---\n\n")
