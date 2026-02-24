import { DataSource, Repository } from 'typeorm';
import { OracleUserInfoBackup } from '../entity/userbackup.entity';
import { IplWhitelist } from '../entity/whitelist.entity';
import { IplMonthlySnapshots } from '../entity/snapshotinfo.entity';
import { IplSnapshot } from '../entity/snapshot.entity';
import { VestingClaims } from 'src/entity/vestingclaim.entity';
import { VestingWhitelists } from 'src/entity/vestingwhitelist.entity';
import { VestingHistoryLog } from 'src/entity/vestinghistory.entity';
import { VestingWhitelistsTemp } from 'src/entity/whitelisttemp.entity';

export async function userDBService() {

  const UserDataSource = new DataSource({
      type: "mysql",
      host: process.env.DB_HOST,
      port: 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [OracleUserInfoBackup],
      synchronize: true,
    });

    const VaultDataSource = new DataSource({
      type: "mysql",
      host: process.env.DB_HOST,
      port: 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.VAULT_DB_NAME,
      entities: [IplWhitelist, IplSnapshot, IplMonthlySnapshots, VestingClaims, VestingWhitelists, VestingHistoryLog, VestingWhitelistsTemp],
    });

  if (!UserDataSource.isInitialized ) {
    await UserDataSource.initialize();
  }
   if (!VaultDataSource.isInitialized ) {
    await VaultDataSource.initialize();
  }
  console.log("Data Source has been initialized!");

  const userBackupRepo: Repository<OracleUserInfoBackup> = UserDataSource.getRepository(OracleUserInfoBackup);
  const whiteListRepo: Repository<IplWhitelist> = VaultDataSource.getRepository(IplWhitelist);
  const snapshotRepo: Repository<IplSnapshot> = VaultDataSource.getRepository(IplSnapshot);
  const snapshotInfoRepo: Repository<IplMonthlySnapshots> = VaultDataSource.getRepository(IplMonthlySnapshots);
  const vestingClaimsRepo: Repository<VestingClaims> = VaultDataSource.getRepository(VestingClaims);
  const vestingWhitelistRepo: Repository<VestingWhitelists> = VaultDataSource.getRepository(VestingWhitelists);
  const vestingHistoryRepo: Repository<VestingHistoryLog> = VaultDataSource.getRepository(VestingHistoryLog);
  const vestingWhitelistTempRepo: Repository<VestingWhitelistsTemp> = VaultDataSource.getRepository(VestingWhitelistsTemp);

  return { UserDataSource, VaultDataSource, userBackupRepo, whiteListRepo, snapshotRepo, snapshotInfoRepo, vestingClaimsRepo, vestingWhitelistRepo, vestingHistoryRepo, vestingWhitelistTempRepo };
}
