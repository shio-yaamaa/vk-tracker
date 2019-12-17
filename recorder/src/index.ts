import * as Sentry from '@sentry/node';

import VKClient from './VKClient';
import DBClient from './DBClient';

Sentry.init({ dsn: process.env.SENTRY_DSN });

const lastSeensIdentical = (lastSeen1: LastSeen, lastSeen2: LastSeen) => {
  return lastSeen1.time.getTime() === lastSeen2.time.getTime()
    && lastSeen1.platformId === lastSeen2.platformId;
};

const record = async () => {
  const vkClient = new VKClient(process.env.VK_ACCESS_TOKEN!);
  const dbClient = new DBClient();

  const lastSeen = await vkClient.fetchLastSeen(process.env.VK_TARGET_USER_ID!);
  const previousLastSeen = await dbClient.getLatestLastSeen();
  if (!previousLastSeen || !lastSeensIdentical(previousLastSeen, lastSeen)) {
    dbClient.registerLastSeen(lastSeen);
  }
};

record();