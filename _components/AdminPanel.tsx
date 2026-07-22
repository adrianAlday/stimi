"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const AdminPanel = () => {
  const [ids, setIds] = useState([] as number[]);

  useEffect(() => {
    const getIds = async () => {
      const response = await fetch("/api/people").then(
        async (response) => await response.json(),
      );

      setIds(
        response.data.map((record: { [key: string]: number }) => record.id),
      );

      return response;
    };

    getIds();
  }, []);

  const postSubscription = async () => {
    const response = await fetch("/api/subscribe", {
      method: "POST",
    }).then(async (response) => await response.json());

    console.log(response);
  };

  const getSubscription = async () => {
    const response = await fetch("/api/subscribe").then(
      async (response) => await response.json(),
    );

    console.log(response);
  };

  const deleteSubscription = async () => {
    const response = await fetch(`/api/subscribe`, {
      method: "DELETE",
    }).then(async (response) => await response.json());

    console.log(response);
  };

  return (
    <div className="p-4">
      <div className="my-4">people ({ids.length})</div>

      {ids.length === 0 ? (
        <div>...</div>
      ) : (
        ids.map((id) => (
          <div key={id}>
            <Link href={`/people/${id}`} target="_blank">
              {id}
            </Link>
          </div>
        ))
      )}

      <div className="my-4">webhook subscription</div>

      <div>
        <button onClick={postSubscription} className="cursor-pointer">
          post
        </button>
      </div>

      <div>
        <button onClick={getSubscription} className="cursor-pointer">
          get
        </button>
      </div>

      <div>
        <button onClick={deleteSubscription} className="cursor-pointer">
          delete
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;
