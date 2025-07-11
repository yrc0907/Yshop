import { errorMiddleware } from './../../../packages/error-handler/error-middleware';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app = express();

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
app.get('/', (req, res) => {
  res.send({ 'message': 'Hello API' });
});

const port = process.env.PORT ? Number(process.env.PORT) : 6001;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});

server.on('error', (error) => {
  console.error("Server error", error);
});
