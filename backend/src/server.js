const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');

async function bootstrap() {
  try {
    await connectDB();
    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

bootstrap();
