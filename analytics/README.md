# 访问统计后端（待部署）
Cloudflare Workers + D1。仅存储访问时间和 IP，保留 30 天；统计读取需要 ADMIN_TOKEN。

1. 在 Cloudflare 创建 D1 数据库，执行 schema.sql。
2. 创建 Worker，部署 worker.js，绑定 D1 数据库为 DB。
3. 在 Worker 设置里添加 Secret ADMIN_TOKEN，使用随机强密码，不要写进网页或 Git。
4. 给 /visit 配置 Cloudflare 速率限制以减少滥用。Origin 限制不是防伪证明，计数也不是独立访客数。
5. 在 index.html 和 trip-todo.html 将 ANALYTICS_URL 设置为 Worker 的 HTTPS 地址（不含尾斜杠），同步 travel/index.html，提交推送。
6. 确认真实访问被记录，未授权 GET /stats 返回 401，授权后返回记录。

页面点击“页面版本”打开统计弹窗，管理密码只保存在当前页面内存里。此目录及弹窗完成不代表后端已上线。
