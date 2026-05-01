# [Copy Fail 曝光：Linux 本地提权漏洞可写入页缓存](https://github.com/myogg/gitblog/issues/35)

4 月 29 日，安全研究方公开 Copy Fail（CVE-2026-31431）。这是 Linux 内核 crypto AF_ALG/algif_aead 路径中的本地提权漏洞。kernel.org 给出的 CVSS 3.1 分数为 7.8，向量为 AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H；Ubuntu 将其列为 High，理由是“trivial local privilege escalation”。

![vintage-tech-01.jpg](https://i.829259.xyz/api/rfile/vintage-tech-01.jpg)

该漏洞不是远程漏洞。攻击者需要先拥有目标机器上的低权限本地账户，并能在本机执行代码；目标系统还需要可达或已加载 algif_aead 相关内核路径。漏洞核心在于 AF_ALG AEAD 的一次“原地处理”优化错误地把来自 splice() 的文件页缓存挂进可写 scatterlist，authencesn 解密路径随后可在认证失败前写入 4 个攻击者可控字节。

实际利用思路是：攻击者选择一个自己可读的文件，将其页缓存页通过 splice() 带入内核 crypto 路径，再触发 authencesn 的越界式 scratch write。每次请求可改写页缓存中的 4 个受控字节，反复执行后可临时篡改 setuid-root 程序的缓存内容，例如 su。随后系统从被污染的页缓存加载该程序，可能导致本地 root 权限获取。这里影响的是内存中的页缓存，并非直接改写磁盘文件，但在缓存被回收或刷新前已经足以造成提权风险。

上游信息显示，问题由 Linux 4.14 中的 commit 72548b093ee3 引入。修复版本包括 6.18.22、6.19.12 和 7.0，对应修复思路是让 algif_aead 回到 out-of-place 处理，避免把文件页缓存页放入可写目标 scatterlist。不同发行版的内核包版本号不一定等同于上游版本号，应以各发行版安全公告和补丁状态为准。

修复方式很直接：尽快安装发行版提供的内核安全更新，并重启进入新内核。Ubuntu、SUSE、Amazon Linux 等发行版已经建立对应 CVE 页面，但各自状态和严重性判断不完全一致，运维侧应按本机发行版渠道确认是否已有修复包。

临时缓解措施是在无法立即升级内核时禁用 algif_aead 模块，或通过 seccomp/容器策略阻断不必要的 AF_ALG socket 创建。研究方和 oss-security 讨论中给出的临时方向包括拉黑 algif_aead 并卸载已加载模块，但这可能影响依赖内核 AEAD 接口的业务，生产环境执行前应先验证兼容性。

