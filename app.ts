import { name } from './package.json';
import { CognitoStack } from './cognito-stack';
import { PipelineApp, PipelineAppProps } from 'alf-cdk-app-pipeline/pipeline-app';
import { sharedDevAccountProps, sharedProdAccountProps } from 'alf-cdk-app-pipeline/accountConfig';


const pipelineAppProps: PipelineAppProps = {
  branch: 'master',
  repositoryName: name,
  accounts: [
    {
      id: '981237193288',
      region: 'eu-central-1',
      stage: 'dev',
    },
    {
      id: '981237193288',
      region: 'us-east-1',
      stage: 'prod',
    },
  ],
  buildAccount: {
    id: '981237193288',
    region: 'eu-central-1',
    stage: 'dev',
  },
  customStack: (scope, account) => {

    const alfCdkSpecifics = {
      ...(account.stage === 'dev' ? {
        hostedZoneId: sharedDevAccountProps.hostedZoneId,
        zoneName: sharedDevAccountProps.zoneName,
        domainName: 'cognito.dev.alfpro.net',
        certificateArn: `arn:aws:acm:us-east-1:${account.id}:certificate/f605dd8c-4ae3-4c1b-9471-4b152e0f8846`,
      }
       : // prod
      {
        hostedZoneId: sharedProdAccountProps.hostedZoneId,
        zoneName: sharedProdAccountProps.zoneName,
        domainName: 'cognito.alfpro.net',
        certificateArn: sharedProdAccountProps.acmCertRef,
      })
    };

    return new CognitoStack(scope, `${name}-${account.stage}`, {
      env: {
        account: account.id,
        region: account.region,
      },
      hostedZoneId: alfCdkSpecifics.hostedZoneId,
      zoneName: alfCdkSpecifics.zoneName,
      domainName: alfCdkSpecifics.domainName,
      certificateArn: alfCdkSpecifics.certificateArn,
      // stackName: process.env.stackName || `itest123`,
      stage: account.stage,
    })
  },
  testCommands: (account) => [
    `curl -Ssf $InstancePublicDnsName && aws cloudformation delete-stack --stack-name itest123 --region ${account.region}`,
    // 'curl -Ssf $CustomInstanceUrl',
    // 'echo done! Delete all remaining Stacks!',
  ],
};

// tslint:disable-next-line: no-unused-expression
new PipelineApp(pipelineAppProps);
