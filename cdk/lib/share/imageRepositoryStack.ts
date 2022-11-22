import {
    Stack,
    StackProps,
    aws_ecr as ecr,
    aws_iam as iam,
    RemovalPolicy,
} from "aws-cdk-lib";
import { Construct } from "constructs";

const IMAGE_REPOSITORY_NAME = process.env.IMAGE_REPOSITORY_NAME!;

// 別のGitHubリポジトリで管理できるとBetterか?
export class ImageRepositoryStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
      super(scope, id, props);
  
        // ECR Repository
        // TODO: イメージのライフサイクルを考えること
        // TODO: tagに応じて直接pushできない、とか制限して単一リポジトリでいい感じに管理できるようにする
        const sharedRepository = new ecr.Repository(this, "SharedRepository", {
            repositoryName: IMAGE_REPOSITORY_NAME,
            imageScanOnPush: true,
            removalPolicy: RemovalPolicy.DESTROY,
            // TODO: 慣れるまでコメントアウトする
            // imageTagMutability: ecr.TagMutability.IMMUTABLE,
        });

        // 各環境からはPullのみ可能なようにしておくのがよさそう
        // 今は１個しかアカウントがないのでしないけど
        // https://aws.amazon.com/jp/premiumsupport/knowledge-center/secondary-account-access-ecr/
        // const policyStatement = new iam.PolicyStatement({
        //     effect: iam.Effect.ALLOW,
        //     principals: [new iam.AccountPrincipal("各環境のAWSアカウントID")],
        //     actions: [
        //       "ecr:BatchCheckLayerAvailability",
        //       "ecr:GetDownloadUrlForLayer",
        //       "ecr:BatchGetImage",
        //       "ecr:PutImage",
        //       "ecr:InitiateLayerUpload",
        //       "ecr:UploadLayerPart",
        //       "ecr:CompleteLayerUpload"
        //     ]
        // })

        // sharedRepository.addToResourcePolicy(policyStatement)
    }
}
      