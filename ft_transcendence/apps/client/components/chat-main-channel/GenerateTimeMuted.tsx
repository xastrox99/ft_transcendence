import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import { api } from "../../api";
import Button from "../Button";
import ModalUI from "../Modal";

interface Props {
  user: string;
  conversation: string;
  setIsAddOpenChannelModal: (b: boolean) => void;
  isAddOpenChannelModal: boolean;
  refetch: () => void;

}

export default function GenerateTimeMuted({
  conversation,
  isAddOpenChannelModal,
  setIsAddOpenChannelModal,
  user,
  refetch
}: Props): JSX.Element {


  const [time, setTime] = useState("8h");

  const onCloseAddChannelModal = () => setIsAddOpenChannelModal(false);
  const queryClient = useQueryClient()
  const mutation = useMutation({retry:0,
    throwOnError: false,
    mutationKey: ["mut-user"],
    mutationFn: api.api().chat.mutParticipant,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['get-group-cnv']})
      toast.done('Done')
      setIsAddOpenChannelModal(false)
      refetch()
    },
    onError: () => {
      toast.error("Sorry you don't have the permitions !")
      setIsAddOpenChannelModal(false)
    }
  });

  return (
    <ModalUI
      open={isAddOpenChannelModal}
      onClose={onCloseAddChannelModal}
      title="Mute"
    >
      <div className="flex justify-center items-center p-3 flex-col  max-h-72 gap-2">
        <div className="flex flex-col">
          <select
            name="channels"
            id=""
            className="rounded-md py-1 px-2"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          >
            <option value="1min">1 min</option>
            <option value="8h">8 h</option>
            <option value="1w">1 Week</option>
            <option value="1m">1 M</option>
          </select>
        </div>
        <Button
          onClick={() => {
            mutation.mutate({
              user,
              conversation,
              until: new Date(
                Date.now() + (time === "8h"
                  ? 8 * 60 * 60 * 1000
                  : time === "1w"
                    ? 7 * 24 * 60 * 60 * 1000
                    : time === '1min' ? 60 * 1000
                    : 30 * 24 * 60 * 60 * 1000)
              ).toISOString(),
            });
          }}
          title="Submit"
        ></Button>
      </div>
    </ModalUI>
  );
}
