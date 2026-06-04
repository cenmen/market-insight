const modules = import.meta.glob('./**.js', {
  eager: true,
  import: 'default',
});

const records = {};

for (const path in modules) {
  const name = path.match(/\/([^/]+)\.js$/)?.[1];

  if (name && name !== 'index') {
    records[name] = modules[path];
  }
}

export default records;
