#!/usr/bin/env python3
"""构建作品集 AI 客服的知识库。

读取 knowledge/*.md → 按 Markdown 小节分块 → 调 NVIDIA NIM 向量化
→ 生成站点根目录 knowledge.json（随 GitHub Pages 发布，浏览器端做余弦检索）。

用法：
    export NVIDIA_API_KEY=nvapi-xxx
    python3 tools/build_knowledge.py                # 向量化并生成 knowledge.json
    python3 tools/build_knowledge.py --dry-run      # 只看分块结果，不调 API
    python3 tools/build_knowledge.py --no-embed     # 生成无向量的 knowledge.json
                                                    # （前端退化为关键词检索，不需要任何 key）
"""

import base64
import json
import os
import pathlib
import struct
import sys
import time
import urllib.request

REPO = pathlib.Path(__file__).resolve().parent.parent
KNOWLEDGE_DIR = REPO / "knowledge"
OUTPUT = REPO / "knowledge.json"

API_URL = "https://integrate.api.nvidia.com/v1/embeddings"
EMBED_MODEL = "nvidia/nemotron-3-embed-1b"
MAX_CHARS = 400      # 单块目标长度（字符）
MIN_CHARS = 60       # 低于此长度的块并入下一块
BATCH = 16           # 每次请求的文本数


def chunk_markdown(path: pathlib.Path) -> list[dict]:
    """按 `# / ##` 小节切块，长小节再按段落打包到约 MAX_CHARS。"""
    title = path.stem.split("-", 1)[-1].replace("-", " ")
    lines = path.read_text(encoding="utf-8").splitlines()
    sections: list[tuple[str, list[str]]] = []  # (小节标题, 段落列表)
    heading = title
    for line in lines:
        if line.startswith("#"):
            heading = line.lstrip("#").strip() or title
            sections.append((heading, []))
        elif line.strip():
            if not sections:
                sections.append((heading, []))
            sections[-1][1].append(line.strip())
    sections = [(h, ps) for h, ps in sections if any(p for p in ps)]

    chunks = []
    for heading, paragraphs in sections:
        buf = ""
        for para in paragraphs:
            if buf and len(buf) + len(para) + 1 > MAX_CHARS:
                chunks.append((heading, buf))
                buf = para
            else:
                buf = f"{buf}\n{para}" if buf else para
        if buf:
            chunks.append((heading, buf))

    # 合并过短块，并为每块加上「文档 > 小节」上下文前缀
    merged = []
    for heading, text in chunks:
        if merged and len(text) < MIN_CHARS:
            prev_heading, prev_text = merged[-1]
            if prev_heading == heading and len(prev_text) + len(text) < MAX_CHARS:
                merged[-1] = (heading, prev_text + "\n" + text)
                continue
        merged.append((heading, text))
    return [
        {"source": path.name, "section": heading, "text": f"{title} > {heading}\n{text}"}
        for heading, text in merged
    ]


def embed(texts: list[str], api_key: str) -> list[list[float]]:
    body = json.dumps({"model": EMBED_MODEL, "input": texts}).encode()
    req = urllib.request.Request(
        API_URL,
        data=body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                data = json.loads(resp.read())
            vectors = sorted(data["data"], key=lambda item: item["index"])
            return [[round(v, 5) for v in item["embedding"]] for item in vectors]
        except Exception as exc:  # noqa: BLE001
            if attempt == 2:
                raise
            print(f"  向量化失败（{exc}），3 秒后重试…")
            time.sleep(3)
    return []


def pack(vectors: list[list[float]]) -> str:
    """向量压成 base64 的 float32 数组，比 JSON 浮点数组省 70%+ 体积。"""
    flat = struct.pack(f"<{len(vectors) * len(vectors[0])}f",
                       *[v for vec in vectors for v in vec])
    return base64.b64encode(flat).decode()


def main() -> None:
    args = sys.argv[1:]
    dry_run = "--dry-run" in args
    no_embed = "--no-embed" in args
    md_files = sorted(KNOWLEDGE_DIR.glob("*.md"))
    if not md_files:
        sys.exit(f"knowledge/ 下没有找到 .md 文件：{KNOWLEDGE_DIR}")

    chunks = []
    for path in md_files:
        file_chunks = chunk_markdown(path)
        print(f"{path.name}: {len(file_chunks)} 块")
        chunks.extend(file_chunks)
    print(f"共 {len(chunks)} 块，总字数 {sum(len(c['text']) for c in chunks)}")

    if dry_run:
        for i, chunk in enumerate(chunks):
            print(f"\n[{i}] {chunk['source']} | {chunk['section']}")
            print(chunk["text"][:120].replace("\n", " / "), "…")
        return

    if no_embed:
        OUTPUT.write_text(json.dumps({
            "model": None,
            "dim": 0,
            "packed": False,
            "count": len(chunks),
            "chunks": chunks,
        }, ensure_ascii=False), encoding="utf-8")
        print(f"完成（无向量，前端走关键词检索）→ {OUTPUT}（{OUTPUT.stat().st_size / 1024:.0f} KB）")
        return

    api_key = os.environ.get("NVIDIA_API_KEY", "").strip()
    if not api_key:
        sys.exit("请先 export NVIDIA_API_KEY=nvapi-xxx")

    vectors: list[list[float]] = []
    for start in range(0, len(chunks), BATCH):
        batch = [c["text"] for c in chunks[start:start + BATCH]]
        print(f"向量化 {start}~{start + len(batch) - 1} …")
        vectors.extend(embed(batch, api_key))

    dim = len(vectors[0])
    OUTPUT.write_text(json.dumps({
        "model": EMBED_MODEL,
        "dim": dim,
        "packed": True,
        "count": len(chunks),
        "chunks": [
            {**chunk, "embedding": pack([vec])}
            for chunk, vec in zip(chunks, vectors)
        ],
    }, ensure_ascii=False), encoding="utf-8")
    print(f"完成 → {OUTPUT}（{OUTPUT.stat().st_size / 1024:.0f} KB，{dim} 维）")


if __name__ == "__main__":
    main()
