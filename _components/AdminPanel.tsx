"use client";

const AdminPanel = () => {
  const postSubscription = async () => {
    await fetch("/api/subscribe", {
      method: "POST",
    }).then(async (response) => await response.json());
  };

  const getSubscription = async () => {
    await fetch("/api/subscribe").then(
      async (response) => await response.json(),
    );
  };

  const deleteSubscription = async () => {
    await fetch(`/api/subscribe`, {
      method: "DELETE",
    }).then(async (response) => await response.json());
  };

  return (
    <div>
      <div>
        <button onClick={postSubscription}>post subscription</button>
      </div>

      <div>
        <button onClick={getSubscription}>get subscription</button>
      </div>

      <div>
        <button onClick={deleteSubscription}>delete subscription</button>
      </div>
    </div>
  );
};

export default AdminPanel;
