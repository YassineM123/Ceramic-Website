import { spawn } from 'node:child_process';

const services = [
  {
    name: 'frontend',
    args: ['run', 'dev:frontend'],
    port: 5173,
    expectedTitle: 'Le Monde Céramique | Céramique artisanale tunisienne',
  },
  {
    name: 'admin',
    args: ['run', 'dev:admin'],
    port: 5174,
    expectedTitle: 'Admin Console | Tableau de bord e-commerce',
  },
  { name: 'backend', args: ['run', 'dev:backend'] },
];

let shuttingDown = false;

function terminateChildren(children, signal = 'SIGTERM') {
  for (const child of children) {
    if (!child.killed) {
      child.kill(signal);
    }
  }
}

async function isExistingViteAppHealthy(port, expectedTitle) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2000);

  try {
    const response = await fetch(`http://localhost:${port}/`, {
      signal: controller.signal,
    });

    if (!response.ok) {
      return false;
    }

    const html = await response.text();
    return html.includes(expectedTitle);
  } catch (_error) {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

const children = services.map(({ name, args }) => {
  const command = process.platform === 'win32' ? 'cmd.exe' : 'npm';
  const commandArgs = process.platform === 'win32' ? ['/c', 'npm', ...args] : args;
  const stderrChunks = [];
  const child = spawn(command, commandArgs, {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
    env: process.env,
  });

  child.stdout?.on('data', (chunk) => {
    process.stdout.write(`[${name}] ${chunk}`);
  });

  child.stderr?.on('data', (chunk) => {
    stderrChunks.push(chunk.toString());
    process.stderr.write(`[${name}] ${chunk}`);
  });

  child.on('exit', async (code, signal) => {
    if (shuttingDown) {
      return;
    }

    const service = services.find((candidate) => candidate.name === name);
    const stderr = stderrChunks.join('');
    const isPortConflict =
      service?.port &&
      typeof service.expectedTitle === 'string' &&
      code === 1 &&
      stderr.includes(`Port ${service.port} is already in use`);

    if (isPortConflict && (await isExistingViteAppHealthy(service.port, service.expectedTitle))) {
      // Keep the orchestrator alive so the other dev servers can continue running.
       
      console.log(`[${name}] already running on http://localhost:${service.port}; reusing existing process.`);
      return;
    }

    shuttingDown = true;
    terminateChildren(children.filter((candidate) => candidate !== child));
    const exitCode = code ?? (signal ? 1 : 0);
    console.error(`[${name}] exited unexpectedly with code ${exitCode}`);
    process.exit(exitCode);
  });

  child.on('error', (error) => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    terminateChildren(children.filter((candidate) => candidate !== child));
    console.error(`[${name}] failed to start`, error);
    process.exit(1);
  });

  return child;
});

function shutdown(signal) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  terminateChildren(children, signal);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
