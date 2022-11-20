import * as express from "express";
import * as helloWorldHandler from './handlers/helloWorldHandler';

const app = express();
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/", async (req: express.Request, res: express.Response) => {
  res.status(200).json({ message: 'GET /' });
});

app.get("/hoge", async (req: express.Request, res: express.Response) => {
  const response = helloWorldHandler.handler();
  res.status(200).json({ message: response });
});

app.listen(80, () => {
  console.log('listen port 80');
});