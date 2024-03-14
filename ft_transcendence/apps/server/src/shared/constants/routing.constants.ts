const Routes = {
  conversations: {
    base: "conversations",
  },
  auth: {
    base: "auth",
    logout: "lougout",
  },
  users: {
    base: "users",
    search: "search",
    all: "all",
    leaderboard: "leaderboard",
    me: "me",
    removeFriend: ":uid/remove",
    banFriend: ":uid/ban",
    unbanFriend: ":uid/unban",
    acceptFriend: ":uid/accept",
    getUser: ":uid",
    delete: ":uid",
    updateMe: "me",
    changeProfileImage: "me/profile-image",
  },
} as const;

export type RouteEndpoints<T extends keyof typeof Routes> =
  (typeof Routes)[T][keyof typeof Routes[T]];

export const { users: usersRoutes } = Routes;
