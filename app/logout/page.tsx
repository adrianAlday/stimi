"use client";

import { useEffect } from "react";
import { redirect, useRouter } from "next/navigation";
import { cookieName } from "../_utils/cookies";

const LogoutPage = () => {
  const router = useRouter();

  useEffect(() => {
    const deleteCookie = async () => {
      if ("cookieStore" in window) {
        await window.cookieStore.delete(cookieName);

        redirect("/signup");
      }
    };

    deleteCookie();
  }, [router]);
};

export default LogoutPage;
