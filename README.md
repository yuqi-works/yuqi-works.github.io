# YUQI WORKS — 个人摄影作品网站

## 这是什么
你的个人汽车摄影作品集网站（设计稿阶段，图片是占位图）。

## 怎么看效果
1. 打开文件夹：`E:\workflow\yuqi_site`
2. 双击 `index.html` 用浏览器打开即可（或者在浏览器输入 `http://localhost:8765` —— 我起的预览服务）
3. 右上角 EN / 中 可以切换语言

## 怎么换成你自己的照片（重要）
网站现在用的是占位色块。换真图步骤：

1. 在 `E:\workflow\yuqi_site` 里新建一个文件夹，叫 `photos`
2. 把你精选的照片（横构图最佳，推荐 4:3 或 16:9）复制进去，文件名改成英文，比如 `night-run.jpg`
3. 用记事本打开 `index.html`，找到这样的一整块（画廊第 1 张）：

```html
<div class="thumb scene-night"><span class="thumb-car">ZL1</span></div>
```

4. 把它替换成：

```html
<img class="thumb" src="photos/night-run.jpg" alt="Night Run Downtown">
```

5. 保存，刷新浏览器就看到了。9 张卡片每张都这么换。

## 想改文字/标题
- 英文文字直接搜 `index.html` 里的英文句子改
- 中文文字在文件最下面 `zh: { ... }` 那一大块里改
- 联系邮箱：搜 `mailto:` 改成你的真实邮箱

## 想上线（让全世界能访问）
设计稿确认后告诉我，我帮你部署到 GitHub Pages（免费、永久）。需要你先注册一个 GitHub 账号（github.com，免费，5 分钟）。

## 注意事项
- 不要改 `index.html` 的 `<style>` 部分，除非你想动设计
- 照片建议挑 9-12 张最有代表性的，宁缺毋滥
- 部署前记得把邮件和社交链接换成真实的
