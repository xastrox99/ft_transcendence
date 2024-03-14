import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useState } from "react";
import { IoMdMore } from "react-icons/io";
import { toast } from "react-toastify";
import { api } from "../../api";
import MenuItem from "../Menu-chat";
import { ViewerRole } from "./ConversationUiChannel";
import GenerateTimeMuted from "./GenerateTimeMuted";

type Props = {
  name: string;
  url: string;
  uid: string;
  conversation: string;
  role: ViewerRole;
  setshowOpstions: (b: boolean) => void;
  refetch: () => void;
};

function ListOfUsersChannal(props: Props): JSX.Element {
  const [isAddOpenChannelModal, setIsAddOpenChannelModal] = useState(false);

  const queryClient = useQueryClient();
  const banMutation = useMutation({retry:0,
    throwOnError: false,
    mutationKey: ["ban-user"],
    mutationFn: api.api().chat.banParticipant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-group-cnv"] });
      toast.done("Banned successfully");
      props.refetch();
    },
    onError: () => {
      toast.error("Sorry you don't have the permitions !");
    },
  });
  const adminMutation = useMutation({retry:0,
    throwOnError: false,
    mutationKey: ["add-admin"],
    mutationFn: api.api().chat.addAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-group-cnv"] });
      toast.done("Set as admin successfully");
      props.refetch();
    },
    onError: () => {
      toast.error("Sorry you don't have the permitions !");
    },
  });

  const kickMutation = useMutation({retry:0,
    throwOnError: false,
    mutationKey: ["kick-user"],
    mutationFn: api.api().chat.kick,
    onSuccess: () => {
      props.refetch();
      toast.done("Kicked successfully");
    },
    onError: () => {
      toast.error("Sorry you don't have the permitions !");
    },
  });

  const { name, url, uid, setshowOpstions, role, conversation } = props;
  const onActionClicked = (action: string) => {
    if (action === "mute") {
      setIsAddOpenChannelModal(true);
    }
    if (action === "ban") {
      banMutation.mutate({
        user: uid,
        conversation,
      });
    }
    if (action === "kick") {
      kickMutation.mutate({
        user: uid,
        conversation,
      });
    }
    if (action === "set as admin") {
      adminMutation.mutate({
        user: uid,
        conversation,
      });
    }
  };
  return (
    <Fragment>
      <div className="flex flex-row relative h-16 hover:bg-[#1B1B1B] w-full">
        <div className="flex flex-row w-full justify-between items-center">
          <Link
            className="flex flex-row items-center"
            href={"/users/" + uid}
            onClick={() => setshowOpstions(false)}
          >
            <div className="px-2">
              <Image
                width={40}
                height={40}
                className="rounded-full  left-1 bottom-2 "
                alt="zakaria"
                src={
                  props.url ||
                  "https://t4.ftcdn.net/jpg/02/29/75/83/360_F_229758328_7x8jwCwjtBMmC6rgFzLFhZoEpLobB6L8.jpg"
                }
              />
            </div>
            <div className="flex flex-col py-4">
              <span className=" text-[#F5F5F5] text-md font-mono justify-center items-center ">
                {name}
              </span>
            </div>
          </Link>
          <div className="flex  items-start mt-1">
            <div className="text-[#707991]  mt-2 justify-end text-xs">
              <MenuItem iconBtn={<IoMdMore size={24} color="gray" />}>
                {role === "owner" && (
                  <button
                    className=" hover:bg-[#B2F35F] rounded-md flex items-center justify-center"
                    onClick={onActionClicked.bind(
                      null,
                      "Set as Admin".toLowerCase()
                    )}
                  >
                    Set as Admin
                  </button>
                )}
                {(role === "admin" || role === "owner") && (
                  <>
                    <button
                      className=" hover:bg-[#B2F35F] rounded-md flex items-center justify-center"
                      onClick={onActionClicked.bind(null, "Mute".toLowerCase())}
                    >
                      Mute
                    </button>
                    <button
                      className=" hover:bg-[#B2F35F] rounded-md flex items-center justify-center"
                      onClick={onActionClicked.bind(null, "Kick".toLowerCase())}
                    >
                      Kick
                    </button>
                    <button
                      className=" hover:bg-[#B2F35F] rounded-md flex items-center justify-center"
                      onClick={onActionClicked.bind(null, "Ban".toLowerCase())}
                    >
                      Ban
                    </button>
                  </>
                )}
              </MenuItem>
            </div>
          </div>
        </div>
      </div>

      <GenerateTimeMuted
        isAddOpenChannelModal={isAddOpenChannelModal}
        setIsAddOpenChannelModal={setIsAddOpenChannelModal}
        conversation={conversation}
        user={uid}
        refetch={props.refetch}
      />
    </Fragment>
  );
}

export default ListOfUsersChannal;
