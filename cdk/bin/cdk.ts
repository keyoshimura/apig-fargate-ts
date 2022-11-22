#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ImageRepositoryStack } from "../lib/share/imageRepositoryStack";
import { ApiStack } from "../lib/api-stack";

const PROJECT_NAME = process.env.PROJECT_NAME!;
const STAGE_NAME = process.env.STAGE_NAME!;

const app = new cdk.App();
// 共有リソースなので、必要な時に一回だけデプロイ
// このやり方だとデプロイが手動で危ないのでリポジトリわけよう
new ImageRepositoryStack(app, `${STAGE_NAME}-${PROJECT_NAME}-ImageRepositoryStack`);
new ApiStack(app, `${STAGE_NAME}-${PROJECT_NAME}-ApiStack`);
