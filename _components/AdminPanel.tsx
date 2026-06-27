"use client";

const AdminPanel = () => {
  const subscribe = async () => {
    const subscribeResponse = await fetch("/api/subscribe", {
      method: "POST",
    }).then(async (response) => await response.json());

    console.log("subscribeResponse", subscribeResponse);
  };

  return (
    <div>
      <button onClick={subscribe}>subscribe</button>
    </div>
  );
};

export default AdminPanel;
