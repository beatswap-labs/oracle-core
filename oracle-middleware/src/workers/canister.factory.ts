import { Actor, HttpAgent } from '@dfinity/agent';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { CanisterFactories } from '../motoko/factories';

const IC_HOST = 'https://ic0.app';
const logger = new Logger('WorkerCanisterFactory');
const RECOVERABLE_AGENT_ERROR_MESSAGES = [
  'certificate is still too far in the future',
  'expected to find result for path subnet',
  'certificate time error',
];

type WorkerActorKey = 'memberActor' | 'mintActor' | 'tokenActor';

export async function createCanisterService() {
  const config = new ConfigService();
  const canisterIds = {
    memberActor: getRequiredConfig(config, 'MEMBER_CANISTER_ID'),
    mintActor: getRequiredConfig(config, 'MINT_CANISTER_ID'),
    tokenActor: getRequiredConfig(config, 'TOKEN_CANISTER_ID'),
  };

  let agent = await createAgent();
  const currentActors: Record<WorkerActorKey, any> = {
    memberActor: Actor.createActor(CanisterFactories.member, {
      agent,
      canisterId: canisterIds.memberActor,
    }),
    mintActor: Actor.createActor(CanisterFactories.mint, {
      agent,
      canisterId: canisterIds.mintActor,
    }),
    tokenActor: Actor.createActor(CanisterFactories.token, {
      agent,
      canisterId: canisterIds.tokenActor,
    }),
  };

  let refreshPromise: Promise<void> | null = null;

  const refreshActors = async (reason?: unknown) => {
    if (refreshPromise) {
      logger.warn('Worker IC agent refresh already in progress, waiting for the current refresh to finish');
      await refreshPromise;
      return;
    }

    logger.warn(
      `Refreshing worker IC agent due to recoverable error: ${summarizeError(reason)} | currentTimeDiffMsecs=${getTimeDiffMsecs(agent)}`,
    );

    refreshPromise = (async () => {
      try {
        agent = await createAgent();
        currentActors.memberActor = Actor.createActor(CanisterFactories.member, {
          agent,
          canisterId: canisterIds.memberActor,
        });
        currentActors.mintActor = Actor.createActor(CanisterFactories.mint, {
          agent,
          canisterId: canisterIds.mintActor,
        });
        currentActors.tokenActor = Actor.createActor(CanisterFactories.token, {
          agent,
          canisterId: canisterIds.tokenActor,
        });
        logger.log(`Worker IC agent refresh completed | newTimeDiffMsecs=${getTimeDiffMsecs(agent)}`);
      } catch (error) {
        logger.error(
          `Worker IC agent refresh failed: ${summarizeError(error)} | timeDiffMsecs=${getTimeDiffMsecs(agent)}`,
        );
        throw error;
      }
    })();

    try {
      await refreshPromise;
    } finally {
      refreshPromise = null;
    }
  };

  const createResilientActor = (actorKey: WorkerActorKey) =>
    new Proxy(
      {},
      {
        get: (_target, property) => {
          const value = currentActors[actorKey][property];
          if (typeof value !== 'function') {
            return value;
          }

          return async (...args: unknown[]) => {
            try {
              return await currentActors[actorKey][property](...args);
            } catch (error) {
              if (!isRecoverableAgentError(error)) {
                throw error;
              }

              await refreshActors(error);
              return await currentActors[actorKey][property](...args);
            }
          };
        },
      },
    );

  return {
    memberActor: createResilientActor('memberActor'),
    mintActor: createResilientActor('mintActor'),
    tokenActor: createResilientActor('tokenActor'),
  };
}

async function createAgent(): Promise<HttpAgent> {
  const agent = new HttpAgent({
    host: IC_HOST,
    shouldSyncTime: true,
  });

  logger.log(`Creating worker IC agent for host=${IC_HOST}`);
  await agent.syncTime();
  logger.log(`Worker IC agent time synced | timeDiffMsecs=${agent.getTimeDiffMsecs()}`);

  if (shouldFetchRootKey(IC_HOST)) {
    await agent.fetchRootKey();
    logger.log('Fetched IC root key for local replica');
  }

  return agent;
}

function shouldFetchRootKey(host: string): boolean {
  try {
    const { hostname } = new URL(host);
    return hostname === '127.0.0.1' || hostname === 'localhost';
  } catch {
    return false;
  }
}

function getRequiredConfig(config: ConfigService, key: string): string {
  const value = config.get<string>(key);
  if (!value) {
    logger.error(`Cannot find ${key}`);
    throw new Error(`Cannot find ${key}`);
  }
  return value;
}

function isRecoverableAgentError(error: unknown): boolean {
  const message = summarizeError(error).toLowerCase();
  return RECOVERABLE_AGENT_ERROR_MESSAGES.some(pattern => message.includes(pattern));
}

function summarizeError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.message} ${summarizeUnknown(error.cause)}`.trim();
  }

  return summarizeUnknown(error);
}

function summarizeUnknown(value: unknown): string {
  if (!value) {
    return '';
  }

  if (value instanceof Error) {
    return `${value.message} ${summarizeUnknown(value.cause)}`.trim();
  }

  if (typeof value === 'string') {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function getTimeDiffMsecs(agent: HttpAgent | undefined): number {
  if (!agent) {
    return 0;
  }

  try {
    return agent.getTimeDiffMsecs();
  } catch {
    return 0;
  }
}
