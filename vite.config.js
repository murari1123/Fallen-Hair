import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// Local API development middleware for /api/* routes during npm run dev
const apiDevMiddleware = () => ({
  name: 'api-dev-middleware',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.url === '/api/jigs-chat' || req.url?.startsWith('/api/jigs-chat?')) {
        let rawBody = '';
        req.on('data', (chunk) => { rawBody += chunk; });
        req.on('end', async () => {
          try {
            req.body = rawBody ? JSON.parse(rawBody) : {};
          } catch {
            req.body = {};
          }
          res.status = (code) => {
            res.statusCode = code;
            return res;
          };
          res.json = (data) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          };
          try {
            const { default: handler } = await import(new URL('./api/jigs-chat.js', import.meta.url).href);
            await handler(req, res);
          } catch (err) {
            console.error('API middleware error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Internal server error', fallback: true }));
          }
        });
      } else {
        next();
      }
    });
  },
});

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Populate process.env for Node-based serverless development without client exposure
  const serverEnvKeys = [
    'GEMINI_API_KEY',
    'GEMINI_MODEL',
    'GROQ_API_KEY',
    'GROQ_MODEL',
    'AI_PROVIDER_MODE',
    'JIGS_SESSION_SECRET',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'JIGS_MAX_MESSAGE_LENGTH',
    'JIGS_RATE_LIMIT_REQUESTS',
    'JIGS_RATE_LIMIT_WINDOW',
  ];
  for (const key of serverEnvKeys) {
    if (env[key] && !process.env[key]) {
      process.env[key] = env[key];
    }
  }
  if (!process.env.SUPABASE_URL && env.VITE_SUPABASE_URL) {
    process.env.SUPABASE_URL = env.VITE_SUPABASE_URL;
  }

  return {
    plugins: [react(), apiDevMiddleware()],
    resolve: {
      alias: {
        '@': import.meta.dirname + '/src',
      },
      dedupe: ['react', 'react-dom', 'three'],
    },
    optimizeDeps: {
      include: ['three', '@react-three/fiber', '@react-three/drei'],
    },
    css: {
      modules: {
        localsConvention: 'camelCase',
      },
    },
  };
});

