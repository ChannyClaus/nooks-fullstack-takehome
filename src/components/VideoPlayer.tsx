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

// thank you stackoverflow: https://stackoverflow.com/questions/20281546/how-to-prevent-calling-of-en-event-handler-twice-on-fast-clicks
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
const debounce = function (func: any, wait: any, immediate?: any) {
  var timeout: any;
  return function () {
    var context = this,
      args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, hideControls }) => {
  const [hasJoined, setHasJoined] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const player = useRef<ReactPlayer>(null);

  ws.addEventListener("message", (event) => {
    const { type, data } = JSON.parse(event.data);
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
        debounce(() => {
          player.current?.seekTo(data.position, "seconds");
          setPlaying(true);
        }, 2000);
        break;
      default:
        break;
    }
  });

  const handleReady = () => {
    setIsReady(true);
    ws.send(JSON.stringify({ type: EventType.Ready }));
  };

  const handleEnd = () => {
    ws.send(JSON.stringify({ type: EventType.End }));
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
    ws.send(JSON.stringify({ type: EventType.Play }));
  };

  const handlePause = () => {
    ws.send(JSON.stringify({ type: EventType.Pause }));
  };

  const handleBuffer = () => {
    ws.send(
      JSON.stringify({
        type: EventType.Buffer,
        data: { position: player.current?.getCurrentTime(), playing },
      })
    );
  };

  const handleProgress = (state: {
    played: number;
    playedSeconds: number;
    loaded: number;
    loadedSeconds: number;
  }) => {
    ws.send(JSON.stringify({ type: EventType.Progress, data: state }));
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
