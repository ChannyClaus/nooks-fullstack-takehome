import { Box, Button, Card, IconButton, Stack } from "@mui/material";
import axios from "axios";
import React, { useRef, useState } from "react";
import ReactPlayer from "react-player";

const ws = new WebSocket("ws://localhost:8000");
interface VideoPlayerProps {
  url: string;
  sessionId: string;
  hideControls?: boolean;
}

enum EventType {
  Play = "play",
  Pause = "pause",
  Buffer = "buffer",
  Progress = "progress",
  End = "end",
  Seek = "seek",
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  hideControls,
  sessionId,
}) => {
  const [playing, setPlaying] = useState(true);
  const [seek, setSeek] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const player = useRef<ReactPlayer>(null);

  ws.addEventListener("message", (event) => {
    const { sessionId, type, data } = JSON.parse(event.data);
    switch (type) {
      case "play":
        setPlaying(true);
        break;
      case "pause":
        setPlaying(false);
        break;
      case "seek":
        player.current?.seekTo(data.seek, "seconds");
        break;
      default:
        break;
    }
  });

  const writeEvent = async function (type: EventType, data?: Object) {
    ws.send(JSON.stringify({ sessionId, type, data }));
    return axios.post(`/api/sessions/${sessionId}/events`, {
      sessionId,
      type,
      timestamp: player.current?.getCurrentTime(),
      ...(data && data),
    });
  };

  const handleReady = () => {
    setIsReady(true);
  };

  const handleSeek = async () => {
    // Ideally, the seek event would be fired whenever the user moves the built in Youtube video slider to a new timestamp.
    // However, the youtube API no longer supports seek events (https://github.com/cookpete/react-player/issues/356), so this no longer works

    // You'll need to find a different way to detect seeks (or just write your own seek slider and replace the built in Youtube one.)
    // Note that when you move the slider, you still get play, pause, buffer, and progress events, can you use those?
    await writeEvent(EventType.Seek, { seek });
    player.current?.seekTo(seek, "seconds");
  };

  const handleEnd = async () => {
    await writeEvent(EventType.End);
  };

  const handlePlay = async () => {
    await writeEvent(EventType.Play);
  };

  const handlePause = async () => {
    await writeEvent(EventType.Pause);
  };

  const handleBuffer = async () => {
    await writeEvent(EventType.Buffer);
  };

  const handleProgress = async (state: {
    played: number;
    playedSeconds: number;
    loaded: number;
    loadedSeconds: number;
  }) => {
    console.log("state: ", state);
    await writeEvent(EventType.Progress, state);
  };

  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
    >
      <Box
        width="100%"
        height="100%"
        display={playing ? "flex" : "none"}
        flexDirection="column"
      >
        <ReactPlayer
          ref={player}
          url={url}
          playing={playing}
          controls={!hideControls}
          onReady={handleReady}
          onEnded={handleEnd}
          onSeek={handleSeek}
          onPlay={handlePlay}
          onPause={handlePause}
          onBuffer={handleBuffer}
          onProgress={handleProgress}
          width="100%"
          height="100%"
          style={{ pointerEvents: hideControls ? "none" : "auto" }}
        />
      </Box>
      {!playing && isReady && (
        // Youtube doesn't allow autoplay unless you've interacted with the page already
        // So we make the user click "Join Session" button and then start playing the video immediately after
        // This is necessary so that when people join a session, they can seek to the same timestamp and start watching the video with everyone else
        <Button
          variant="contained"
          size="large"
          onClick={() => setPlaying(true)}
        >
          Watch Session
        </Button>
      )}
      <input
        value={seek}
        onChange={(e) => setSeek(e.target.value as any)}
        type="text"
      ></input>
      <button onClick={handleSeek}>seek (in seconds)</button>
    </Box>
  );
};

export default VideoPlayer;
