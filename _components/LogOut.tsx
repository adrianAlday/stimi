"use client";

import { cookieName } from "@/app/_utils/cookies";
import { redirect } from "next/navigation";

const deleteCookie = async () => {
  if ("cookieStore" in window) {
    await window.cookieStore.delete(cookieName);

    redirect("/signup");
  }
};

const LogOut = () => {
  return (
    <button onClick={deleteCookie} className="p-4 text-xs">
      log out
    </button>
  );
};

export default LogOut;
