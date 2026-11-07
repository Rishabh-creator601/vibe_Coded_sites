// Loads server/.env when it exists. The file is optional, because the defaults suit local use.
try {
  process.loadEnvFile();
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
