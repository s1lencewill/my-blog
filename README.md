# 个人博客使用说明书

## 目录

- [博客地址](#博客地址)
- [本地预览](#本地预览)
- [创建文章](#创建文章)
- [修改配置](#修改配置)
- [同步到GitHub](#同步到github)
- [常见问题](#常见问题)

---

## 博客地址

- **博客网站**: https://s1lencewill.github.io/my-blog/
- **GitHub仓库**: https://github.com/s1lencewill/my-blog
- **源码分支**: master
- **网页分支**: gh-pages

---

## 本地预览

在博客目录 `my-blog` 下运行：

```powershell
hexo server
```

然后浏览器访问 http://localhost:4000/my-blog/

按 `Ctrl + C` 停止本地服务器。

---

## 创建文章

### 方法一：使用Hexo命令创建

```powershell
hexo new "文章标题"
```

这会在 `source/_posts/` 目录下创建一个新的 Markdown 文件。

### 方法二：手动创建

1. 在 `source/_posts/` 文件夹中新建 `.md` 文件
2. 文件顶部添加 Front Matter（文章元信息）：

```yaml
---
title: 文章标题
date: 2026-03-03 12:00:00
tags: [标签1, 标签2]
categories: 分类名
---

正文内容...
```

### 文章模板示例

```yaml
---
title: 我的新文章
date: 2026-03-03 12:00:00
tags: [技术, 教程]
categories: 学习笔记
cover: /img/cover.jpg  # 可选：文章封面图
---

这是文章的正文内容，使用 Markdown 格式编写。

## 二级标题

- 列表项1
- 列表项2

### 代码示例

```python
print("Hello World")
```

### 添加图片

1. 把图片放到 `source/img/` 目录
2. 在文章中引用：

![图片描述](/img/图片名称.png)
```

### 支持的图片格式

将图片放入 `source/img/` 文件夹，支持以下格式：
- PNG
- JPG / JPEG
- GIF
- SVG
- WebP

---

## 修改配置

### 修改昵称、描述、Banner等

编辑 `_config.async.yml` 文件：

```yaml
# 用户信息
user:
  name: 你的昵称
  describe: 你的个人描述

# Banner文字
banner:
  index:
    banner_title: 首页主标题
    banner_text: 首页副标题
  about:
    banner_title: 关于页标题
    banner_text: 关于页描述

# 关于页面
about:
  title: 关于我
  introduction: 关于你的介绍...
  blog: <ul class="trm-list"><li>程序：Hexo</li><li>主题：hexo-theme-async</li></ul>
```

### 修改导航菜单

```yaml
top_bars:
  - title: 首页
    url: /
  - title: 归档
    url: /archives/
  - title: 标签
    url: /tags/
  - title: 分类
    url: /categories/
  - title: 关于
    url: /about/
```

### 添加社交链接

```yaml
sidebar:
  social:
    - name: GitHub
      icon: fab fa-github
      url: https://github.com/你的用户名
    - name: 知乎
      icon: fab fa-zhihu
      url: https://www.zhihu.com/你的知乎主页
```

---

## 同步到GitHub

### 完整部署命令

每次修改文章或配置后，运行以下命令部署：

```powershell
hexo clean; hexo generate; hexo deploy
```

命令说明：
- `hexo clean` - 清理缓存
- `hexo generate` - 生成静态网页
- `hexo deploy` - 部署到GitHub

### 同步源代码到GitHub

如果你想同时保存博客源码到GitHub：

```powershell
git add .
git commit -m "更新内容描述"
git push origin master
```

这会将你的文章和配置同步到GitHub仓库的master分支。

---

## 常见问题

### Q: 为什么修改后博客没有变化？

A: 请确保运行了完整的部署命令：
```powershell
hexo clean; hexo generate; hexo deploy
```

### Q: 图片不显示怎么办？

A: 检查图片路径是否正确：
1. 图片必须放在 `source/img/` 目录下
2. 路径要写成 `/img/图片名.png`（注意开头的斜杠）

### Q: 本地预览正常但部署后显示不正常？

A: 检查 `_config.yml` 中的 `url` 配置：

```yaml
url: https://s1lencewill.github.io/my-blog
root: /my-blog/
```

### Q: 如何修改头像？

A:
1. 准备一张头像图片（建议 200x200 像素）
2. 命名为 `avatar.jpg`
3. 放入 `source/img/` 目录
4. 修改 `_config.async.yml`：

```yaml
user:
  avatar: /img/avatar.jpg
```

### Q: 如何修改Banner背景图？

A:
1. 准备一张背景图片
2. 放入 `source/img/` 目录，命名为 `banner.png`
3. 或者修改 `_config.async.yml` 中的图片路径：

```yaml
banner:
  default:
    bgurl: /img/你的背景图.png
```

### Q: Windows PowerShell 运行命令报错？

A: PowerShell 不支持 `&&` 语法，请使用分号 `;`：

```powershell
# 错误写法
hexo clean && hexo generate && hexo deploy

# 正确写法
hexo clean; hexo generate; hexo deploy
```

### Q: 部署到GitHub失败怎么办？

A: 检查GitHub配置：
1. 确认 `_config.yml` 中的 deploy 配置正确
2. 确认SSH key已添加到GitHub账号

```yaml
deploy:
  type: git
  repo: git@github.com:s1lencewill/my-blog.git
  branch: gh-pages
```

### Q: 如何删除一篇文章？

A:
1. 删除 `source/_posts/` 目录下对应的 `.md` 文件
2. 运行部署命令

### Q: 如何添加数学公式支持？

A: hexo-theme-async 主题已内置 MathJax 支持，在文章中直接使用 LaTeX 语法即可。

---

## 目录结构

```
my-blog/
├── source/
│   ├── _posts/          # 文章存放目录
│   ├── about/           # 关于页面
│   └── img/             # 图片目录
├── themes/
│   └── async/           # 主题文件
├── _config.yml          # Hexo主配置
├── _config.async.yml    # 主题配置
├── package.json         # 依赖配置
└── scaffolds/           # 文章模板
```

---

## 常用命令速查

| 命令 | 说明 |
|------|------|
| `hexo new "标题"` | 创建新文章 |
| `hexo server` | 本地预览 |
| `hexo clean` | 清理缓存 |
| `hexo generate` | 生成静态文件 |
| `hexo deploy` | 部署到GitHub |
| `hexo clean; hexo generate; hexo deploy` | 完整部署流程 |
| `git add .` | 暂存所有更改 |
| `git commit -m "描述"` | 提交更改 |
| `git push origin master` | 推送到GitHub |

---

## 技术栈

- **博客框架**: Hexo 7.3.0
- **主题**: hexo-theme-async 2.2.7
- **渲染器**: hexo-renderer-less, hexo-renderer-ejs
- **部署**: GitHub Pages

---

如有问题，请提交 Issue 或联系博主。
