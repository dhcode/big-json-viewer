import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Parcel } from '@parcel/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workerFile = path.join(
  __dirname,
  '../src/worker/big-json-viewer.worker.ts',
);
const targetFile = path.join(
  __dirname,
  '../src/worker/big-json-viewer.worker.inline.ts',
);

async function bundleWorker(file) {
  const bundler = new Parcel({
    entries: file,
    defaultConfig: '@parcel/config-default',
    mode: 'production',
    defaultTargetOptions: {
      distDir: path.dirname(targetFile),
      sourceMap: false,
      minify: true,
      outputFormat: 'global',
      isLibrary: true,
    },
    shouldDisableCache: true,
    shouldContentHash: false,
  });

  const { bundleGraph } = await bundler.run();
  const bundles = bundleGraph.getBundles();
  if (!bundles.length) throw new Error('No bundle generated');
  const bundle = bundles[0];
  const content = JSON.stringify(
    fs.readFileSync(bundle.filePath, { encoding: 'utf8' }),
  );

  fs.writeFileSync(
    targetFile,
    `/* tslint:disable */\nexport function initWorker() {\n  const blob = new Blob([${content}], { type: 'text/javascript' });\n  const workerUrl = URL.createObjectURL(blob);\n  return new Worker(workerUrl);\n};\n`,
  );
}

bundleWorker(workerFile).catch((e) => {
  console.error(e);
  process.exit(1);
});
