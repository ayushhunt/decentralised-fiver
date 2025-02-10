"use client";

import { Appbar } from '@/components/Appbar';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

async function fetchTaskDetails(taskId: string) {
  const token = localStorage.getItem("token"); // Ensure this runs in the browser
  if (!token) {
    throw new Error("User is not authenticated");
  }

  const response = await axios.get(`http://localhost:3001/v1/user/task?taskId=${taskId}`, {
    headers: {
      Authorization: token,
    },
  });
  return response.data;
}

export default function Page({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = React.use(params); // Unwrap `params` promise
  const [result, setResult] = useState<
    Record<string, { count: number; option: { imageUrl: string } }>
  >({});
  const [taskDetails, setTaskDetails] = useState<{ title?: string }>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTaskDetails(taskId)
      .then((data) => {
        setResult(data.result);
        setTaskDetails(data.tasks);
      })
      .catch((err) => setError(err.message));
  }, [taskId]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <Appbar />
      <div className="text-2xl pt-20 flex justify-center">
        {taskDetails.title || "Loading..."}
      </div>
      <div className="flex justify-center pt-8">
        {Object.keys(result || {}).map((key) => (
          <Task
            key={key}
            imageUrl={result[key].option.image_url}
            votes={result[key].count}
          />
        ))}
      </div>
    </div>
  );
}

function Task({ imageUrl, votes }: { imageUrl: string; votes: number }) {
  return (
    <div>
      <img className="p-2 w-96 rounded-md" src={imageUrl} alt="Task Option" />
      <div className="flex justify-center">{votes}</div>
    </div>
  );
}
