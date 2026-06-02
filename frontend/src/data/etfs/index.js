const modules = import.meta.glob('./**.js', {
  eager: true,
  import: 'default',
});

const etfs = {};

for (const path in modules) {
  const name = path.match(/\/([^/]+)\.js$/)?.[1];

  if (name && name !== 'index') {
    etfs[name] = modules[path];
  }
}

export default etfs;
