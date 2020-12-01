import * as cdk from "@aws-cdk/core";
import * as appsync from "@aws-cdk/aws-appsync";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as lambda from "@aws-cdk/aws-lambda";
import * as events from "@aws-cdk/aws-events";
import * as targets from "@aws-cdk/aws-events-targets";
import * as logs from "@aws-cdk/aws-logs";
import * as Iam from "@aws-cdk/aws-iam";
import * as s3 from '@aws-cdk/aws-s3'
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as CodePipelineAction from '@aws-cdk/aws-codepipeline-actions'
import * as CodeBuild from '@aws-cdk/aws-codebuild'
import * as dotenv from 'dotenv'
dotenv.config()

export class CdkEventBridgeLollyStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "Cdk-virlolly-app-bucket", {
      publicReadAccess: true,
      versioned : true,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "404.html",
    })

    const outputSources = new codepipeline.Artifact()
    const outputWebsite = new codepipeline.Artifact()

    const pipeline = new codepipeline.Pipeline(this, 'Pipeline', {
      pipelineName: 'lollyWebsite',
      restartExecutionOnUpdate: true,
    })

    pipeline.addStage({
      stageName: 'Source',
      actions: [
        new CodePipelineAction.GitHubSourceAction({
          actionName: 'Checkout',
          owner: `${process.env.GITHUB_OWNER}`,
          repo: `${process.env.GITHUB_REPO}`,
          oauthToken: cdk.SecretValue.secretsManager(`${process.env.GITHUB_TOKEN}`),
          output: outputSources,
          trigger: CodePipelineAction.GitHubTrigger.WEBHOOK,
        }),
      ],
    })

    pipeline.addStage({
      stageName: 'Build',
      actions: [
        // AWS CodePipeline action to run CodeBuild project
        new CodePipelineAction.CodeBuildAction({
          actionName: 'Website',
          project: new CodeBuild.PipelineProject(this, 'BuildWebsite', {
            projectName: 'Website',
            buildSpec : CodeBuild.BuildSpec.fromObject({
              version : '0.2',
              phases: {
                install: {
                  "runtime-versions": {
                    "nodejs": 12
                  },
                  commands: [
                    "npm install -g gatsby",
                    "npm install"
                  ],
                },
                build: {
                  commands: [
                    'npm run build',
                  ],
                },
              },
              artifacts: {
                baseDirectory: '../public',
                files: ['**/*'],
              },
            })
          }),
          input: outputSources,
          outputs: [outputWebsite],
        }),
      ],
    })

    pipeline.addStage({
      stageName: 'Deploy',
      actions: [
        // AWS CodePipeline action to deploy CRA website to S3
        new CodePipelineAction.S3DeployAction({
          actionName: 'Website',
          input: outputWebsite,
          bucket: bucket,
        }),
      ],
    })
  
    const api = new appsync.GraphqlApi(this, "lolly-App-EventBridge", {
      name: "lolly-App-EventBridge",
      schema: appsync.Schema.fromAsset("graphql/schema.gql"),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
        },
      },
      xrayEnabled: true,
    });

    const lollyTable = new dynamodb.Table(this, "lollyAppEventBridge", {
      partitionKey: { name: "lollyPath", type: dynamodb.AttributeType.STRING },
    });

    const lollyLambda = new lambda.Function(this,"LollyAppQueryLambda", {
      code: lambda.Code.fromAsset("lambda"),
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "main.handler",
    });

    const eventLambda = new lambda.Function(this, "lollyAppEventLambda", {
      code: lambda.Code.fromAsset("lambda"),
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "event.handler",
    });

    const eventPolicy = new Iam.PolicyStatement({
      effect: Iam.Effect.ALLOW,
      resources: ["*"],
      actions: ["events:PutEvents"],
    });

    lollyTable.grantFullAccess(lollyLambda);
    lollyLambda.addEnvironment("LOLLY_TABLE", lollyTable.tableName);
    lollyLambda.addToRolePolicy(eventPolicy);

    const eventBus = new events.EventBus(this, "lolly-App", {
      eventBusName: "lollyAppEventBridge",
    });

    const rule = new events.Rule(this, "AppSyncEventBridgeRule", {
      eventPattern: {
        source: ["appsync"],
        detailType: ["lollyCreated"],
      },
      eventBus: eventBus,
    });

    const logGroup = new logs.LogGroup(this, "MyLogGroup", {
      logGroupName: "appsync/lollyApp/eventBridge",
    });

    rule.addTarget(new targets.CloudWatchLogGroup(logGroup));
    rule.addTarget(new targets.LambdaFunction(eventLambda));

    const dataSource = api.addLambdaDataSource(
      "lollyAppDataSource",
      lollyLambda
    );

    dataSource.createResolver({
      typeName: "Query",
      fieldName: "getLollies",
    });

    dataSource.createResolver({
      typeName: "Mutation",
      fieldName: "createLolly",
    });

    dataSource.createResolver({
      typeName: "Query",
      fieldName: "getLolly",
    });

    new cdk.CfnOutput(this, "GraphQLAPIURL", {
      value: api.graphqlUrl,
    });

    new cdk.CfnOutput(this, "GraphQLAPIKey", {
      value: api.apiKey || "",
    });

    new cdk.CfnOutput(this, "eventBus", {
      value: eventBus.eventBusName,
    });

    new cdk.CfnOutput(this, "Stack Region", {
      value: this.region,
    });
    new cdk.CfnOutput(this, "process values", {
      value: `${process.env.GITHUB_OWNER}`,
    });
  }
}
//`${process.env.GITHUB_TOKEN}`08184ab47144f0ddbdc8872