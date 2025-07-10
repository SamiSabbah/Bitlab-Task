"use client";
import { useEffect, useState } from "react";
import { getUserRecordings, deleteUserRecordingById } from "@/lib/recordings";
import { Button } from "@/components/ui/button";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { useUser } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import Spinner from "@/components/ui/spinner";
import { Trash } from "lucide-react";

type Chunk = { id: number; data: string; timestamp: string };
type Recording = {
  id: number;
  createdAt: string;
  chunks: Chunk[];
};

export default function DashboardPage() {
  const { user, loading } = useUser();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [getRecordeLoading, setGetRecordeLoading] = useState(true);
  const [selectedAudio, setSelectedAudio] = useState<string | null>(null);
  const [deleteRecordeLoading, setDeleteRecordeLoading] = useState<
    number | null
  >(null);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      getUserRecordings()
        .then(setRecordings)
        .finally(() => setGetRecordeLoading(false));
    }
  }, [user]);

  const playRecording = async (rec: Recording) => {
    setSelectedAudio(String(rec.id));
  };

  const onDeleteRecording = async (id: number) => {
    // Optionally, show a loading state here
    try {
      setDeleteRecordeLoading(id);
      await deleteUserRecordingById(id);
      setRecordings((prev) => prev.filter((rec) => rec.id !== id));
      if (selectedAudio === String(id)) setSelectedAudio(null);
    } catch (error) {
    } finally {
      setDeleteRecordeLoading(null);
    }
  };

  if (loading || getRecordeLoading || !user)
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <Spinner />
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Your Recordings</h1>
      <VoiceRecorder setRecordings={setRecordings} />
      {recordings.length === 0 ? (
        <div>No recordings yet.</div>
      ) : (
        <ul className="space-y-4 mt-6">
          {recordings.map((rec) => (
            <li key={rec.id} className="border p-4 rounded">
              <div>
                <strong>Recording #{rec.id}</strong>
              </div>
              <div>
                <span className="text-sm text-gray-500">
                  {new Date(rec.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex gap-2 mt-2">
                <Button onClick={() => playRecording(rec)}>Play</Button>
                {/* <Button
                  disabled={deleteRecordeLoading === rec.id}
                  variant="destructive"
                  size="icon"
                  onClick={() => onDeleteRecording(rec.id)}
                  aria-label="Delete recording"
                >
                  {deleteRecordeLoading === rec.id ? (
                    <Spinner />
                  ) : (
                    <Trash className="w-4 h-4" />
                  )}
                </Button> */}
              </div>
            </li>
          ))}
        </ul>
      )}
      {selectedAudio && (
        <audio
          src={
            process.env.NEXT_PUBLIC_API_URL +
            `/audio/recordings/${selectedAudio}`
          }
          controls
          autoPlay
          className="mt-6 w-full"
        />
      )}
    </div>
  );
}
