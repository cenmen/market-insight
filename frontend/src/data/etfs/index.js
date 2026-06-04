const modules = import.meta.glob(['./**.js', './**.jsx'], {
  eager: true,
  import: 'default',
});

const etfs = {};

for (const path in modules) {
  const name = path.match(/\/([^/]+)\.(?:js|jsx)$/)?.[1];

  if (name && name !== 'index') {
    etfs[name] = modules[path];
  }
}

export default etfs;
