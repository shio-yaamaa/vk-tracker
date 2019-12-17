import * as AWS from 'aws-sdk';

const LATEST_LAST_SEEN_PK = 'latest-last-seen';
const LATEST_LAST_SEEN_SK = 0;

interface Entry {
  pk: string;
  sk: number;
  platformId: PlatformId;
}

interface LatestLastSeenEntry extends Entry {
  pk: typeof LATEST_LAST_SEEN_PK;
  sk: typeof LATEST_LAST_SEEN_SK;
  time: number;
};

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME!;

const timeToPk = (time: Date): string => {
  const paddedMonthString = `0${time.getUTCMonth()}`.slice(-2);
  return `${time.getUTCFullYear()}${paddedMonthString}`;
};

const latestLastSeenEntryToLastSeen = (entry: LatestLastSeenEntry): LastSeen => {
  return {
    time: new Date(entry.time),
    platformId: entry.platformId,
  };
};

class DBClient {
  private documentClient: AWS.DynamoDB.DocumentClient;

  constructor() {
    this.documentClient = new AWS.DynamoDB.DocumentClient({
      region: process.env.AWS_REGION,
    });
  }

  public async getLatestLastSeen(): Promise<LastSeen | null> {
    return new Promise((resolve, reject) => {
      const params: AWS.DynamoDB.DocumentClient.GetItemInput = {
        TableName: TABLE_NAME,
        Key: {
          pk: LATEST_LAST_SEEN_PK,
          sk: LATEST_LAST_SEEN_SK,
        },
      };
      this.documentClient.get(params, (error, data) => {
        if (error) reject(error);
        resolve(
          data.Item
            ? latestLastSeenEntryToLastSeen(data.Item as LatestLastSeenEntry)
            : null
        );
      });
    });
  };

  public async registerLastSeen(lastSeen: LastSeen) {
    // TODO: Put these operations in a transaction
    await this.insertLastSeen(lastSeen);
    await this.updateLatestLastSeen(lastSeen);
  }

  private async insertLastSeen(lastSeen: LastSeen) {
    return new Promise((resolve, reject) => {
      const params: AWS.DynamoDB.DocumentClient.PutItemInput = {
        TableName: TABLE_NAME,
        Item: {
          pk: timeToPk(lastSeen.time),
          sk: lastSeen.time.getTime(),
          platformId: lastSeen.platformId,
        },
      };
      this.documentClient.put(params, (error, _data) => {
        if (error) reject(error);
        resolve();
      });
    });
  }

  private async updateLatestLastSeen(lastSeen: LastSeen) {
    return new Promise((resolve, reject) => {
      const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
        TableName: TABLE_NAME,
        Key: {
          pk: LATEST_LAST_SEEN_PK,
          sk: LATEST_LAST_SEEN_SK,
        },
        UpdateExpression: 'SET #t = :t, #p = :p',
        ExpressionAttributeNames: {
          '#t': 'time',
          '#p': 'platformId',
        },
        ExpressionAttributeValues: {
          ':t': lastSeen.time.getTime(),
          ':p': lastSeen.platformId,
        },
      };
      this.documentClient.update(params, (error, _data) => {
        if (error) reject(error);
        resolve();
      });
    });
  }
}

export default DBClient;