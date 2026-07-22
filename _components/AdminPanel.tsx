"use client";

const AdminPanel = () => {
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
    <div>
      <div>webhook subscription</div>

      <div>
        <button onClick={postSubscription}>post</button>
      </div>

      <div>
        <button onClick={getSubscription}>get</button>
      </div>

      <div>
        <button onClick={deleteSubscription}>delete</button>
      </div>
    </div>
  );
};

export default AdminPanel;
