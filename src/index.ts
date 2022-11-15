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

app.get("/", async (req: express.Request, res: express.Response) => {
  res.status(200).json({ message: "Return get Message" });
});

app.get("/hoge", async (req: express.Request, res: express.Response) => {
  const response = helloWorldHandler.handler();
  res.status(200).json({ message: response });
});

app.post("/", async (req: express.Request, res: express.Response) => {
  res.status(200).json({
    hoge: 'foo'
  });
});

app.listen(80, () => {
  console.log("Example app listening on port 80!");

  const cmd_pwd = spawnSync("pwd", { shell: true }).stdout.toString();
  const cmd_ls_l = spawnSync("ls -l", { shell: true }).stdout.toString();

  console.log(`
    pwd : ${cmd_pwd}
    ls -l : ${cmd_ls_l}
  `);
});
