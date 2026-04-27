"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const router = useRouter();

  async function handleLogin(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const res = await fetch(
      "/api/admin/login",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json"
        },
        body: JSON.stringify({
          password
        })
      }
    );

    if (!res.ok) {
      setError("Invalid password");
      return;
    }

    router.push("/admin");
  }

return (
  <div className="min-h-screen flex items-center justify-center">
    <form
      onSubmit={handleLogin}
      className="space-y-4 w-full max-w-sm p-8"
    >
      <h1 className="text-xl font-semibold text-center">Admin Login</h1>

      <input
        type="password"
        placeholder="Admin password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
      />

      <button
        type="submit"
        className="w-full bg-amber-700 text-white py-2 rounded hover:bg-amber-800 transition"
      >
        Login
      </button>

      {error && <p className="text-red-600 text-sm">{error}</p>}
    </form>
  </div>
);
}