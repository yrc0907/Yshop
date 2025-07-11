import { errorMiddleware } from './../../../packages/error-handler/error-middleware';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './routes/auth.routes';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
const app = express();

// Determine the correct path for swagger-output.json
let swaggerPath;
try {
  // First try to load from the compiled location
  swaggerPath = path.join(__dirname, 'swagger-output.json');
  require.resolve(swaggerPath);
} catch (e) {
  // If that fails, try to load from the source location
  swaggerPath = path.join(__dirname, '../../../../src/swagger-output.json');
}

const swaggerDocument = require(swaggerPath);

app.use(
  cors({
    origin: ['http://localhost:3000'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(errorMiddleware)
app.use(express.json());
app.use(cookieParser())

// Routes
app.use("/api", router)


app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
const port = process.env.PORT ? Number(process.env.PORT) : 6001;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
});

app.get('/', (req, res) => {
  res.send({ 'message': 'Hello API' });
});

app.get("/docs-json", (req, res) => {
  res.json(swaggerDocument)
})

server.on('error', (error) => {
  console.error("Server error", error);
});
