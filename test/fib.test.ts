import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Fib from '../app-def/fib-stack';

// test('SQS Queue Created', () => {
//     const app = new cdk.App();
//     // WHEN
//     const stack = new Fib.FibStack(app, 'MyTestStack');
//     // THEN
//     expectCDK(stack).to(haveResource("AWS::SQS::Queue",{
//       VisibilityTimeout: 300
//     }));
// });

// test('SNS Topic Created', () => {
//   const app = new cdk.App();
//   // WHEN
//   const stack = new Fib.FibStack(app, 'MyTestStack');
//   // THEN
//   expectCDK(stack).to(haveResource("AWS::SNS::Topic"));
// });
