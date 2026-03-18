"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import {
  loginInputSchema,
  registerInputSchema,
  type LoginInput,
  type RegisterInput,
} from "@cpv/contracts/auth";
import { webEnv } from "@cpv/config/web";
import { storeAuthToken, submitAuthForm } from "../../lib/auth";

type AuthMode = "login" | "register";
type AuthFieldErrors = Partial<
  Record<"email" | "username" | "password", string>
>;
type AuthFormValues = {
  email: string;
  password: string;
  username?: string;
};
type ValidationIssue = {
  message: string;
  path: Array<string | number>;
};

const initialValues: Record<AuthMode, AuthFormValues> = {
  login: {
    email: "",
    password: "",
  },
  register: {
    email: "",
    username: "",
    password: "",
  },
};

const endpointByMode: Record<AuthMode, string> = {
  login: `${webEnv.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`,
  register: `${webEnv.NEXT_PUBLIC_API_BASE_URL}/api/auth/register`,
};

export const FormShell = () => {
  const [mode, setMode] = useState<AuthMode>("register");
  const [values, setValues] =
    useState<Record<AuthMode, AuthFormValues>>(initialValues);
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const currentValues = values[mode];
  const schema = useMemo(
    () => (mode === "register" ? registerInputSchema : loginInputSchema),
    [mode],
  );

  const updateField = (field: keyof AuthFormValues, value: string) => {
    setValues((current: Record<AuthMode, AuthFormValues>) => ({
      ...current,
      [mode]: {
        ...current[mode],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);
    setErrors({});

    const candidate: LoginInput | RegisterInput =
      mode === "register"
        ? {
            email: currentValues.email,
            username: currentValues.username ?? "",
            password: currentValues.password,
          }
        : {
            email: currentValues.email,
            password: currentValues.password,
          };

    const parsed = schema.safeParse(candidate);

    if (!parsed.success) {
      const nextErrors = (
        parsed.error.issues as ValidationIssue[]
      ).reduce<AuthFieldErrors>((accumulator, issue) => {
        const path = issue.path[0];

        if (path === "email" || path === "username" || path === "password") {
          accumulator[path] = issue.message;
        }

        return accumulator;
      }, {});

      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitAuthForm(endpointByMode[mode], parsed.data);
      storeAuthToken(response.token);
      router.push("/profile");
      router.refresh();
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Unable to complete the request.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <div className="flex rounded-2xl border border-white/10 bg-white/5 p-1">
        {(["register", "login"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setMode(item);
              setErrors({});
              setServerError(null);
            }}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition ${
              mode === item
                ? "bg-cyan-400 text-slate-950"
                : "text-slate-300 hover:text-white"
            }`}
          >
            {item === "register" ? "Create account" : "Sign in"}
          </button>
        ))}
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
        <Field
          label="Email"
          name="email"
          type="email"
          placeholder="player@cpv.gg"
          value={currentValues.email}
          error={errors.email}
          onChange={(value) => updateField("email", value)}
        />

        <AnimatePresence initial={false}>
          {mode === "register" ? (
            <motion.div
              key="username"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Field
                label="Username"
                name="username"
                type="text"
                placeholder="battle_ready"
                value={currentValues.username ?? ""}
                error={errors.username}
                onChange={(value) => updateField("username", value)}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <Field
          label="Password"
          name="password"
          type="password"
          placeholder="At least 8 characters with letters and numbers"
          value={currentValues.password}
          error={errors.password}
          onChange={(value) => updateField("password", value)}
        />

        {serverError ? (
          <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {serverError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? "Please wait…"
            : mode === "register"
              ? "Create CPV account"
              : "Enter arena"}
        </button>
      </form>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
        <p className="font-medium text-white">Platform foundation</p>
        <p className="mt-1">
          Registration, login, JWT session validation, and the baseline
          competitive profile are now available.
        </p>
        <p className="mt-3 text-slate-400">
          After authentication you&apos;ll land on a protected profile page that
          proves token validation is working end-to-end.
        </p>
      </div>

      <p className="mt-6 text-sm text-slate-400">
        Want a quick look first?{" "}
        <Link href="/" className="text-cyan-300 hover:text-cyan-200">
          Return to the launchpad
        </Link>
        .
      </p>
    </div>
  );
};

type FieldProps = {
  error?: string;
  label: string;
  name: string;
  onChange: (value: string) => void;
  placeholder: string;
  type: string;
  value: string;
};

const Field = ({
  error,
  label,
  name,
  onChange,
  placeholder,
  type,
  value,
}: FieldProps) => {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-200">
        {label}
      </span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
      />
      {error ? (
        <span className="mt-2 block text-sm text-rose-300">{error}</span>
      ) : null}
    </label>
  );
};
