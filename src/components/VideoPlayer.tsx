import { Box, Button, Card, IconButton, Stack } from "@mui/material";
import React, { useRef, useState } from "react";
import ReactPlayer from "react-player";

interface VideoPlayerProps {
  url: string;
  hideControls?: boolean;
}

const ws = new WebSocket("ws://localhost:8000");

enum EventType {
  Ready = "ready",
  Play = "play",
  Pause = "pause",
  Buffer = "buffer",
  Progress = "progress",
  End = "end",
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, hideControls }) => {
  const [hasJoined, setHasJoined] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  // used to make sure that no update is sent to the
  // server from this instance until initialization is complete.
  const [initialized, setInitialized] = useState(false);
  const player = useRef<ReactPlayer>(null);

  // used to prevent `seek` handler from firing too rapidly.
  var lastSeeked = new Date();

  ws.addEventListener("message", (event) => {
    const { type, data } = JSON.parse(event.data);
    // console.log("receviedEvent: ", type, data);
    switch (type) {
      case "play":
        setPlaying(true);
        break;
      case "pause":
        setPlaying(false);
        break;
      // hack to overcome the absence of easy ways to
      // detect the `seek` event.
      case "buffer":
        // if it's been 2 seconds since last time we seek-ed.
        const { position } = JSON.parse(data);
        if ((new Date() as any) - (lastSeeked as any) > 2000) {
          lastSeeked = new Date();
          player.current?.seekTo(position, "seconds");
          setPlaying(true);
        }
        break;
      case "init":
        player.current?.seekTo(data?.position || 0, "seconds");
        setPlaying(data?.playing || false);
        setInitialized(true);
        break;
      default:
        break;
    }
  });

  const sendEvent = async (type: EventType, data?: Object) => {
    console.log("sentEvent: ", type, data, initialized);
    if (!initialized) {
      return;
    }
    ws.send(JSON.stringify({ type, data }));
  };

  const handleReady = () => {
    setIsReady(true);
    ws.send(JSON.stringify({ type: "init" }));
    sendEvent(EventType.Ready);
  };

  const handleEnd = () => {
    sendEvent(EventType.End);
  };

  const handleSeek = (seconds: number) => {
    // Ideally, the seek event would be fired whenever the user moves the built in Youtube video slider to a new timestamp.
    // However, the youtube API no longer supports seek events (https://github.com/cookpete/react-player/issues/356), so this no longer works

    // You'll need to find a different way to detect seeks (or just write your own seek slider and replace the built in Youtube one.)
    // Note that when you move the slider, you still get play, pause, buffer, and progress events, can you use those?

    console.log(
      "This never prints because seek decetion doesn't work: ",
      seconds
    );
  };

  const handlePlay = () => {
    sendEvent(EventType.Play);
  };

  const handlePause = () => {
    sendEvent(EventType.Pause);
  };

  const handleBuffer = () => {
    sendEvent(
      EventType.Buffer,
      JSON.stringify({
        position: player.current?.getCurrentTime(),
        playing,
      })
    );
  };

  const handleProgress = (state: {
    played: number;
    playedSeconds: number;
    loaded: number;
    loadedSeconds: number;
  }) => {
    sendEvent(EventType.Progress, JSON.stringify(state));
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
        display={hasJoined ? "flex" : "none"}
        flexDirection="column"
      >
        <ReactPlayer
          ref={player}
          url={url}
          playing={hasJoined && playing}
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
      {!hasJoined && isReady && (
        // Youtube doesn't allow autoplay unless you've interacted with the page already
        // So we make the user click "Join Session" button and then start playing the video immediately after
        // This is necessary so that when people join a session, they can seek to the same timestamp and start watching the video with everyone else
        <Button
          variant="contained"
          size="large"
          onClick={() => setHasJoined(true)}
        >
          Watch Session
        </Button>
      )}
    </Box>
  );
};

export default VideoPlayer;
