import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda"; // https://docs.aws.amazon.com/cdk/api/latest/docs/aws-lambda-readme.html
import * as sfn from "@aws-cdk/aws-stepfunctions"; // https://docs.aws.amazon.com/cdk/api/latest/docs/aws-stepfunctions-readme.html
import * as tasks from "@aws-cdk/aws-stepfunctions-tasks"; // https://docs.aws.amazon.com/cdk/api/latest/docs/aws-stepfunctions-tasks-readme.html
import { Rule, Schedule } from "@aws-cdk/aws-events"; // https://docs.aws.amazon.com/cdk/api/latest/docs/aws-events-readme.html
import { SfnStateMachine } from "@aws-cdk/aws-events-targets"; // https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-events-targets.SfnStateMachine.html
import * as apigw from "@aws-cdk/aws-apigateway";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as s3 from "@aws-cdk/aws-s3";

export class FibStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // define lambdas
    const lambdaA = new lambda.Function(this, "lambdaA", {
      runtime: lambda.Runtime.PYTHON_3_7,
      code: lambda.Code.fromAsset("app-code"),
      handler: "gsa-lambda-a.lambda_handler", // file is "gsa-lambda-a", function is "lambda_handler"
    });

    const lambdaB = new lambda.Function(this, "lambdaB", {
      runtime: lambda.Runtime.PYTHON_3_7,
      code: lambda.Code.fromAsset("app-code"),
      handler: "gsa-lambda-b.lambda_handler",
    });

    const lambdaC = new lambda.Function(this, "lambdaC", {
      runtime: lambda.Runtime.PYTHON_3_7,
      code: lambda.Code.fromAsset("app-code"),
      handler: "gsa-lambda-c.lambda_handler",
    });

    const lambdaD = new lambda.Function(this, "lambdaD", {
      runtime: lambda.Runtime.PYTHON_3_7,
      code: lambda.Code.fromAsset("app-code"),
      handler: "gsa-lambda-d.lambda_handler",
    });

    // define step function tasks
    const taskLambdaA = new tasks.LambdaInvoke(this, "task-invokeA", {
      lambdaFunction: lambdaA,
      comment: "Returns last sequence value from S3",
      resultPath: "$.outputA",
    });
    const taskLambdaB = new tasks.LambdaInvoke(this, "task-invokeB", {
      lambdaFunction: lambdaB,
      comment:
        "Returns last sequence value with last two inserted fibonacci values",
      inputPath: "$.outputA",
      resultPath: "$.outputB",
    });
    const taskLambdaC = new tasks.LambdaInvoke(this, "task-invokeC", {
      lambdaFunction: lambdaC,
      comment: "Sum of two values",
      inputPath: "$.outputB",
    });

    // https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-stepfunctions.Chain.html
    const stepChain = taskLambdaA.next(taskLambdaB).next(taskLambdaC);

    // https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-stepfunctions.StateMachine.html
    const stateMachine = new sfn.StateMachine(this, "stateMachine", {
      definition: stepChain,
      stateMachineName: "Run-Lambdas",
    });

    const fibTable = dynamodb.Table.fromTableName(
      this,
      "fibTable",
      "gsa-fibonacci-table"
    );

    fibTable.grantReadWriteData(lambdaA);
    fibTable.grantReadWriteData(lambdaB);
    fibTable.grantReadWriteData(lambdaC);
    fibTable.grantReadWriteData(lambdaD);

    const namesBucket = s3.Bucket.fromBucketName(
      this,
      "names-bucket",
      "gsa-fibonacci-s3-bucket"
    );
    namesBucket.grantRead(lambdaA);

    // aws-event rule, tell step function to run once a day
    new Rule(this, "ScheduleRule", {
      schedule: Schedule.rate(cdk.Duration.days(1)),
      targets: [new SfnStateMachine(stateMachine)],
    });

    const fibApi = new apigw.RestApi(this, "fib-api", {
      restApiName: "Fibonacci Service",
    });

    const getFibInteractions = new apigw.LambdaIntegration(lambdaD);

    fibApi.root.addMethod("POST", getFibInteractions);
  }
}
