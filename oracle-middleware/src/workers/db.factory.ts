import { DataSource, Repository } from 'typeorm';
import { OracleUserInfo } from '../entity/user.entity';
import { OracleUserInfoBackup } from '../entity/userbackup.entity';

export async function userDBService() {

  const UserDataSource = new DataSource({
      type: "mysql",
      host: process.env.DB_HOST,
      port: 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [OracleUserInfo, OracleUserInfoBackup],
    });
  if (!UserDataSource.isInitialized) {
    await UserDataSource.initialize();
  }
  console.log("Data Source has been initialized!");

  const userRepo: Repository<OracleUserInfo> = UserDataSource.getRepository(OracleUserInfo);
  const userRepo2: Repository<OracleUserInfoBackup> = UserDataSource.getRepository(OracleUserInfoBackup);

 
  return { UserDataSource, userRepo, userRepo2 };
}
