import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Actor, HttpAgent } from '@dfinity/agent';
import { ConfigService } from '@nestjs/config';
import { CanisterFactories } from '../motoko/factories';

const IC_HOST = 'https://ic0.app';
const RECOVERABLE_AGENT_ERROR_MESSAGES = [
  'certificate is still too far in the future',
  'expected to find result for path subnet',
  'certificate time error',
];

type ManagedActorKey =
  | 'oracleActor'
  | 'unlockActor'
  | 'playActor'
  | 'memberActor'
  | 'memberSnapActor'
  | 'holderActor'
  | 'tokenActor'
  | 'mintActor';

type ActorDefinition = {
  key: ManagedActorKey;
  factory: keyof typeof CanisterFactories;
  envKey: string;
};

@Injectable()
export class CanisterService implements OnModuleInit {
  private readonly logger = new Logger(CanisterService.name);
  private agentInstance!: HttpAgent;
  private currentActors: Partial<Record<ManagedActorKey, any>> = {};
  private actorCanisterIds: Record<ManagedActorKey, string> | null = null;
  private initPromise: Promise<void> | null = null;
  private refreshPromise: Promise<void> | null = null;

  oracleActor: any;
  unlockActor: any;
  playActor: any;
  memberActor: any;
  memberSnapActor: any;
  holderActor: any;
  tokenActor: any;
  mintActor: any;

  private readonly actorDefinitions: ActorDefinition[] = [
    { key: 'oracleActor', factory: 'oracle', envKey: 'ORACLE_CANISTER_ID' },
    { key: 'unlockActor', factory: 'unlock', envKey: 'UNLOCK_CANISTER_ID' },
    { key: 'playActor', factory: 'play', envKey: 'PLAY_CANISTER_ID' },
    { key: 'memberActor', factory: 'member', envKey: 'MEMBER_CANISTER_ID' },
    { key: 'memberSnapActor', factory: 'memberSnap', envKey: 'MEMBERSNAP_CANISTER_ID' },
    { key: 'holderActor', factory: 'holder', envKey: 'HOLDER_CANISTER_ID' },
    { key: 'tokenActor', factory: 'token', envKey: 'TOKEN_CANISTER_ID' },
    { key: 'mintActor', factory: 'mint', envKey: 'MINT_CANISTER_ID' },
  ];

  constructor(private readonly configService: ConfigService) {}

  get agent(): HttpAgent {
    return this.agentInstance;
  }

  async onModuleInit() {
    await this.initialize();
  }

  async initialize(force = false): Promise<void> {
    if (this.initPromise && !force) {
      await this.initPromise;
      return;
    }

    this.initPromise = this.buildActors();

    try {
      await this.initPromise;
    } finally {
      if (!force) {
        this.initPromise = null;
      }
    }
  }

  async refreshAgent(reason?: unknown): Promise<void> {
    if (this.refreshPromise) {
      this.logger.warn('IC agent refresh already in progress, waiting for the current refresh to finish');
      await this.refreshPromise;
      return;
    }

    const summary = this.summarizeError(reason);
    this.logger.warn(
      `Refreshing IC agent due to recoverable error: ${summary} | currentTimeDiffMsecs=${this.getCurrentTimeDiffMsecs()}`,
    );

    this.refreshPromise = (async () => {
      try {
        await this.buildActors();
        this.logger.log(`IC agent refresh completed | newTimeDiffMsecs=${this.getCurrentTimeDiffMsecs()}`);
      } catch (error) {
        this.logger.error(
          `IC agent refresh failed: ${this.summarizeError(error)} | timeDiffMsecs=${this.getCurrentTimeDiffMsecs()}`,
        );
        throw error;
      }
    })();

    try {
      await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  createArchiveActor(canisterId: string): any {
    return this.createResilientActor(canisterId, () =>
      Actor.createActor(CanisterFactories.tokenArc, {
        agent: this.agent,
        canisterId,
      }),
    );
  }

  private async buildActors(): Promise<void> {
    const canisterIds = this.resolveCanisterIds();
    const agent = await this.createAgent();

    this.agentInstance = agent;
    this.actorCanisterIds = canisterIds;

    for (const definition of this.actorDefinitions) {
      this.currentActors[definition.key] = Actor.createActor(CanisterFactories[definition.factory], {
        agent,
        canisterId: canisterIds[definition.key],
      });

      if (!this[definition.key]) {
        this[definition.key] = this.createManagedActorProxy(definition.key);
      }
    }
  }

  private resolveCanisterIds(): Record<ManagedActorKey, string> {
    const resolved = {} as Record<ManagedActorKey, string>;

    for (const definition of this.actorDefinitions) {
      const canisterId = this.configService.get<string>(definition.envKey);
      if (!canisterId) {
        this.logger.error(`Cannot find ${definition.envKey}`);
        throw new Error(`Cannot find ${definition.envKey}`);
      }
      resolved[definition.key] = canisterId;
    }

    return resolved;
  }

  private async createAgent(): Promise<HttpAgent> {
    const agent = new HttpAgent({
      host: IC_HOST,
      shouldSyncTime: true,
    });

    this.logger.log(`Creating IC agent for host=${IC_HOST}`);
    await agent.syncTime();
    this.logger.log(`IC agent time synced | timeDiffMsecs=${agent.getTimeDiffMsecs()}`);

    if (this.shouldFetchRootKey(IC_HOST)) {
      await agent.fetchRootKey();
      this.logger.log('Fetched IC root key for local replica');
    }

    return agent;
  }

  private shouldFetchRootKey(host: string): boolean {
    try {
      const { hostname } = new URL(host);
      return hostname === '127.0.0.1' || hostname === 'localhost';
    } catch {
      return false;
    }
  }

  private createManagedActorProxy(actorKey: ManagedActorKey): any {
    return this.createResilientActor(actorKey, () => {
      const actor = this.currentActors[actorKey];
      if (!actor) {
        throw new Error(`${actorKey} is not initialized`);
      }
      return actor;
    });
  }

  private createResilientActor(actorLabel: string, getActor: () => any): any {
    return new Proxy(
      {},
      {
        get: (_target, property) => {
          const actor = getActor();
          const value = actor[property];

          if (typeof value !== 'function') {
            return value;
          }

          return async (...args: unknown[]) => {
            try {
              return await getActor()[property](...args);
            } catch (error) {
              if (!this.isRecoverableAgentError(error)) {
                throw error;
              }

              await this.refreshAgent(error);
              return await getActor()[property](...args);
            }
          };
        },
      },
    );
  }

  private isRecoverableAgentError(error: unknown): boolean {
    const message = this.summarizeError(error).toLowerCase();
    return RECOVERABLE_AGENT_ERROR_MESSAGES.some(pattern => message.includes(pattern));
  }

  private getCurrentTimeDiffMsecs(): number {
    if (!this.agentInstance) {
      return 0;
    }

    try {
      return this.agentInstance.getTimeDiffMsecs();
    } catch {
      return 0;
    }
  }

  private summarizeError(error: unknown): string {
    if (error instanceof Error) {
      const nested = this.summarizeUnknown(error.cause);
      return `${error.message} ${nested}`.trim();
    }

    return this.summarizeUnknown(error);
  }

  private summarizeUnknown(value: unknown): string {
    if (!value) {
      return '';
    }

    if (value instanceof Error) {
      return `${value.message} ${this.summarizeUnknown(value.cause)}`.trim();
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
}
