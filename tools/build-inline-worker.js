const fs = require('fs');
const path = require('path');
const Bundler = require('parcel-bundler');

const workerFile = path.join(
  __dirname,
  '../src/worker/big-json-viewer.worker.ts'
);
const targetFile = path.join(
  __dirname,
  '../src/worker/big-json-viewer.worker.inline.ts'
);

async function bundleWorker(file) {
  const options = {
    watch: false,
    minify: true,
    cache: false,
    sourceMaps: false
  };

  const bundler = new Bundler(file, options);

  const bundle = await bundler.bundle();
  const content = JSON.stringify(
    fs.readFileSync(bundle.name, { encoding: 'utf8' })
  );

  fs.writeFileSync(
    targetFile,
    `/* tslint:disable */
export function initWorker() { 
  const blob = new Blob([${content}], { type: 'text/javascript' });
  const workerUrl = URL.createObjectURL(blob);
  return new Worker(workerUrl);
};
`
  );
}

bundleWorker(workerFile).catch(e => {
  throw e;
});
