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
curl https://w6fv0edej8.execute-api.ap-northeast-1.amazonaws.com/prod
curl https://w6fv0edej8.execute-api.ap-northeast-1.amazonaws.com/prod/hoge
```


POST

```
curl -H "Content-Type: application/json" -X POST https://w6fv0edej8.execute-api.ap-northeast-1.amazonaws.com/prod/ -d '{"dir": "./Dockerfile"}'
```

## コードを変更して内容を試したいとき
ローカルでイメージを作り直してECRにPushしてイメージを上書き、ECSのタスクをコンソールから手動停止しよう

- 1.ローカルでイメージをビルド

```
docker image build ./src/ -t apig-fargate-ts:sampleHash
```

- 2.ECRにログイン

```
aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin 624304563747.dkr.ecr.ap-northeast-1.amazonaws.com
```

- 3.tag付け

```
docker tag apig-fargate-ts:sampleHash 624304563747.dkr.ecr.ap-northeast-1.amazonaws.com/apig-fargate-ts:sampleHash
```

- 4.push

```
docker push 624304563747.dkr.ecr.ap-northeast-1.amazonaws.com/apig-fargate-ts:sampleHash
```

- 5.タスクの更新

AWSのコンソール画面上からECSタスクを停止しよう。
新しいイメージをPullしてくれるよ。

- 参考
  - https://docs.aws.amazon.com/ja_jp/AmazonECR/latest/userguide/docker-push-ecr-image.html