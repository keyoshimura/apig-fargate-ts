import * as express from "express";
import { spawnSync } from "child_process";

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
  const response = helloWorldHandler.handler();
  res.status(200).json({ message: response });
});

app.get("/", async (req: express.Request, res: express.Response) => {
  console.log('get /')
  res.status(200).json({ message: "Return get Message" });
});

app.post("/", async (req: express.Request, res: express.Response) => {
  console.log('post /')
  res.status(200).json({
    hoge: 'foo'
  });
});

app.listen(80, () => {
  console.log('listen port 80');
});
