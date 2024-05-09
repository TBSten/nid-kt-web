import type { Adapter, AdapterAccount } from '@auth/core/adapters';
import { default as OriginalPostgresAdapter } from '@auth/pg-adapter';
import type { Pool } from 'pg';

// biome-ignore lint:noExplicitAny - This is a type from the database
export function mapExpiresAt(account: any): AdapterAccount {
  const expires_at: number = Number.parseInt(account.expires_at);
  return {
    ...account,
    expires_at,
  };
}

export default function PostgresAdapter(client: Pool): Adapter {
  const originalAdapter = OriginalPostgresAdapter(client);

  return {
    async createUser(user) {
      const {
        name,
        email,
        emailVerified,
        image,
        isJoinedGuild,
        isJoinedOrganization,
        githubUserID,
        githubUserName,
      } = user;
      const sql = `
          INSERT INTO users
          (
            name,
            email,
            "emailVerified",
            image,
            "isJoinedGuild",
            "isJoinedOrganization",
            "githubUserID",
            "githubUserName"
          ) 
          VALUES ($1, $2, $3, $4 , $5, $6, $7, $8) 
          RETURNING
            id,
            name,
            email,
            "emailVerified",
            image,
            "isJoinedGuild",
            "isJoinedOrganization",
            "githubUserID",
            "githubUserName"
        `;
      const result = await client.query(sql, [
        name,
        email,
        emailVerified,
        image,
        isJoinedGuild,
        isJoinedOrganization,
        githubUserID,
        githubUserName,
      ]);
      return result.rows[0];
    },
    async updateUser(user) {
      const fetchSql = 'select * from users where id = $1';
      const query1 = await client.query(fetchSql, [user.id]);
      const oldUser = query1.rows[0];

      const newUser = {
        ...oldUser,
        ...user,
      };

      const {
        id,
        name,
        email,
        emailVerified,
        image,
        isJoinedGuild,
        isJoinedOrganization,
        githubUserID,
        githubUserName,
      } = newUser;

      const updateSql = `
          UPDATE users set
            name = $2,
            email = $3,
            "emailVerified" = $4,
            image = $5,
            "isJoinedGuild" = $6,
            "isJoinedOrganization" = $7,
            "githubUserID" = $8,
            "githubUserName" = $9
          where id = $1
          RETURNING
            name,
            id,
            email,
            "emailVerified",
            image,
            "isJoinedGuild",
            "isJoinedOrganization",
            "githubUserID",
            "githubUserName"
        `;
      const query2 = await client.query(updateSql, [
        id,
        name,
        email,
        emailVerified,
        image,
        isJoinedGuild,
        isJoinedOrganization,
        githubUserID,
        githubUserName,
      ]);
      return query2.rows[0];
    },
  };
}
