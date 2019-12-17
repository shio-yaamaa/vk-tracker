type UnixTime = number;

type PlatformId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface Platform {
  id: PlatformId;
  name: string;
}

interface LastSeen {
  time: Date;
  platformId: PlatformId;
}