# apig-fargate-ts

## Unit

- build

```
docker image build -t apig-fargate-ts:dev-yoshim ./src/
```

- run

```
# 起動して中に入って何かやる場合(辞めるときは「exit」)
docker run --name dev-container -it apig-fargate-ts:dev-yoshim /bin/bash
```

- install

```
yarn ins
```

- UT

```
yarn test
```

- ローカルで結合試験

```
# コンテナをバックエンドで起動する
docker run -p 8080:80 -d apig-fargate-ts:dev-yoshim

# コンテナにリクエスト(GET)
curl localhost:8080

# コンテナにリクエスト(GETでパス指定)
curl localhost:8080/hoge

# コンテナにリクエスト(POST)
curl -H "Content-Type: application/json" -X POST localhost:8080 -d '{"dir": "./Dockerfile"}'
```


## E2E

- deploy

```
yarn cdk deploy
```

- curl

GET

```
curl https://oqktose5q5.execute-api.ap-northeast-1.amazonaws.com/prod
```


POST

```
curl -H "Content-Type: application/json" -X POST https://9fvqn06oy0.execute-api.ap-northeast-1.amazonaws.com/prod/ -d '{"dir": "./Dockerfile"}'
```

