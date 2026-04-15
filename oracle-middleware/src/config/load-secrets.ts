import { DecryptCommand, KMSClient } from '@aws-sdk/client-kms';
import { createConnection } from 'mysql2/promise';

type SecretRow = {
  secretKey?: string;
};

type AwsCredentials = {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
};

function resolveAwsCredentials(): AwsCredentials | undefined {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_KEY;
  const sessionToken = process.env.AWS_SESSION_TOKEN;

  if (!accessKeyId || !secretAccessKey) {
    return undefined;
  }

  return {
    accessKeyId,
    secretAccessKey,
    sessionToken,
  };
}

async function readOwnerKeySecretFromDb(): Promise<SecretRow | null> {
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;
  
  const tableName = 'oracle_key_info';
  const secretName = 'oracleOwnerKey';

  const connection = await createConnection({
    host,
    port: Number(process.env.DB_PORT ?? 3306),
    user,
    password,
    database,
  });

  try {
    const [rows] = await connection.query(
      `SELECT
          secretKey
        FROM ${tableName}
        WHERE keyname = ?`,
      [secretName],
    );

    const row = Array.isArray(rows) ? (rows[0] as SecretRow | undefined) : undefined;
    return row ?? null;
  } finally {
    await connection.end();
  }
}

export async function loadSecrets(): Promise<void> {
  const awsKeyId = process.env.AWS_KEY;

  if (process.env.OWNER_KEY) {
    return;
  }

  const region = process.env.AWS_REGION;
  if (!region) {
    throw new Error('AWS_REGION is missing');
  }

  const secretRow = await readOwnerKeySecretFromDb();
  if (!secretRow?.secretKey) {
    throw new Error('OWNER_KEY not found in DB');
  }

  const kms = new KMSClient({
    region,
    credentials: resolveAwsCredentials(),
  });
  let response;

  try {
    response = await kms.send(
      new DecryptCommand({
        CiphertextBlob: Buffer.from(secretRow.secretKey, 'base64'),
        KeyId: awsKeyId,
      }),
    );
  } catch (error) {
    if (error instanceof Error && error.name === 'CredentialsProviderError') {
      throw new Error(
        'AWS credentials were not found',
      );
    }

    throw error;
  }

  if (!response.Plaintext) {
    throw new Error('KMS decrypt returned empty plaintext for OWNER_KEY');
  }

  process.env.OWNER_KEY = Buffer.from(response.Plaintext).toString('utf-8').trim();
}
