const app = require('./app');
const initDb = require('./db/init.sqlite');

const PORT = process.env.PORT || 3000;

async function startServer() {
  await initDb();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);
