import { FC, useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import { avatars } from "./avatars";
import "./Header.css";

const websocketUrl = "ws://pabonet.duckdns.org:5174/";

export const Header = () => {
  const { sendMessage, lastMessage } = useWebSocket(websocketUrl);
  const [name, setName] = useState(localStorage.getItem("name"));
  const [avatarId, setAvatarId] = useState(localStorage.getItem("avatarId"));

  return (
    <div>
      <h1>Brett Schellenberg's Stripe Interview, 16 Oct 2023</h1>
      <h4>
        scaffolded with{" "}
        <span className="inline-code">
          $ npm create vite@latest --template react-swc-ts{" "}
        </span>
      </h4>
      {!name || avatarId === null || avatarId === "" ? (
        <NameAndAvatar
          name={name || ""}
          setName={setName}
          avatarId={avatarId || ""}
          setAvatarId={setAvatarId}
          sendMessage={sendMessage}
        />
      ) : (
        <HeaderContent
          name={name || ""}
          avatarId={avatarId || ""}
          sendMessage={sendMessage}
          lastMessage={lastMessage}
        />
      )}
    </div>
  );
};

type HeaderContentProps = {
  name: string;
  avatarId: string;
  sendMessage: (message: string) => void;
  lastMessage: any;
};

type Client = {
  name: string;
  avatarId: number;
};

type MessageData = {
  likeCount: number;
  clients: Client[];
};

const HeaderContent: FC<HeaderContentProps> = ({
  name,
  avatarId,
  sendMessage,
  lastMessage,
}) => {
  const [likeCount, setLikeCount] = useState(0);
  const [clients, setClients] = useState([] as Client[]);

  const like = () => {
    sendMessage("like:");
    setLikeCount((c) => c + 1);
  };

  useEffect(() => {
    if (lastMessage === null) {
      return;
    }

    const data = JSON.parse(lastMessage?.data || "{}");

    // likes shouldn't go down
    if (data.likeCount === 0 || data.likeCount > likeCount) {
      setLikeCount(data.likeCount);
    }

    if (data.clients) {
      setClients(data.clients);
    }
  }, [lastMessage]);

  return (
    <>
      <div className="clients flex-column">
        <div className="clientsLabel">
          {clients.length} {clients.length === 1 ? "person is" : "people are"}{" "}
          here:
        </div>
        <div className="flex-row">
          <span
            className="like"
            style={{ fontSize: `${1 + likeCount * 0.2}em` }}
            onClick={like}
          >
            {likeCount}
            👍
          </span>
          {clients.map((client, index) => {
            return (
              <div className="client" key={index}>
                {avatars[client.avatarId]} {client.name}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

type NameAndAvatarProps = {
  name: string;
  setName: (name: string) => void;
  avatarId: string;
  setAvatarId: (avatarId: string) => void;
  sendMessage: (message: string) => void;
};

const NameAndAvatar: FC<NameAndAvatarProps> = ({
  name,
  setName,
  setAvatarId,
  sendMessage,
}) => {
  // TODO: bug: namechange causes submission, even without blur
  const handleNameChange = (e: React.FormEvent<HTMLInputElement>) => {
    setName(e.currentTarget.value);
  };

  const handleNameBlur = () => {
    if (name) {
      localStorage.setItem("name", name);
      sendMessage(`name:${name}`);
    }
  };

  const handleAvatarSelect = (id: number) => {
    setAvatarId(`${id}`);
    localStorage.setItem("avatarId", `${id}`);
    sendMessage(`avatar:${id}`);
  };

  return (
    <div className="centered">
      <h2>Choose your name and avatar:</h2>
      <input onChange={handleNameChange} onBlur={handleNameBlur} value={name} />
      <div>
        {avatars.map((avatar, index) => {
          return (
            <div
              className="avatar"
              key={index}
              onClick={() => handleAvatarSelect(index)}
            >
              {avatar}
            </div>
          );
        })}
      </div>
    </div>
  );
};
