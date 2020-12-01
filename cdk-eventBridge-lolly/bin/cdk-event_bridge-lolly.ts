#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkEventBridgeLollyStack } from '../lib/cdk-event_bridge-lolly-stack';

const app = new cdk.App();
new CdkEventBridgeLollyStack(app, 'CdkEventBridgeLollyStack');
