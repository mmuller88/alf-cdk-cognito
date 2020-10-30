import { name } from '../../package.json';
import { CognitoStack } from './cognito-stack';
import { PipelineApp, PipelineAppProps } from 'alf-cdk-app-pipeline/pipeline-app';
import { sharedDevAccountProps, sharedProdAccountProps } from 'alf-cdk-app-pipeline/accountConfig';


const pipelineAppProps: PipelineAppProps = {
  branch: 'master',
  repositoryName: name,
  stageAccounts: [
    {
      account:{
        id: '981237193288',
        region: 'eu-central-1',
      },
      stage: 'dev',
    },
    {
      account: {
        id: '981237193288',
        region: 'us-east-1',
      },
      stage: 'prod',
    },
  ],
  buildAccount: {
    id: '981237193288',
    region: 'eu-central-1',
  },
  customStack: (scope, stageAccount) => {

    const alfCdkSpecifics = {
      ...(stageAccount.stage === 'dev' ? {
        hostedZoneId: sharedDevAccountProps.hostedZoneId,
        zoneName: sharedDevAccountProps.zoneName,
        domainName: 'cognito.dev.alfpro.net',
        certificateArn: `arn:aws:acm:us-east-1:${stageAccount.account.id}:certificate/f605dd8c-4ae3-4c1b-9471-4b152e0f8846`,
      }
       : // prod
      {
        hostedZoneId: sharedProdAccountProps.hostedZoneId,
        zoneName: sharedProdAccountProps.zoneName,
        domainName: 'cognito.alfpro.net',
        certificateArn: sharedProdAccountProps.acmCertRef,
      })
    };

    return new CognitoStack(scope, `${name}-${stageAccount.stage}`, {
      env: {
        account: stageAccount.account.id,
        region: stageAccount.account.region,
      },
      hostedZoneId: alfCdkSpecifics.hostedZoneId,
      zoneName: alfCdkSpecifics.zoneName,
      domainName: alfCdkSpecifics.domainName,
      certificateArn: alfCdkSpecifics.certificateArn,
      stackName: `${name}-${stageAccount.stage}`,
      stage: stageAccount.stage,
    })
  },
  testCommands: (_) => [
    // `curl -Ssf $InstancePublicDnsName && aws cloudformation delete-stack --stack-name itest123 --region ${stageAccount.account.region}`,
    // 'curl -Ssf $CustomInstanceUrl',
    // 'echo done! Delete all remaining Stacks!',
  ],
};

// tslint:disable-next-line: no-unused-expression
new PipelineApp(pipelineAppProps);
