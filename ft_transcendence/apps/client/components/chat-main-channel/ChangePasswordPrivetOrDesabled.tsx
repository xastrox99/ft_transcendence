import { Fragment, useState } from "react";
import { RiChatPrivateLine } from "react-icons/ri";
import Button from "../Button";
import ModalUI from "../Modal";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/api";
import { toast } from "react-toastify";

export default function ChangePasswordPrivetOrDesabled(props: {
  uid: string;
}): JSX.Element {
  const [isAddOpenChannelModal, setIsAddOpenChannelModal] = useState(false);

  const [componenetChannelModal, setcomponenetChannelModal] = useState<
    "public" | "protected" | "private"
  >("public");

  const onCloseAddChannelModal = () => setIsAddOpenChannelModal(false);
  const [password, setPassword] = useState<string>("");

  const protectMutation = useMutation({retry:0,
    mutationKey: ["protect"],
    mutationFn: api.api().chat.protect,
    onSuccess: () => {
      setIsAddOpenChannelModal(false);
      toast.done("ok");
    },
    onError: () => toast.error("error"),
  });
  const unprotectMutation = useMutation({retry:0,
    mutationKey: ["protect"],
    mutationFn: api.api().chat.unprotect,
    onSuccess: () => {
      setIsAddOpenChannelModal(false);
      toast.done("ok");
    },
    onError: () => toast.error("error"),
  });

  return (
    <Fragment>
      <ModalUI
        open={isAddOpenChannelModal}
        onClose={onCloseAddChannelModal}
        title="Channel situation"
      >
        <div className="flex justify-center items-center p-3 flex-col  max-h-72 gap-2">
          <div className="flex flex-col">
            <select
              defaultValue={componenetChannelModal}
              name="channels"
              id=""
              className="rounded-md py-1 px-2"
              onChange={(e) => setcomponenetChannelModal(e.target.value as any)}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="protected">Protected</option>
            </select>
          </div>
          {componenetChannelModal === "protected" && (
            <input
              placeholder="Set new password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-7 p-1 px-5 rounded-md w-2/3 mr-2  justify-start"
            />
          )}
          <Button
            onClick={() => {
              if (componenetChannelModal === "protected") {
                if (password.length < 3 || password.length > 8) {
                  // errror 
                  toast.error('Password incorrect');
                  return ;
                }
                protectMutation.mutate({
                  conversation: props.uid,
                  password,
                });
                setPassword("");
              } else {
                unprotectMutation.mutate({
                  conversation: props.uid,
                  visibility:
                    componenetChannelModal === "private" ? "Private" : "Public",
                });
              }
            }}
            title="Submit"
          ></Button>
        </div>
      </ModalUI>

      <div className="text-white">
        <button
          onClick={() => setIsAddOpenChannelModal(true)}
          title={""}
          className="flex rounded-full text-sm font-medium hover:opacity-90 px-3 py-2 items-center justify-center w-1/3 h-3/4 bg-[#6666]"
        >
          {" "}
          {<RiChatPrivateLine size={30} color="white" />}
        </button>
      </div>
    </Fragment>
  );
}
