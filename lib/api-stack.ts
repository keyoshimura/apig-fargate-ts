import {
  Aws,
  Stack,
  StackProps,
  aws_ec2 as ec2,
  aws_ecr as ecr,
  aws_ecr_assets as ecr_assets,
  aws_ecs as ecs,
  aws_ecs_patterns as ecs_patterns,
  aws_apigateway as apigateway,
  RemovalPolicy,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";
import * as ecr_deploy from "cdk-ecr-deployment";

// const stage = 'dev'
// const appVersion = 'v0.0.1'
const projectName = 'apig-fargate-ts';
// TODO: CDに組み込むときはタグ戦略と併せて考えること
// GitHubActionsでdigestを取得してそれを環境変数にSet、その値をCDKで取得、とかかな
const dockerImageTag = 'sampleHash';

export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // VPC
    const vpc = new ec2.Vpc(this, "Vpc", {
      // cidr: "10.0.0.0/24",
      vpcName: projectName,
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/24'),
      enableDnsHostnames: true,
      enableDnsSupport: true,
      // TODO: このNATGatewayの必要性がわからない...
      // プライベートサブネットにFargateがあって、外に出る口がないとCDKのデプロイすら成功しない
      // ECRへのendpointがあればOK、とはならないかな?確認したいね
      natGateways: 1,
      maxAzs: 2,
      subnetConfiguration: [
        { 
          name: "Public",
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 27,
        },
        {
          name: "Private",
          // ORIGINALではEGRESSでのプライベートサブネットだけど、Auroraをプライベート、FargateをPublicにするならこれでよい？
          // NATGatewayを用意するのが高くつくので、可能ならpublicSubnetでFargateを稼働させたいので
          // と思ったけど、セキュリティ面を考慮してNAT用意した
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          // subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 27,
        },
      ],
    });

    // ECR Repository
    // TODO: イメージのライフサイクルを考えること
    // TODO: スタック分割
    // TODO: tagに応じて直接pushできない、とか制限して単一リポジトリでいい感じに管理できるようにする
    const repository = new ecr.Repository(this, "Repository", {
      repositoryName: 'apig-fargate-ts',
      imageScanOnPush: true,
      removalPolicy: RemovalPolicy.DESTROY,
      // TODO: 慣れるまでコメントアウトする
      // imageTagMutability: ecr.TagMutability.IMMUTABLE,
    });

    // Image
    const image = new ecr_assets.DockerImageAsset(this, "image", {
      directory: path.join(__dirname, "../src"),
    });

    // Deploy Image
    new ecr_deploy.ECRDeployment(this, "DeployImage", {
      src: new ecr_deploy.DockerImageName(image.imageUri),
      dest: new ecr_deploy.DockerImageName(
        `${Aws.ACCOUNT_ID}.dkr.ecr.${Aws.REGION}.amazonaws.com/${repository.repositoryName}:${dockerImageTag}`
      ),
    });

    // ECS Cluster
    const ecsCluster = new ecs.Cluster(this, "EcsCluster", {
      clusterName: 'apig-fargate-ts',
      vpc: vpc,
      containerInsights: true,
    });

    // ECS Task Definition
    const taskDefinition = new ecs.FargateTaskDefinition(
      this,
      "TaskDefinition"
    );

    taskDefinition
      .addContainer("apigFargateTsContainer", {
        image: ecs.ContainerImage.fromEcrRepository(repository, dockerImageTag),
        memoryLimitMiB: 256,
        logging: ecs.LogDriver.awsLogs({
          streamPrefix: repository.repositoryName,
        }),
      })
      .addPortMappings({
        protocol: ecs.Protocol.TCP,
        containerPort: 80,
        hostPort: 80,
      });

    // NLB
    const loadBalancedFargateService =
      new ecs_patterns.NetworkLoadBalancedFargateService(
        this,
        "LoadBalancedFargateService",
        {
          serviceName: `${projectName}-service`,
          assignPublicIp: false,
          // assignPublicIp: true,
          cluster: ecsCluster,
          taskSubnets: vpc.selectSubnets({
            // subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
            subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
            // subnetType: ec2.SubnetType.PUBLIC,
          }),
          memoryLimitMiB: 1024,
          cpu: 512,
          desiredCount: 2,
          // 検証時ならコストを下げたい
          // desiredCount: 1,
          taskDefinition: taskDefinition,
          publicLoadBalancer: true,
        }
      );

    loadBalancedFargateService.service.connections.allowFrom(
      ec2.Peer.ipv4(vpc.vpcCidrBlock),
      ec2.Port.tcp(80)
    );

    // Auto Scaling Settings
    const scalableTarget =
      loadBalancedFargateService.service.autoScaleTaskCount({
        minCapacity: 2,
        maxCapacity: 10,
      });

    scalableTarget.scaleOnCpuUtilization("CpuScaling", {
      targetUtilizationPercent: 50,
    });

    scalableTarget.scaleOnMemoryUtilization("MemoryScaling", {
      targetUtilizationPercent: 50,
    });

    // VPC Link
    const link = new apigateway.VpcLink(this, "link", {
      vpcLinkName: `${projectName}-vpc-link`,
      targets: [loadBalancedFargateService.loadBalancer],
    });

    // methodごとに分割する意味ある?
    const getRootIntegration = new apigateway.Integration({
      type: apigateway.IntegrationType.HTTP_PROXY,
      integrationHttpMethod: "GET",
      options: {
        connectionType: apigateway.ConnectionType.VPC_LINK,
        vpcLink: link,
      },
    });
    const getRootHogeIntegration = new apigateway.Integration({
      type: apigateway.IntegrationType.HTTP_PROXY,
      integrationHttpMethod: "GET",
      uri: `http://${loadBalancedFargateService.loadBalancer.loadBalancerDnsName}/hoge`,
      options: {
        connectionType: apigateway.ConnectionType.VPC_LINK,
        vpcLink: link,
      },
    });
    const postRootIntegration = new apigateway.Integration({
      type: apigateway.IntegrationType.HTTP_PROXY,
      integrationHttpMethod: "POST",
      options: {
        connectionType: apigateway.ConnectionType.VPC_LINK,
        vpcLink: link,
      },
    });

    // API Gateway
    const api = new apigateway.RestApi(this, "Api", {
      restApiName: projectName,
      deployOptions: {
        stageName: 'prod',
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
      },
    });
    api.root.addMethod("GET", getRootIntegration);
    api.root.addMethod("POST", postRootIntegration);
    const hogeResource = api.root.addResource('hoge');
    hogeResource.addMethod('GET', getRootHogeIntegration);
    // const wikiResource = api.root.addResource('wiki');
    // wikiResource.addMethod('GET', getIntegration);
    // const wikiAboutResource = wikiResource.addResource('about');
    // wikiAboutResource.addMethod('GET', getIntegration);
    // ブラウザからアクセスするなら必要
    // hogeResource.addMethod('OPTIONS');
    // const proxyResource = api.root.addResource('{proxy+}');

    // リソースやメソッドごとにURLを指定できるのなら、apigatewayで変なパスを公開しない、ということもできるのでは?
    // const anyIntegration = new apigateway.Integration({
    //   type: apigateway.IntegrationType.HTTP_PROXY,
    //   integrationHttpMethod: "ANY",
    //   uri: `http://${loadBalancedFargateService.loadBalancer.loadBalancerDnsName}/{proxy}`,
    //   options: {
    //     connectionType: apigateway.ConnectionType.VPC_LINK,
    //     vpcLink: link,
    //   },
    // });
    // proxyResource.addMethod('ANY', anyIntegration);
  }
}
