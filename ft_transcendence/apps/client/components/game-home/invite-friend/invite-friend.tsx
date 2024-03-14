import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api } from "../../../api";
import FriendItem from "./friend-item";
import { user } from "./interface/user";
import SearchBar from "./search-bar";

const InviteFriend = (props: { setSelected: any; setTypeGame: any }): JSX.Element => {
  const [friendsData, setFriendsData] = useState<user[] | null>(null);
  const [search, setSearch] = useState<string>("");
  const [data, setData] = useState<any[]>([]);

  // roben m problem of useeffect
  const friendsQuery = useQuery({retry:0,
    throwOnError: false,
    queryFn: (d) => {
      return api.api().users.findTheAll(d.queryKey[1] as any);
    },
    queryKey: ["get-with-type", "Accepted"],
    staleTime: 0,
  });

  useEffect(() => {
    setFriendsData(friendsQuery.data?.data?.data?.filter((d: any) => d.status === 'online'));
  },[friendsQuery.data, friendsQuery.isSuccess])


  const searchMutation = useMutation({retry:0,
    throwOnError: false,
    mutationKey: ["search-mutation"],
    mutationFn: api.api().users.search,
    onSuccess: (d) => {
      setFriendsData(d.data.data?.filter((d: any) => d.status === 'online'));
    },
  });

  const handleOnClick = () => {
    if (search !== "") {
      searchMutation.mutate(search);
    }
    // searchMutation.mutate(currentSearch);
  };

  const handelBackButton = () => {
    props.setSelected(false);
    props.setTypeGame(null);
    // searchMutation.mutate(currentSearch);
  };

  return (
    <div className="container h-full w-full flex justify-center items-center">
      <div className="flex w-full flex-col justify-center items-center px-4 gap-8 pt-7 ">
        <div className="w-full ">
          <SearchBar
            setFriendsData={setFriendsData}
            setSearch={setSearch}
            Search={search}
            handleOnClick={handleOnClick}
          />
          <ul className="w-full flex flex-col justify-start items-center pt-5 gap-4 overflow-y-auto h-[300px] p-4">
            {friendsData
              ? friendsData.map((friend: user) => (
                <FriendItem
                
                  key={friend.uid}
                  firstName={friend.firstName}
                  login={friend.login}
                  profileImage={friend.profileImage}
                  uid={friend.uid}
                />
              ))
              : null}
          </ul>
        </div>
        <button onClick={handelBackButton} className={`w-full mb-10 bg-purple-700 hover:bg-purple-800 cursor-pointer text-white py-3 px-6 rounded-lg mt-8 font-bold`}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default InviteFriend;
