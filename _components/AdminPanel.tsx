"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const AdminPanel = () => {
  const [people, setPeople] = useState(
    [] as { [key: string]: number | string }[],
  );

  useEffect(() => {
    const getIds = async () => {
      const response = await fetch("/api/people").then(
        async (response) => await response.json(),
      );

      setPeople(response.data);

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
    <div className="p-4 font-semibold lowercase">
      <div className="my-4">connected people ({people.length})</div>

      {people.length === 0 ? (
        <div>...</div>
      ) : (
        people.map((person) => (
          <div key={person.id}>
            <Link href={`/people/${person.id}`} target="_blank">
              {person.name} - {person.id}
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
