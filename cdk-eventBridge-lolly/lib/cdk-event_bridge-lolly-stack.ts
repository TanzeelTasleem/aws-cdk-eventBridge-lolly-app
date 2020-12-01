import * as cdk from "@aws-cdk/core";
import * as appsync from "@aws-cdk/aws-appsync";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as lambda from "@aws-cdk/aws-lambda";
import * as events from "@aws-cdk/aws-events";
import * as targets from "@aws-cdk/aws-events-targets";
import * as logs from "@aws-cdk/aws-logs";
import * as Iam from "@aws-cdk/aws-iam";
import * as s3 from "@aws-cdk/aws-s3";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as CodePipelineAction from "@aws-cdk/aws-codepipeline-actions";
import * as CodeBuild from "@aws-cdk/aws-codebuild";
import * as dotenv from "dotenv";
import * as s3deploy from "@aws-cdk/aws-s3-deployment"
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as origins from "@aws-cdk/aws-cloudfront-origins";

dotenv.config();

export class CdkEventBridgeLollyStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "Cdk-virlolly-app-bucket", {
      publicReadAccess: true,
      versioned: true,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "404.html",
    });
    
    new s3deploy.BucketDeployment(this, "todoApp-EventBridge-sns", {
      sources: [s3deploy.Source.asset("../public")],
      destinationBucket: bucket,
    })

    new cloudfront.Distribution(this, "Distribution", {
      defaultBehavior: { origin: new origins.S3Origin(bucket) },
    });

    const outputSources = new codepipeline.Artifact();
    const outputWebsite = new codepipeline.Artifact();

    const policy = new Iam.PolicyStatement();
    policy.addActions('s3:*');
    policy.addResources('*');
    
    const pipeline = new codepipeline.Pipeline(this, "Pipeline", {
      pipelineName: "lollypipeline",
      restartExecutionOnUpdate: true,
    });
    
    // const s3Stage = new CodeBuild.PipelineProject(this , "s3Stage"{
    //  buildSpec : CodeBuild.BuildSpec.fromObject({
    //   version: '0.2',
    //   phases: {
    //     install: {
    //       "runtime-versions":{
    //         "nodejs": 12
    //       },
    //       commands: [
    //         'npm i -g gatsby',
    //         'npm install',
    //       ],
    //     },
    //     build: {
    //       commands: [
    //         'npm run build build',
    //       ],
    //     },
    //   },
    //   artifacts: {
    //     'base-directory': './public',   ///outputting our generated Gatsby Build files to the public directory
    //     "files": [
    //       '**/*'
    //     ]
    //   },
    // }),
    // environment: {
    //   buildImage: CodeBuild.LinuxBuildImage.STANDARD_3_0,   ///BuildImage version 3 because we are using nodejs environment 12
    // },
    // }) 

    pipeline.addStage({
      stageName: 'Source',
      actions: [
        new CodePipelineAction.GitHubSourceAction({
          actionName:'Checkout',
          owner:'TanzeelTasleem',
          repo:"aws-cdk-eventBridge-lolly-app",
          oauthToken:cdk.SecretValue.secretsManager('PIPELINE_SECRET'), ///create token on github and save it on aws secret manager
          output:outputSources,                                       ///Output will save in the sourceOutput Artifact
          branch:"master",                                           ///Branch of your repo
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
                'base-directory': './public',   ///outputting our generated Gatsby Build files to the public directory
                "files": [
                  '**/*'
                ]
              },
            })
          }),
          input: outputSources,
          outputs: [outputWebsite],
        }),
      ],
    })

    pipeline.addStage({
      stageName: "Deploy",
      actions: [
        // AWS CodePipeline action to deploy CRA website to S3
        new CodePipelineAction.S3DeployAction({
          actionName: "WebsiteDeploy",
          input: outputWebsite,
          bucket: bucket,
        }),
      ],
    });
    
    pipeline.addToRolePolicy(policy)

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

    const lollyLambda = new lambda.Function(this, "LollyAppQueryLambda", {
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

    // const logGroup = new logs.LogGroup(this, "MyLogGroup", {
    //   logGroupName: "appsync/lollyApp/eventBridge",
    // });

    // rule.addTarget(new targets.CloudWatchLogGroup(logGroup));
    rule.addTarget(new targets.CodePipeline(pipeline));

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

// 338020a08252bb6e182ca3c6186fa019ef869044
// 5032b3077ebaf0c15bdb61a6239b99e23cc27ff4