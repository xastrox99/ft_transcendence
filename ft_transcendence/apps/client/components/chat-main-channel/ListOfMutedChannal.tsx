import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment } from "react";
import { IoMdMore } from "react-icons/io";
import { toast } from "react-toastify";
import { api } from "../../api";
import MenuItem from "../Menu-chat";

type usersInChannal = {
  name: string;
  url: string;
  uid: string;
  conversation: string;
  setshowOpstions: (b: boolean) => void;
  setMenuList: string[];
  refetch: () => void;
};

function ListOfMutedChannal(props: usersInChannal): JSX.Element {
  const router = useRouter();
  const {
    name,
    url,
    uid,
    conversation,
    setshowOpstions,
    setMenuList,
    refetch,
  } = props;
  const queryClient = useQueryClient();
  const mutation = useMutation({retry:0,
    throwOnError: false,
    mutationKey: ["unmut-user"],
    mutationFn: api.api().chat.unmutParticipant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-group-cnv"] });
      toast.done("Done");
      props.refetch();
    },
    onError: () => {
      toast.error("Sorry you don't have the permitions !");
    },
  });
  const onActionClicked = (action: string) => {
    if (action == "unmuted") {
      mutation.mutate({
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
            href={"/users/"+uid}
            onClick={() => setshowOpstions(false)}
          >
            <div className="px-2">
              <Image
                width={40}
                height={40}
                className="rounded-full  left-1 bottom-2 "
                alt="zakaria"
                src={url || "https://t4.ftcdn.net/jpg/02/29/75/83/360_F_229758328_7x8jwCwjtBMmC6rgFzLFhZoEpLobB6L8.jpg"}
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
                {setMenuList.map((action) => (
                  <button
                    key={action}
                    className=" hover:bg-[#B2F35F] rounded-md flex items-center justify-center"
                    onClick={onActionClicked.bind(null, action.toLowerCase())}
                  >
                    {action}
                  </button>
                ))}
              </MenuItem>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}

export default ListOfMutedChannal;
