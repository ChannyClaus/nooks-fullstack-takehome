import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Button, TextField } from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

const CreateSession: React.FC = () => {
  const navigate = useNavigate();
  const [newUrl, setNewUrl] = useState("");

  const createSession = async () => {
    setNewUrl(newUrl);
    const sessionId = uuidv4();
    await axios.post("/api/sessions", {
      sessionId,
      link: newUrl,
    });
    navigate(`/watch/${sessionId}`);
  };

  return (
    <Box width="100%" maxWidth={600} display="flex" gap={1} marginTop={1}>
      <TextField
        label="Youtube URL"
        variant="outlined"
        value={newUrl}
        onChange={(e) => setNewUrl(e.target.value)}
        fullWidth
      />
      <Button
        disabled={!newUrl}
        onClick={createSession}
        size="small"
        variant="contained"
      >
        Create a session
      </Button>
    </Box>
  );
};

export default CreateSession;
