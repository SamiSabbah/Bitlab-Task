import { useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import Spinner from "./ui/spinner";
import { useUser } from "@/lib/useAuth";

export function VoiceRecorder({ setRecordings }) {
  const { user } = useUser();
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const recordingIdRef = useRef<number | null>(null);
  console.log("user", user);

  const startRecording = async () => {
    try {
      setLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;

      // Connect to WebSocket
      const socket = io(process.env.NEXT_PUBLIC_API_URL + "/audio", {
        withCredentials: true,
      });
      socketRef.current = socket;

      // 1. Ask server to start a new recording and get the ID
      socket.emit("startRecording", {}, (response: any) => {
        setLoading(false);
        recordingIdRef.current = Number(response);

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0 && recordingIdRef.current) {
            e.data.arrayBuffer().then((buffer) => {
              socket.emit("audioChunk", {
                recordingId: recordingIdRef.current,
                chunk: Array.from(new Uint8Array(buffer)),
              });
            });
          }
        };

        mediaRecorder.start(1000); // send chunk every 1s
        setRecording(true);
      });
    } catch (error) {
      console.log("error", error);
    } finally {
      setLoading(false);
    }
  };

  const stopRecording = () => {
    if (recordingIdRef.current && socketRef.current) {
      socketRef.current.emit("stopRecording", {
        recordingId: recordingIdRef.current,
      });
      setRecordings((prev) => [
        ...prev,
        {
          id: recordingIdRef.current,
          userId: user.userId,
          createdAt: "2025-07-10T13:12:31.203Z",
        },
      ]);
    }
    mediaRecorderRef.current?.stop();
    socketRef.current?.disconnect();
    setRecording(false);
    recordingIdRef.current = null;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        onClick={recording ? stopRecording : startRecording}
        disabled={loading}
      >
        {loading && <Spinner />}
        {recording ? "Stop Recording" : "Start Recording"}
      </Button>
    </div>
  );
}
