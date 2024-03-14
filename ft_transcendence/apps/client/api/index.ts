import type { AxiosInstance } from "axios";
import axios from "axios";
import { constants } from "../constants/contsnts";

const ConversationTypes = {
  Group: "Group",
  Single: "Single",
} as const;

export interface MutUserType {
  user: string;
  conversation: string;
  until: string;
}
export interface updateUserMemberShip {
  user: string;
  conversation: string;
}

const ChatVisibility = {
  Public: "Public",
  Private: "Private",
  Protected: "Protected",
} as const;

class Api {
  private httpClient: AxiosInstance;

  constructor(private readonly baseUrl: string = constants.URL) {
    this.httpClient = this.initializeHttpClient();
  }

  private initializeHttpClient() {
    return axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      withCredentials: true,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
  }

  api = () => ({
    auth: {
      me: () => this.httpClient.get("/users/me"),
      logout: () => this.httpClient.get("/auth/logout"),
    },
    chat: {
      leaveGroup: (uid: string) =>
        this.httpClient.post("/conversations/left", { conversation: uid }),
      create: (conf: {
        type?: keyof typeof ConversationTypes;
        password?: string;
        visibility?: keyof typeof ChatVisibility;
        name?: string;
        participants: string[];
      }) =>
        this.httpClient.post("/conversations", {
          ...conf,
        }),
      getConversations: (type: "group" | "single") =>
        this.httpClient.get("conversations/me?type=" + type),
      getConversation: (uid: string, type: "Single" | "Group") =>
        this.httpClient.get("conversations/" + uid + "?type=" + type),
      mutParticipant: (conf: MutUserType) =>
        this.httpClient.patch("/conversations/mut-participant", {
          ...conf,
        }),
      unmutParticipant: (conf: updateUserMemberShip) =>
        this.httpClient.patch("/conversations/unmut-participant", {
          ...conf,
        }),
      banParticipant: (conf: updateUserMemberShip) =>
        this.httpClient.patch("/conversations/ban-participant", {
          ...conf,
        }),
      unbanParticipant: (conf: updateUserMemberShip) =>
        this.httpClient.patch("/conversations/unban-participant", {
          ...conf,
        }),
      addAdmin: (conf: updateUserMemberShip) =>
        this.httpClient.patch("/conversations/add-admin", {
          ...conf,
        }),
      removeAdmin: (conf: updateUserMemberShip) =>
        this.httpClient.patch("/conversations/delete-admin", {
          ...conf,
        }),
      addParticipant: (conf: updateUserMemberShip) =>
        this.httpClient.patch("/conversations/add-participant", {
          ...conf,
        }),
      removeParticipant: (conf: updateUserMemberShip) =>
        this.httpClient.patch("/conversations/delete-participant", {
          ...conf,
        }),
      changeInfos: (cnf: { conversation: string; name: string }) =>
        this.httpClient.patch("/conversations/" + cnf.conversation, {
          name: cnf.name,
        }),
      joinChannel: ({conversation, password}: {conversation: string, password?: string | false}) => {
        return this.httpClient.patch("/conversations/join", {
          conversation,
          password
        });
      },
      kick: (conf: { user: string; conversation: string }) =>
        this.httpClient.patch(`/conversations/delete-participant`, conf),
      protect: (conf: { password: string; conversation: string }) =>
        this.httpClient.patch(`/conversations/protect`, conf),
      unprotect: (conf: {
        visibility: "Public" | "Private";
        conversation: string;
      }) => this.httpClient.patch(`/conversations/unprotect`, conf),
    },
    users: {
      ban: (uid: string) => this.httpClient.post(`/users/${uid}/ban`),
      unban: (uid: string) => this.httpClient.post(`/users/${uid}/unban`),
      search: (search: string) =>
        this.httpClient.get(`/users/search?search=${search}`),
      findAll: (type?: "Pending" | "Accepted" | "Banned") => 
        this.httpClient.get(`/users/all`),
      findTheAll: (type?: "Pending" | "Accepted" | "Banned") => 
        this.httpClient.get(`/users?type=${type}`),
        // this.httpClient.get(`/users${type ? "?type=" + type : ""}`),
      addFriend: (friendUid: string) =>
        this.httpClient.post(`users/${friendUid}/add`),
      removeFriend: (friendUid: string) =>
        this.httpClient.post(`users/${friendUid}/remove`),
      acceptFriend: (friendUid: string) =>
        this.httpClient.post(`users/${friendUid}/accept`),
      getFriend: (friendUid: string) =>
        this.httpClient.get(`users/${friendUid}`),
      getUserMatchHistrory: (userUid: string) =>
        this.httpClient.get(`games/history/${userUid}`),
      getMatchHistory: () =>
        this.httpClient.get(`games/history/me`),
      allExceptBanned: () => this.httpClient.get("/users/all"),
      leaderBorad: () => this.httpClient.get("/users/leaderboard"),
      updateProfileImage: (form: any) =>
        this.httpClient.post("users/me/profile-image", form, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }),
      updateInfos: (form: {
        firstName: string;
        lastName: string;
        login: string;
      }) => {
        return this.httpClient.post("/users/me", {
          ...form,
        });
      },
    },
    otp: {
      getImage: () => this.httpClient.get("/auth/generate"),
      verifyOtp: (otp: string) => this.httpClient.post("/auth/verify", { otp }),
      validateOtp: (otp: string) =>
        this.httpClient.post("/auth/validate", { otp }),
      disableTwoFa: () => this.httpClient.post("/auth/disable"),
    },
  });
}

export const api = new Api();
