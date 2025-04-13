import * as React from "react";
import { useNavigate } from "react-router";
import { Button } from "@workspace/ui/components/button";

const api = {
  createRoom: (roomName: string) => {
    return fetch("/api", {
      method: "POST",
      body: JSON.stringify({
        roomName,
      }),
    });
  },
};

export const IndexPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Button
        onClick={async () => {
          const roomName = "ABC" + (Math.random() * 1000).toFixed(0).toString();

          await api.createRoom(roomName);
          navigate("/chat-room/" + roomName);
        }}
      >
        create
      </Button>
    </div>
  );
};
