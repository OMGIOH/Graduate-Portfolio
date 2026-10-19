#!/usr/bin/env node
/*
 * 本地 Mock LLM 服务器 —— 无需任何真实 API key，验证聊天全链路。
 *
 *   node tools/mock-llm.js [端口]     # 默认 8824
 *
 * 行为：
 *   - 静态托管仓库根目录（等价 python3 -m http.server）
 *   - POST /v1/chat/completions → 以 OpenAI SSE 格式流式返回模拟回答
 *   - POST /v1/embeddings      → 返回 1024 维随机向量
 *
 * 测试：浏览器打开 http://localhost:8824/?chat=debug
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.argv[2]) || 8824;
const ROOT = path.resolve(__dirname, '..');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
};

function serveStatic(req, res) {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const file = path.join(ROOT, path.normalize(p));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('not found: ' + p); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}

function streamChat(req, res) {
  let raw = '';
  req.on('data', (c) => (raw += c));
  req.on('end', () => {
    let question = '';
    try {
      const body = JSON.parse(raw);
      const last = body.messages.filter((m) => m.role === 'user').pop() || { content: '' };
      question = (last.content.match(/【访客提问】([\s\S]*)$/) || [, last.content])[1].slice(0, 60);
    } catch (_) { /* 忽略 */ }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    });

    const reply =
      `（mock 流式回答）关于「${question}」：` +
      `这是本地模拟的流式输出，用于验证 检索→SSE→打字机渲染 全链路。` +
      `真实接入时这段文字会来自大模型。\n` +
      `要点一：检索上下文已随请求送达 mock 服务器。\n` +
      `要点二：前端逐块渲染正常。`;

    const chunks = reply.match(/[\s\S]{1,12}/g) || [];
    let i = 0;
    const timer = setInterval(() => {
      if (i < chunks.length) {
        const payload = JSON.stringify({ choices: [{ delta: { content: chunks[i] } }] });
        res.write(`data: ${payload}\n\n`);
        i++;
      } else {
        res.write('data: [DONE]\n\n');
        res.end();
        clearInterval(timer);
      }
    }, 60);
  });
}

function serveEmbeddings(req, res) {
  let raw = '';
  req.on('data', (c) => (raw += c));
  req.on('end', () => {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(JSON.stringify({
      data: [{ index: 0, embedding: Array.from({ length: 1024 }, () => Math.random()) }],
    }));
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'authorization, content-type',
    });
    return res.end();
  }
  if (req.method === 'POST' && req.url === '/v1/chat/completions') return streamChat(req, res);
  if (req.method === 'POST' && req.url === '/v1/embeddings') return serveEmbeddings(req, res);
  serveStatic(req, res);
});

server.listen(PORT, () => console.log(`mock LLM + 静态服务 → http://localhost:${PORT}/?chat=debug`));
