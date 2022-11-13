# apig-fargate-ts

- install 

```
yarn install --frozen-lockfile
```

- deploy

```
yarn cdk deploy
```

- curl

GET

```
curl https://9fvqn06oy0.execute-api.ap-northeast-1.amazonaws.com/prod
```


POST

```
curl -H "Content-Type: application/json" -X POST https://9fvqn06oy0.execute-api.ap-northeast-1.amazonaws.com/prod/ -d '{"dir": "./Dockerfile"}'
```