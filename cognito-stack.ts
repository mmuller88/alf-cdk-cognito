import { StackProps, CfnOutput, Construct,} from '@aws-cdk/core';
import { CustomStack } from 'alf-cdk-app-pipeline/custom-stack';
import { ARecord, HostedZone, RecordTarget } from '@aws-cdk/aws-route53';
import { UserPoolDomainTarget  } from '@aws-cdk/aws-route53-targets';
import { UserPool, VerificationEmailStyle } from '@aws-cdk/aws-cognito'
import { Certificate } from '@aws-cdk/aws-certificatemanager';
// import { PolicyStatement } from '@aws-cdk/aws-iam';

export interface CognitoStackProps extends StackProps {
  stage: string;
  // stackName: string;
  hostedZoneId: string,
  zoneName: string,
  domainName: string,
  certificateArn: string,
}

export class CognitoStack extends CustomStack {
  constructor(scope: Construct, id: string, props: CognitoStackProps) {
    super(scope, id, props);

    const userPool = new UserPool(this, 'cognitoUserPool', {
      userPoolName: 'alfUserPool',
      signInAliases: {
        username: true,
        email: true
      },
      passwordPolicy: {
        requireLowercase: false,
        requireUppercase: false,
        requireDigits: false,
        requireSymbols: false,
        minLength: 6,
      },
      selfSignUpEnabled: true,
      userVerification: {
        emailSubject: 'Verify your email for our awesome app!',
        emailBody: 'Hello {username}, Thanks for signing up to our awesome app! Your verification code is {####}',
        emailStyle: VerificationEmailStyle.CODE,
        smsMessage: 'Hello {username}, Thanks for signing up to our awesome app! Your verification code is {####}',
      }
    });

    userPool.addClient('alfproWebClient', {

    });

    const domain = userPool.addDomain('cognitoDomain', {
      customDomain: {
        domainName: props.domainName,
        certificate: Certificate.fromCertificateArn(this, 'cert', props.certificateArn),
      }
    });

    // tslint:disable-next-line: no-unused-expression
    const record = new ARecord(this, 'CognitoAliasRecord', {
      recordName: props.domainName,
      target: RecordTarget.fromAlias(new UserPoolDomainTarget(domain)),
      zone: HostedZone.fromHostedZoneAttributes(this, 'Zone', {
        hostedZoneId: props.hostedZoneId,
        zoneName: props.zoneName,
      })
    });

    const cognitoDomainName = new CfnOutput(this, 'CognitoDomainName', {
      value: record.domainName
    });
    this.cfnOutputs['CognitoDomainName'] = cognitoDomainName;
  }
}