#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
YUQI WORKS 站点自检 — 提交/发布前跑一遍:
    python scripts/verify_site.py

检查三项:
  1. 主页所有本地资源引用 (图片/视频/favicon) 文件真实存在 — 防破图
  2. HTML 标签配对 + meta description 唯一
  3. 内部工具页 noindex 就位 (防被搜索引擎收录)
退出码: 0=全过, 1=有失败
"""
import os
import re
import sys
from html.parser import HTMLParser

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

checks = []
def check(name, ok, detail=""):
    checks.append((name, bool(ok), detail))

# ---------- 1. 本地资源引用完整性 ----------
idx = open(os.path.join(BASE, "index.html"), encoding="utf-8").read()
idx_clean = re.sub(r"<!--.*?-->", "", idx, flags=re.S)  # 剥掉注释, 注释里的示例不算引用
refs = set(re.findall(r'(?:src|href)="([^"]+)"', idx_clean))
missing = []
for r in refs:
    if r.startswith(("http://", "https://", "//", "mailto:", "tel:", "#", "data:")):
        continue  # 外部/锚点/数据引用跳过
    p = os.path.join(BASE, r.lstrip("/"))  # 根路径 /favicon.svg -> BASE/favicon.svg
    if not os.path.exists(p):
        missing.append(r)
check("1. 主页本地资源全部存在", not missing, f"缺失: {missing}")

# ---------- 2. 标签配对 + description 唯一 ----------
class TagChecker(HTMLParser):
    VOID = {"meta","link","img","br","hr","input","source","area","base","col","embed","track","wbr"}
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []; self.errors = []
    def handle_starttag(self, tag, attrs):
        if tag not in self.VOID:
            self.stack.append(tag)
    def handle_endtag(self, tag):
        if tag in self.VOID:
            return
        if self.stack and self.stack[-1] == tag:
            self.stack.pop()
        else:
            self.errors.append(f"stray/mismatched </{tag}> (stack tail: {self.stack[-3:]})")

for f in ["index.html", "404.html"]:
    p = TagChecker()
    p.feed(open(os.path.join(BASE, f), encoding="utf-8").read())
    leftover = [t for t in p.stack if t != "html"]
    check(f"2. {f} 标签配对", not p.errors and not leftover,
          f"errors={p.errors[:3]} unclosed={leftover[:5]}")
descs = re.findall(r'<meta name="description" content="[^"]*"', idx)
check("2. index.html description 唯一", len(descs) == 1, f"共 {len(descs)} 个")

# ---------- 3. 内部工具页 noindex ----------
for f in ["select.html", "models.html", "models_re.html", "models_street.html", "index-v1-bold.html"]:
    if not os.path.exists(os.path.join(BASE, f)):
        continue  # 本地工具页可能不存在, 存在才查
    c = open(os.path.join(BASE, f), encoding="utf-8").read()
    check(f"3. {f} 有 noindex", 'name="robots" content="noindex, nofollow"' in c)

# ---------- 汇总 ----------
failed = [c for c in checks if not c[1]]
for name, ok, detail in checks:
    print(f"  [{'OK' if ok else 'X'}] {name}" + (f"  -- {detail}" if not ok and detail else ""))
print(f"\n{'PASS' if not failed else 'FAIL'}  {len(checks)-len(failed)}/{len(checks)} 项通过")
sys.exit(1 if failed else 0)
