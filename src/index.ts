/*
import * as express from "express";

import * as helloWorldHandler from './handlers/helloWorldHandler';

const app = express();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// 上から優先して解決される
app.get("/hoge", async (req: express.Request, res: express.Response) => {
  console.log('get /hoge')
  console.log('req');
  console.log(req);
  const response = helloWorldHandler.handler();
  res.status(200).json({ message: response });
});

app.get("/", async (req: express.Request, res: express.Response) => {
  console.log('get /')
  console.log('req');
  console.log(req);
  res.status(200).json({ message: 'GET /' });
});

// app.post("/", async (req: express.Request, res: express.Response) => {
//   console.log('post /')
//   res.status(200).json({
//     hoge: 'foo'
//   });
// });

app.listen(80, () => {
  console.log('listen port 80');
});
*/

import * as express from "express";
const app = express();
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/", async (req: express.Request, res: express.Response) => {
  console.log('req');
  console.log(req);
  res.status(200).json({ message: 'GET /' });
});

app.get("/hoge", async (req: express.Request, res: express.Response) => {
  res.status(200).json({ message: 'GET /hoge' });
});

app.listen(80, () => {
  console.log('listen port 80');
});