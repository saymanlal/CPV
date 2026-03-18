"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import type { AuthUser } from "@cpv/contracts/auth";
import { webEnv } from "@cpv/config/web";
import {
  clearAuthToken,
  fetchProfile,
  getStoredAuthToken,
} from "../../lib/auth";

type ProfileState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; user: AuthUser };

export const ProfilePanel = () => {
  const [state, setState] = useState<ProfileState>({ status: "loading" });

  useEffect(() => {
    const token = getStoredAuthToken();

    if (!token) {
      setState({
        status: "error",
        message:
          "You are not signed in yet. Create an account or log in to access your profile.",
      });
      return;
    }

    void fetchProfile(webEnv.NEXT_PUBLIC_API_BASE_URL, token)
      .then((response) => {
        setState({ status: "ready", user: response.user });
      })
      .catch((error) => {
        clearAuthToken();
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Unable to load your profile.",
        });
      });
  }, []);

  if (state.status === "loading") {
    return (
      <Card
        title="Loading profile"
        body="Validating your JWT and fetching your latest CPV profile…"
      />
    );
  }

  if (state.status === "error") {
    return (
      <Card
        title="Authentication required"
        body={state.message}
        footer={
          <Link href="/auth" className="text-cyan-300 hover:text-cyan-200">
            Go to auth
          </Link>
        }
      />
    );
  }

  const { user } = state;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]"
    >
      <Card
        title={user.username}
        body="Your identity layer is ready for the problem engine, future matchmaking, ratings, battles, and progression systems."
        footer={
          <button
            type="button"
            onClick={() => {
              clearAuthToken();
              window.location.href = "/auth";
            }}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300/40 hover:text-white"
          >
            Sign out
          </button>
        }
      >
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Stat label="Email" value={user.email} />
          <Stat label="Rating" value={String(user.rating)} />
          <Stat label="Role" value={user.role} />
          <Stat
            label="Created"
            value={new Date(user.createdAt).toLocaleDateString()}
          />
        </div>
      </Card>

      <Card
        title="What your profile unlocks"
        body="Your account now powers submissions, history, and future head-to-head progression systems."
      >
        <ul className="mt-6 space-y-3 text-sm leading-6 text-slate-300">
          <li>• JWT-authenticated requests for protected APIs.</li>
          <li>
            • Server-side password hashing and duplicate-account protection.
          </li>
          <li>
            • Persistent user records ready for problems, ratings, submission
            history, and match history.
          </li>
        </ul>
      </Card>
    </motion.section>
  );
};

type CardProps = {
  body: string;
  children?: ReactNode;
  footer?: ReactNode;
  title: string;
};

const Card = ({ body, children, footer, title }: CardProps) => (
  <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur">
    <h2 className="text-2xl font-semibold text-white">{title}</h2>
    <p className="mt-3 text-sm leading-6 text-slate-300">{body}</p>
    {children}
    {footer ? <div className="mt-6">{footer}</div> : null}
  </div>
);

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
      {label}
    </p>
    <p className="mt-2 text-base font-medium text-white">{value}</p>
  </div>
);
