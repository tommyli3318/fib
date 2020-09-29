#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { FibStack } from '../lib/fib-stack';

const app = new cdk.App();
new FibStack(app, 'FibStack');
