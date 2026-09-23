import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FORMULA, runDemoRecon, runPicture, type AffResult } from "./engine";
import { verifyGhanaCard } from "./identity";
import { assembleCreditReport, runPipeline, type CreditReport } from "./credit";

export type Role = "customer" | "partner" | "ops";

export type User = {
  id: string;
  phone: string;
  pin: string;
  name: string;
  role: Role;
  profile: "informal" | "salary";
  partner: string;
  eulaAt: string | null;
  privacyAt: string | null;
  consents: { credit: boolean; affordability: boolean; fraud: boolean; servicing: boolean };
  identityStatus: string;
  niaReference: string | null;
  momoLinked: boolean;
};

export type Application = {
  id: string;
  customerName: string;
  customerPhone: string;
  profile: "informal" | "salary";
  askedMinor: number;
  termWeeks: number;
  askPurpose: string;
  partnerAmountMinor: number;
  partnerPack: string;
  status: string;
  trustFloor: { recommendedMinor: number; outcome: string; reasonCodes: string[]; formula: string };
  gate: { outcome: string; reason: string; detail: string };
  report?: CreditReport;
};

export type Payment = { id: string; status: "UNKNOWN" | "SUCCEEDED" | "FAILED"; amountMinor: number };
export type SupportCase = { id: string; category: string; priority: string; slaDueAt: string; status: string };

const SEED: User[] = [
  {
    id: "u1",
    phone: "0241112222",
    pin: "2468",
    name: "Akosua Mensah",
    role: "customer",
    profile: "informal",
    partner: "Example Microcredit",
    eulaAt: new Date().toISOString(),
    privacyAt: new Date().toISOString(),
    consents: { credit: true, affordability: true, fraud: true, servicing: true },
    identityStatus: "VERIFIED",
    niaReference: "NIA-DEMO-SEEDED",
    momoLinked: true,
  },
  {
    id: "u2",
    phone: "0243334444",
    pin: "2468",
    name: "Kwame Owusu",
    role: "customer",
    profile: "salary",
    partner: "Example Microcredit",
    eulaAt: new Date().toISOString(),
    privacyAt: new Date().toISOString(),
    consents: { credit: true, affordability: true, fraud: true, servicing: true },
    identityStatus: "VERIFIED",
    niaReference: "NIA-DEMO-SEEDED",
    momoLinked: true,
  },
  {
    id: "u3",
    phone: "0200000001",
    pin: "1357",
    name: "Ama Mensah",
    role: "partner",
    profile: "salary",
    partner: "Example Microcredit",
    eulaAt: new Date().toISOString(),
    privacyAt: new Date().toISOString(),
    consents: { credit: true, affordability: true, fraud: false, servicing: false },
    identityStatus: "VERIFIED",
    niaReference: null,
    momoLinked: false,
  },
  {
    id: "u4",
    phone: "0200000002",
    pin: "1357",
    name: "Yaw Boateng",
    role: "ops",
    profile: "salary",
    partner: "Trust",
    eulaAt: new Date().toISOString(),
    privacyAt: new Date().toISOString(),
    consents: { credit: false, affordability: false, fraud: false, servicing: false },
    identityStatus: "VERIFIED",
    niaReference: null,
    momoLinked: false,
  },
];

function digits(phone: string) {
  return phone.replace(/\D/g, "");
}

function onboardView(user: User): string {
  if (!user.eulaAt) return "eula";
  if (!user.privacyAt) return "privacy";
  if (!user.consents.credit || !user.consents.affordability) return "consents";
  if (user.identityStatus !== "VERIFIED") return "identity";
  if (!user.momoLinked) return "connect";
  if (user.role === "partner") return "partner";
  if (user.role === "ops") return "ops";
  return "home";
}

function nextView(user: User | null) {
  if (!user) return "gate";
  return onboardView(user);
}

type State = {
  view: string;
  rolePick: Role | null;
  phone: string;
  pendingName: string;
  pendingPhone: string;
  error: string;
  user: User | null;
  users: User[];
  applications: Application[];
  payments: Payment[];
  cases: SupportCase[];
  lastOffer: Application | null;
  selectedId: string | null;
  setView: (view: string) => void;
  setRole: (role: Role) => void;
  login: (phone: string, pin: string) => void;
  register: (phone: string, name: string) => void;
  confirmOtp: (otp: string) => void;
  setPin: (pin: string) => void;
  acceptLegal: (kind: "eula" | "privacy") => void;
  saveConsents: (c: User["consents"]) => void;
  verifyId: (pin: string, last: string, live: boolean, bio: boolean) => void;
  connectWallet: () => void;
  submitAsk: (amountMinor: number, termWeeks: number, purpose: string) => void;
  acceptOffer: () => void;
  openReport: (id: string) => void;
  pay: () => void;
  openCase: (category: string) => void;
  logout: () => void;
};

export const useTrust = create<State>()(
  persist(
    (set, get) => ({
      view: "gate",
      rolePick: null,
      phone: "",
      pendingName: "",
      pendingPhone: "",
      error: "",
      user: null,
      users: SEED,
      applications: [],
      payments: [],
      cases: [],
      lastOffer: null,
      selectedId: null,
      setView: (view) => set({ view, error: "" }),
      setRole: (role) => set({ rolePick: role, view: "login", error: "", phone: "" }),
      login: (phone, pin) => {
        const role = get().rolePick;
        const found = get().users.find(
          (u) => digits(u.phone) === digits(phone) && u.pin === pin && (!role || u.role === role),
        );
        if (!found) {
          set({ error: "Number and PIN do not match this login." });
          return;
        }
        set({ user: found, phone: found.phone, view: onboardView(found), error: "" });
      },
      register: (phone, name) => {
        if (!name.trim() || digits(phone).length < 10) {
          set({ error: "Name and a Ghana mobile number are required." });
          return;
        }
        set({ pendingName: name.trim(), pendingPhone: phone, view: "otp", error: "" });
      },
      confirmOtp: (otp) => {
        if (otp !== "123456") {
          set({ error: "Use demo code 123456." });
          return;
        }
        set({ view: "setpin", error: "" });
      },
      setPin: (pin) => {
        if (!/^\d{4}$/.test(pin)) {
          set({ error: "PIN must be 4 digits." });
          return;
        }
        const user: User = {
          id: "u" + Date.now(),
          phone: get().pendingPhone,
          pin,
          name: get().pendingName,
          role: "customer",
          profile: "informal",
          partner: "Example Microcredit",
          eulaAt: null,
          privacyAt: null,
          consents: { credit: false, affordability: false, fraud: false, servicing: false },
          identityStatus: "UNVERIFIED",
          niaReference: null,
          momoLinked: false,
        };
        set({ user, users: [...get().users, user], view: "eula", error: "" });
      },
      acceptLegal: (kind) => {
        const user = get().user;
        if (!user) return;
        const next = { ...user, [kind === "eula" ? "eulaAt" : "privacyAt"]: new Date().toISOString() };
        set({ user: next, users: get().users.map((u) => (u.id === next.id ? next : u)), view: onboardView(next) });
      },
      saveConsents: (c) => {
        if (!c.credit || !c.affordability) {
          set({ error: "Credit and affordability consent are required to ask." });
          return;
        }
        const user = get().user;
        if (!user) return;
        const next = { ...user, consents: c };
        set({ user: next, users: get().users.map((u) => (u.id === next.id ? next : u)), view: onboardView(next), error: "" });
      },
      verifyId: (pin, last, live, bio) => {
        const user = get().user;
        if (!user) return;
        const result = verifyGhanaCard({
          pin,
          firstName: user.name.split(" ")[0],
          lastName: last,
          livenessPassed: live,
          biometricPassed: bio,
        });
        if (result.status !== "VERIFIED") {
          set({ error: result.reason });
          return;
        }
        const next = { ...user, identityStatus: "VERIFIED", niaReference: result.niaReference };
        set({ user: next, users: get().users.map((u) => (u.id === next.id ? next : u)), view: onboardView(next), error: "" });
      },
      connectWallet: () => {
        const user = get().user;
        if (!user) return;
        const next = { ...user, momoLinked: true };
        set({ user: next, users: get().users.map((u) => (u.id === next.id ? next : u)), view: "home", error: "" });
      },
      submitAsk: (amountMinor, termWeeks, purpose) => {
        const user = get().user;
        if (!user) return;
        if (!user.consents.credit || !user.consents.affordability) {
          set({ error: "Credit and affordability consent required." });
          return;
        }
        const consentsOk = true;
        const pipe = runPipeline({
          identityStatus: user.identityStatus,
          profile: user.profile,
          askedMinor: amountMinor,
          consentsOk,
        });
        const rec = pipe.floorMinor;
        const report = assembleCreditReport({
          name: user.name,
          phone: user.phone,
          profile: user.profile,
          identityStatus: user.identityStatus,
          niaReference: user.niaReference,
          askedMinor: amountMinor,
          recommendedMinor: rec,
          termWeeks,
          askPurpose: purpose,
          consentsOk,
        });
        const status = pipe.gate.outcome === "APPROVE_WITH_CONDITIONS" && rec > 0 ? "OFFERED" : pipe.gate.outcome;
        const app: Application = {
          id: "a" + Date.now(),
          customerName: user.name,
          customerPhone: user.phone,
          profile: user.profile,
          askedMinor: amountMinor,
          termWeeks,
          askPurpose: purpose,
          partnerAmountMinor: rec,
          partnerPack: user.profile === "informal" ? "INFORMAL_NANO_01" : "SALARY_01",
          status,
          trustFloor: {
            recommendedMinor: rec,
            outcome: pipe.aff.outcome,
            reasonCodes: pipe.aff.reasonCodes,
            formula: FORMULA,
          },
          gate: pipe.gate,
          report,
        };
        set({ applications: [...get().applications, app], lastOffer: app, selectedId: app.id, view: "offer", error: "" });
      },
      acceptOffer: () => {
        const app = get().lastOffer;
        if (!app || app.trustFloor.recommendedMinor <= 0) return;
        const next: Application = {
          ...app,
          status: "ACCEPTED",
          report: app.report
            ? { ...app.report, submission: { status: "SUBMITTED", storeIn: "credit_reporting.submission" } }
            : app.report,
        };
        set({
          lastOffer: next,
          applications: get().applications.map((a) => (a.id === next.id ? next : a)),
          view: "loans",
        });
      },
      openReport: (id) => set({ selectedId: id, view: "report" }),
      pay: () => {
        const last = get().payments[get().payments.length - 1];
        if (last?.status === "UNKNOWN") {
          set({ view: "pay", error: "Do not pay again. This is still UNKNOWN." });
          return;
        }
        const acc = get().applications.find((a) => a.status === "ACCEPTED");
        const pay: Payment = {
          id: "pay" + Date.now(),
          status: "UNKNOWN",
          amountMinor: acc ? Math.floor(acc.partnerAmountMinor * 0.28) : 22400,
        };
        set({ payments: [...get().payments, pay], view: "pay", error: "" });
      },
      openCase: (category) => {
        const due = new Date();
        due.setDate(due.getDate() + 20);
        const priority = category === "HARASSMENT" || category === "NOT_MY_LOAN" ? "P1" : "P2";
        const c: SupportCase = {
          id: "CS" + Date.now(),
          category,
          priority,
          slaDueAt: due.toISOString(),
          status: "OPEN",
        };
        const view = category === "PAYMENT_NOT_SHOWING" && get().payments.some((p) => p.status === "UNKNOWN") ? "pay" : "help";
        set({ cases: [...get().cases, c], view, error: view === "pay" ? "Complaint opened. Do not pay again." : "" });
      },
      logout: () => set({ user: null, rolePick: null, view: "gate", error: "", lastOffer: null }),
    }),
    {
      name: "trust-app",
      skipHydration: true,
      partialize: (s) => ({
        user: s.user,
        users: s.users,
        applications: s.applications,
        payments: s.payments,
        cases: s.cases,
        lastOffer: s.lastOffer,
        phone: s.phone,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.user) state.view = nextView(state.user);
      },
    },
  ),
);

export function currentPicture(user: User | null) {
  return runPicture(user?.profile ?? "informal").picture;
}

export function qualityReport() {
  return { informal: runPicture("informal").picture, salary: runPicture("salary").picture };
}

export function customerTrust(
  user: User | null,
  payments: Payment[] = [],
  cases: SupportCase[] = [],
) {
  const factors = [
    { id: "id", label: "Ghana Card verified", ok: user?.identityStatus === "VERIFIED", pts: 25 },
    { id: "wallet", label: "Mobile money connected", ok: Boolean(user?.momoLinked), pts: 15 },
    {
      id: "consent",
      label: "Credit and affordability consents on",
      ok: Boolean(user?.consents.credit && user?.consents.affordability),
      pts: 15,
    },
    {
      id: "fresh",
      label: "Profile is current",
      ok: Boolean(user?.eulaAt && user?.privacyAt),
      pts: 10,
    },
    {
      id: "pay",
      label: "No failed payment",
      ok: !payments.some((p) => p.status === "FAILED"),
      pts: 15,
    },
    {
      id: "help",
      label: "No priority complaint",
      ok: !cases.some((c) => c.priority === "P1" && c.status === "OPEN"),
      pts: 10,
    },
  ];
  const score = Math.min(100, 10 + factors.reduce((n, f) => n + (f.ok ? f.pts : 0), 0));
  const band = score >= 80 ? "Strong" : score >= 55 ? "Steady" : "Building";
  return {
    score,
    band,
    factors,
    note: "Your Trust Score is not a bureau score and not the partner’s risk band.",
  };
}

export { runDemoRecon };
export type { AffResult };
