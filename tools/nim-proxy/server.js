/*
 * NVIDIA NIM 代理 —— 部署在阿里云函数计算（Web 函数，Node.js 18+）
 * ============================================================
 * 作用：浏览器 → 本函数 → integrate.api.nvidia.com，隐藏 NIM API key。
 *
 * 部署配置（阿里云 FC 控制台）：
 *   - 运行时：Node.js 18（或更高）
 *   - 启动命令：node server.js
 *   - 环境变量：
 *       NVIDIA_API_KEY   必填，nvapi- 开头的 NIM key
 *       NIM_CHAT_MODEL   建议填，如 qwen/qwen2.5-7b-instruct；
 *                        设置后前端请求里的 model 字段会被替换成它——
 *                        NVIDIA 下架模型时只改这里，前端永远不动
 *       ALLOW_ORIGIN     默认 https://omgioh.github.io
 *
 * 路由：POST /v1/chat/completions 和 /v1/embeddings 原样转发（含流式），
 *       其余返回 404。响应带 CORS 头，允许作品集站点跨域调用。
 */

const http = require('http');

const UPSTREAM = 'https://integrate.api.nvidia.com/v1';
const PORT = process.env.PORT || 9000;
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || 'https://omgioh.github.io';
const CHAT_MODEL = process.env.NIM_CHAT_MODEL || '';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': ALLOW_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function reply(res, status, headers, body) {
  res.writeHead(status, Object.assign({}, CORS_HEADERS, headers));
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    return reply(res, 204);
  }
  if (req.method !== 'POST' || !/^\/v1\/(chat\/completions|embeddings)$/.test(req.url)) {
    return reply(res, 404, { 'Content-Type': 'application/json' }, '{"error":"not found"}');
  }
  if (!process.env.NVIDIA_API_KEY) {
    return reply(res, 500, { 'Content-Type': 'application/json' }, '{"error":"NVIDIA_API_KEY not set"}');
  }

  try {
    const raw = await new Promise((resolve, reject) => {
      const chunks = [];
      req.on('data', (c) => chunks.push(c));
      req.on('end', () => resolve(Buffer.concat(chunks)));
      req.on('error', reject);
    });

    let body = raw;
    if (CHAT_MODEL && req.url === '/v1/chat/completions') {
      try {
        const parsed = JSON.parse(raw.toString('utf8'));
        parsed.model = CHAT_MODEL;
        body = Buffer.from(JSON.stringify(parsed), 'utf8');
      } catch (_) { /* 保持原 body */ }
    }

    const upstream = await fetch(UPSTREAM + req.url, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.NVIDIA_API_KEY,
        'Content-Type': 'application/json',
        'Accept': req.headers.accept || 'application/json',
      },
      body,
    });

    reply(res, upstream.status, {
      'Content-Type': upstream.headers.get('content-type') || 'application/json',
    });

    // 流式透传上游响应体（SSE）
    if (upstream.body) {
      const reader = upstream.body.getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(Buffer.from(value));
      }
    }
    res.end();
  } catch (err) {
    reply(res, 502, { 'Content-Type': 'application/json' }, JSON.stringify({ error: String(err) }));
  }
});

server.listen(PORT, () => console.log('NIM proxy listening on ' + PORT));
