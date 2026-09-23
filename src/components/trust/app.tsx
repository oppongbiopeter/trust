import { useEffect, useState } from "react";
import {
  Landmark,
  LogOut,
  Shield,
  Smartphone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { CONNECTORS } from "@/lib/trust/engine";
import {
  currentPicture,
  customerTrust,
  qualityReport,
  runDemoRecon,
  useTrust,
  type Role,
} from "@/lib/trust/store";
import { cn, ghs } from "@/lib/utils";

function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 2.5 21 12 12 21.5 3 12Z" fill="currentColor" />
    </svg>
  );
}

function Kv({ l, r }: { l: string; r: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-2.5 last:border-0">
      <span className="text-sm text-muted-foreground">{l}</span>
      <span className="text-right text-sm font-medium tabular-nums">{r}</span>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

function Phone({ children, tabs }: { children: React.ReactNode; tabs?: React.ReactNode }) {
  return (
    <div className="relative mx-auto min-h-[min(760px,92dvh)] w-full max-w-[430px] overflow-hidden rounded-xl bg-card pb-20 shadow-[0_18px_50px_rgba(19,32,24,0.12)]">
      {children}
      {tabs}
    </div>
  );
}

function Wide({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-3xl rounded-xl bg-card p-1 pb-6 shadow-[0_18px_50px_rgba(19,32,24,0.08)]">{children}</div>;
}

function Tabs({ items, view }: { items: { id: string; label: string }[]; view: string }) {
  const setView = useTrust((s) => s.setView);
  return (
    <nav className="absolute inset-x-0 bottom-0 flex justify-around border-t border-border bg-card px-2 pb-4 pt-2">
      {items.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => setView(t.id)}
          className={cn(
            "min-h-11 min-w-11 px-2 text-xs",
            view === t.id ? "font-semibold text-primary" : "text-muted-foreground",
          )}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}

function Head({ title }: { title: string }) {
  return (
    <header className="px-6 pb-2 pt-8 text-center">
      <h1 className="font-display text-2xl font-medium tracking-tight">{title}</h1>
    </header>
  );
}

const CUST_TABS = [
  { id: "home", label: "Home" },
  { id: "money", label: "Trust" },
  { id: "loans", label: "Loans" },
  { id: "pay", label: "Pay" },
  { id: "help", label: "Help" },
];

export function TrustApp() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    void Promise.resolve(useTrust.persist.rehydrate()).finally(() => setHydrated(true));
  }, []);
  const view = useTrust((s) => s.view);
  if (!hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg text-sm text-muted-foreground">
        Trust
      </div>
    );
  }
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <div className="grid min-h-dvh lg:grid-cols-[240px_1fr]">
        <aside className="hidden bg-sidebar px-5 py-6 text-sidebar-fg lg:block">
          <div className="mb-8 flex items-center gap-2">
            <Mark className="size-4 text-sidebar-fg" />
            <span className="font-display text-lg">Trust</span>
          </div>
          <p className="mb-6 text-sm text-sidebar-fg/70">
            A Ghana lending platform. Ask here. A licensed partner provides the money.
          </p>
          <DemoAccounts />
        </aside>
        <div className="px-3 py-4 sm:px-6 sm:py-8">{renderView(view)}</div>
      </div>
    </div>
  );
}

function DemoAccounts() {
  const setRole = useTrust((s) => s.setRole);
  const items: { role: Role; title: string; phone: string; pin: string }[] = [
    { role: "customer", title: "Informal customer", phone: "0241112222", pin: "2468" },
    { role: "customer", title: "Salary customer", phone: "0243334444", pin: "2468" },
    { role: "partner", title: "Lending partner", phone: "0200000001", pin: "1357" },
    { role: "ops", title: "Trust operations", phone: "0200000002", pin: "1357" },
  ];
  return (
    <div className="grid gap-2">
      {items.map((a) => (
        <button
          key={a.phone}
          type="button"
          onClick={() => {
            useTrust.setState({ rolePick: a.role, phone: a.phone, error: "" });
            useTrust.getState().login(a.phone, a.pin);
          }}
          className="rounded-lg border border-white/10 px-3 py-3 text-left text-sm"
        >
          <div className="font-medium">{a.title}</div>
          <div className="text-xs text-sidebar-fg/60">
            {a.phone} · PIN {a.pin}
          </div>
        </button>
      ))}
      <p className="mt-3 text-xs text-sidebar-fg/50">New customer OTP 123456</p>
    </div>
  );
}

function renderView(view: string) {
  switch (view) {
    case "login":
      return <Login />;
    case "signup":
      return <Signup />;
    case "otp":
      return <Otp />;
    case "setpin":
      return <SetPin />;
    case "eula":
      return <Legal kind="eula" />;
    case "privacy":
      return <Legal kind="privacy" />;
    case "consents":
      return <Consents />;
    case "identity":
      return <Identity />;
    case "connect":
      return <Connect />;
    case "home":
      return <HomeView />;
    case "money":
      return <Money />;
    case "ask":
      return <Ask />;
    case "offer":
      return <Offer />;
    case "loans":
      return <Loans />;
    case "file":
      return <CustomerFile />;
    case "report":
      return <PartnerReport />;
    case "pay":
      return <Pay />;
    case "help":
      return <Help />;
    case "partner":
      return <Partner />;
    case "preports":
      return <PReports />;
    case "ops":
      return <Ops />;
    case "map":
      return <FlowMap />;
    default:
      return <Gate />;
  }
}

function Gate() {
  const setRole = useTrust((s) => s.setRole);
  return (
    <Phone>
      <Head title="" />
      <div className="flex flex-col items-center px-6 pt-10">
        <Mark className="mb-3 size-7 text-primary" />
        <h2 className="font-display text-3xl tracking-tight">Trust</h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">A lending platform for Ghana. Informal first.</p>
      </div>
      <div className="mt-8 grid gap-2 px-4">
        <Button onClick={() => setRole("customer")}>I need a facility</Button>
        <Button variant="outline" onClick={() => setRole("partner")}>
          I work at a lending partner
        </Button>
        <Button variant="outline" onClick={() => setRole("ops")}>
          I work Trust operations
        </Button>
      </div>
      <p className="mt-6 px-6 text-center text-xs text-muted-foreground">
        Customer, partner and ops are different logins. Sessions do not mix.
      </p>
      <div className="mt-6 px-4 lg:hidden">
        <Card className="text-sm">
          <p className="mb-2 font-medium">Demo logins</p>
          <p>Informal 0241112222 · 2468</p>
          <p>Salary 0243334444 · 2468</p>
          <p>Partner 0200000001 · 1357</p>
          <p>Ops 0200000002 · 1357</p>
        </Card>
      </div>
    </Phone>
  );
}

function Login() {
  const { rolePick, phone, error, login, setView } = useTrust();
  const [p, setP] = useState(phone);
  const [pin, setPin] = useState("");
  const title = rolePick === "partner" ? "Partner desk" : rolePick === "ops" ? "Trust ops" : "Customer";
  const hint =
    rolePick === "partner"
      ? "0200000001 · PIN 1357"
      : rolePick === "ops"
        ? "0200000002 · PIN 1357"
        : "Informal 0241112222 · 2468  ·  Salary 0243334444 · 2468";
  return (
    <Phone>
      <Head title={title} />
      <p className="px-6 text-sm text-muted-foreground">{hint}</p>
      <form
        className="grid gap-4 px-4 pt-4"
        onSubmit={(e) => {
          e.preventDefault();
          login(p, pin);
        }}
      >
        <Field label="Mobile">
          <Input inputMode="tel" value={p} onChange={(e) => setP(e.target.value)} autoComplete="username" />
        </Field>
        <Field label="PIN">
          <Input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            autoComplete="current-password"
          />
        </Field>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit">Log in</Button>
        {rolePick === "customer" ? (
          <Button type="button" variant="outline" onClick={() => setView("signup")}>
            Create customer account
          </Button>
        ) : null}
        <Button type="button" variant="ghost" onClick={() => setView("gate")}>
          Back
        </Button>
      </form>
    </Phone>
  );
}

function Signup() {
  const { error, register, setView } = useTrust();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  return (
    <Phone>
      <Head title="Create account" />
      <form
        className="grid gap-4 px-4 pt-4"
        onSubmit={(e) => {
          e.preventDefault();
          register(phone, name);
        }}
      >
        <Field label="Full name">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Mobile">
          <Input inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit">Send code</Button>
        <Button type="button" variant="ghost" onClick={() => setView("login")}>
          Back
        </Button>
      </form>
    </Phone>
  );
}

function Otp() {
  const { error, confirmOtp } = useTrust();
  const [otp, setOtp] = useState("");
  return (
    <Phone>
      <Head title="Enter code" />
      <p className="px-6 text-sm text-muted-foreground">Demo code is 123456.</p>
      <form
        className="grid gap-4 px-4 pt-4"
        onSubmit={(e) => {
          e.preventDefault();
          confirmOtp(otp);
        }}
      >
        <Field label="OTP">
          <Input inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} />
        </Field>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit">Confirm</Button>
      </form>
    </Phone>
  );
}

function SetPin() {
  const { error, setPin } = useTrust();
  const [pin, set] = useState("");
  return (
    <Phone>
      <Head title="Choose a PIN" />
      <form
        className="grid gap-4 px-4 pt-4"
        onSubmit={(e) => {
          e.preventDefault();
          setPin(pin);
        }}
      >
        <Field label="4-digit PIN">
          <Input type="password" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => set(e.target.value)} />
        </Field>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit">Save PIN</Button>
      </form>
    </Phone>
  );
}

function Legal({ kind }: { kind: "eula" | "privacy" }) {
  const acceptLegal = useTrust((s) => s.acceptLegal);
  return (
    <Phone>
      <Head title={kind === "eula" ? "Terms of use" : "Privacy notice"} />
      <Card className="mx-4 max-h-56 overflow-auto text-sm leading-relaxed text-muted-foreground">
        {kind === "eula" ? (
          <p>
            Trust is not the lender. A licensed bank or MFI originates the facility and sets the amount. Trust
            prepares a capacity file using classified salary and sales only. Wallet volume is not income. Payments
            stay UNKNOWN until they reconcile.
          </p>
        ) : (
          <p>
            We keep an NIA verification reference, not a Ghana Card image. Consents are purpose-bound and
            revocable. They do not make Trust the lender. Bureau pulls are stored as references, not as a consumer
            score product.
          </p>
        )}
      </Card>
      <div className="px-4 pt-4">
        <Button onClick={() => acceptLegal(kind)}>I agree</Button>
      </div>
    </Phone>
  );
}

function Consents() {
  const { error, saveConsents } = useTrust();
  const [c, setC] = useState({ credit: false, affordability: false, fraud: false, servicing: false });
  return (
    <Phone>
      <Head title="Data purposes" />
      <p className="px-6 text-sm text-muted-foreground">
        Each purpose is separate and revocable. Consent does not make Trust the lender.
      </p>
      <div className="mt-4 grid gap-3 px-4">
        {(
          [
            ["credit", "Credit assessment — partner file"],
            ["affordability", "Affordability / capacity file"],
            ["fraud", "Fraud and device checks"],
            ["servicing", "Application and loan servicing"],
          ] as const
        ).map(([k, label]) => (
          <label key={k} className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-3">
            <Checkbox checked={c[k]} onCheckedChange={(v) => setC({ ...c, [k]: Boolean(v) })} />
            <span className="text-sm">{label}</span>
          </label>
        ))}
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button onClick={() => saveConsents(c)}>Save</Button>
      </div>
    </Phone>
  );
}

function Identity() {
  const { user, error, verifyId } = useTrust();
  const [pin, setPin] = useState("");
  const [last, setLast] = useState(user?.name.split(" ").slice(-1)[0] ?? "");
  const [live, setLive] = useState(false);
  const [bio, setBio] = useState(false);
  return (
    <Phone>
      <Head title="Ghana Card" />
      <p className="px-6 text-sm text-muted-foreground">
        NIA biometric verification. Last four digits are not enough. Do not upload a photocopy.
      </p>
      <form
        className="mt-4 grid gap-4 px-4"
        onSubmit={(e) => {
          e.preventDefault();
          verifyId(pin, last, live, bio);
        }}
      >
        <Field label="Ghana Card PIN">
          <Input placeholder="GHA-000000001-1" value={pin} onChange={(e) => setPin(e.target.value)} />
        </Field>
        <Field label="Last name">
          <Input value={last} onChange={(e) => setLast(e.target.value)} />
        </Field>
        <label className="flex items-center gap-3 text-sm">
          <Checkbox checked={live} onCheckedChange={(v) => setLive(Boolean(v))} />
          Liveness check passed
        </label>
        <label className="flex items-center gap-3 text-sm">
          <Checkbox checked={bio} onCheckedChange={(v) => setBio(Boolean(v))} />
          Biometric match passed
        </label>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit">Verify with NIA (demo)</Button>
        <p className="text-xs text-muted-foreground">
          Demo PINs: GHA-000000001-1 Mensah · GHA-000000002-2 Owusu
        </p>
      </form>
    </Phone>
  );
}

function Connect() {
  const connectWallet = useTrust((s) => s.connectWallet);
  return (
    <Phone>
      <Head title="Connect wallet" />
      <p className="px-6 text-sm text-muted-foreground">
        MTN, Telecel or AT. Trust reads movements. Turnover is not treated as income.
      </p>
      <div className="mt-4 grid gap-2 px-4">
        <Button onClick={connectWallet}>
          <Smartphone className="size-4" /> Connect MTN MoMo
        </Button>
        <Button variant="outline" onClick={connectWallet}>
          Connect Telecel Cash
        </Button>
        <Button variant="outline" onClick={connectWallet}>
          Connect AT Money
        </Button>
      </div>
    </Phone>
  );
}

function HomeView() {
  const { user, setView, logout, applications, payments, cases } = useTrust();
  const acc = applications.find((a) => a.customerPhone === user?.phone && a.status === "ACCEPTED");
  const trust = customerTrust(user, payments, cases);
  return (
    <Phone tabs={<Tabs items={CUST_TABS} view="home" />}>
      <Head title="Home" />
      <div className="px-5">
        <p className="font-display text-2xl">Hello, {user?.name.split(" ")[0]}</p>
        <p className="text-sm text-muted-foreground">Ask here. {user?.partner} provides the money.</p>
      </div>
      <Card className="mx-4 mt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Your Trust</span>
          <Badge tone={trust.band === "Strong" ? "ok" : "default"}>{trust.band}</Badge>
        </div>
        <p className="mt-2 font-display text-4xl tabular-nums">{trust.score}</p>
        <p className="mt-1 text-xs text-muted-foreground">{trust.note}</p>
      </Card>
      <Card className="mx-4 mt-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Active facility</span>
          <Badge tone={acc ? "ok" : "default"}>{acc ? "Current" : "None"}</Badge>
        </div>
        <p className="mt-2 font-display text-2xl tabular-nums">{acc ? ghs(acc.partnerAmountMinor) : "—"}</p>
      </Card>
      <div className="mt-2 px-4">
        <Button onClick={() => setView("ask")}>Ask for a facility</Button>
        <Button variant="ghost" onClick={logout}>
          <LogOut className="size-4" /> Log out
        </Button>
      </div>
    </Phone>
  );
}

function Money() {
  const user = useTrust((s) => s.user);
  const payments = useTrust((s) => s.payments);
  const cases = useTrust((s) => s.cases);
  const pic = currentPicture(user);
  const trust = customerTrust(user, payments, cases);
  const a = pic.affordability;
  const income = pic.incomeDisplay === "UNAVAILABLE" ? "UNAVAILABLE" : ghs(pic.countedIncomeMinor);
  return (
    <Phone tabs={<Tabs items={CUST_TABS} view="money" />}>
      <Head title="Trust" />
      <Card className="mx-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Trust Score</span>
          <Badge tone={trust.band === "Strong" ? "ok" : "default"}>{trust.band}</Badge>
        </div>
        <p className="mt-2 font-display text-4xl tabular-nums">{trust.score}</p>
        <p className="mt-2 text-xs text-muted-foreground">{trust.note}</p>
        <div className="mt-3">
          {trust.factors.map((f) => (
            <Kv key={f.id} l={f.label} r={f.ok ? "Yes" : "No"} />
          ))}
        </div>
      </Card>
      <Card className="mx-4 mt-3">
        <p className="mb-1 font-medium">Money picture</p>
        <Kv l="Money that moved" r={`${ghs(pic.volumeMinor)} · not income`} />
        <Kv l="Salary classified" r={ghs(pic.salaryMinor)} />
        <Kv l="Sales classified" r={ghs(pic.salesMinor)} />
        <Kv l="Counted income" r={income} />
        <Kv l="Till / family / not income" r={ghs(pic.tillMinor)} />
        <Kv l="Must go out" r={ghs(pic.outMinor)} />
        <Kv l="Data quality" r={`${pic.dataQualityPct}%`} />
        <p className="mt-3 text-xs text-muted-foreground">
          This is your financial profile, not your Trust Score. UNAVAILABLE is not zero. {a.outcome}
        </p>
      </Card>
      <Card className="mx-4 mt-3 mb-4">
        <p className="mb-1 font-medium">Data permissions</p>
        <Kv l="Credit assessment" r={user?.consents.credit ? "On" : "Off"} />
        <Kv l="Affordability" r={user?.consents.affordability ? "On" : "Off"} />
        <Kv l="Fraud checks" r={user?.consents.fraud ? "On" : "Off"} />
        <Kv l="Servicing" r={user?.consents.servicing ? "On" : "Off"} />
      </Card>
    </Phone>
  );
}

function Ask() {
  const { error, submitAsk, user } = useTrust();
  const [amt, setAmt] = useState("800");
  const [term, setTerm] = useState("8");
  const [purpose, setPurpose] = useState("working_capital");
  return (
    <Phone tabs={<Tabs items={CUST_TABS} view="loans" />}>
      <Head title="Ask" />
      <form
        className="grid gap-4 px-4"
        onSubmit={(e) => {
          e.preventDefault();
          submitAsk(Math.round(Number(amt) * 100), Number(term), purpose);
        }}
      >
        <Field label="Amount (cedis)">
          <Input inputMode="decimal" value={amt} onChange={(e) => setAmt(e.target.value)} />
        </Field>
        <Field label="Term (weeks)">
          <select
            className="h-11 w-full rounded-md border border-border bg-card px-3"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          >
            <option value="4">4</option>
            <option value="8">8</option>
            <option value="12">12</option>
          </select>
        </Field>
        <Field label="Purpose">
          <select
            className="h-11 w-full rounded-md border border-border bg-card px-3"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          >
            <option value="working_capital">Working capital</option>
            <option value="inventory">Inventory / stock</option>
            <option value="school">School fees</option>
            <option value="other">Other</option>
          </select>
        </Field>
        <p className="text-sm text-muted-foreground">Tell us how much you need. {user?.partner ?? "The partner"} decides the final amount.</p>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit">Send ask</Button>
      </form>
    </Phone>
  );
}

function Offer() {
  const { lastOffer, acceptOffer, setView } = useTrust();
  if (!lastOffer) {
    return (
      <Phone tabs={<Tabs items={CUST_TABS} view="loans" />}>
        <Card className="m-4">No ask yet.</Card>
      </Phone>
    );
  }
  const t = lastOffer.trustFloor;
  const offered = t.recommendedMinor > 0 && lastOffer.status === "OFFERED";
  const needed = lastOffer.gate.outcome === "INFORMATION_REQUIRED" || t.outcome === "INFORMATION_REQUIRED";
  return (
    <Phone tabs={<Tabs items={CUST_TABS} view="loans" />}>
      <Head title="Your ask" />
      <Card className="mx-4">
        <Kv l="You asked" r={ghs(lastOffer.askedMinor)} />
        <Kv l="Term" r={`${lastOffer.termWeeks ?? "—"} weeks`} />
        <Kv l="Purpose" r={(lastOffer.askPurpose ?? "").replaceAll("_", " ")} />
        <Kv l="Decision" r={needed ? "Information required" : offered ? "Partner can offer" : lastOffer.gate.detail} />
        <p className="mt-3 text-sm text-muted-foreground">
          {needed
            ? "Your Trust Score can still be strong. The money picture is too thin for a partner offer. Wallet volume is not treated as income."
            : "Example Microcredit is the lender. They set the final amount."}
        </p>
      </Card>
      {offered ? (
        <div className="px-4 pt-2">
          <Button onClick={acceptOffer}>Accept {ghs(t.recommendedMinor)}</Button>
        </div>
      ) : (
        <div className="px-4 pt-2">
          <Button variant="outline" onClick={() => setView("money")}>
            Open Trust
          </Button>
        </div>
      )}
      <div className="px-4">
        <Button variant="ghost" onClick={() => setView("home")}>
          Home
        </Button>
      </div>
    </Phone>
  );
}

function Loans() {
  const { user, applications, setView } = useTrust();
  const mine = applications.filter((a) => a.customerPhone === user?.phone);
  const acc = mine.find((a) => a.status === "ACCEPTED");
  return (
    <Phone tabs={<Tabs items={CUST_TABS} view="loans" />}>
      <Head title="Loans" />
      {acc ? (
        <Card className="mx-4">
          <Kv l="Partner" r="Example Microcredit" />
          <Kv l="Amount" r={ghs(acc.partnerAmountMinor)} />
          <Kv l="Status" r={acc.status} />
          <Button className="mt-3" onClick={() => setView("pay")}>
            Pay
          </Button>
        </Card>
      ) : (
        <Card className="mx-4">
          No accepted facility yet.
          <Button className="mt-3" onClick={() => setView("ask")}>
            Ask
          </Button>
        </Card>
      )}
      {mine.length ? (
        <Card className="mx-4 mt-3">
          <p className="mb-1 font-medium">Your asks</p>
          {mine.map((a) => (
            <Kv key={a.id} l={`${ghs(a.askedMinor)} · ${(a.askPurpose ?? "").replaceAll("_", " ")}`} r={a.status} />
          ))}
        </Card>
      ) : null}
    </Phone>
  );
}

function Pay() {
  const { payments, pay } = useTrust();
  const last = payments[payments.length - 1];
  return (
    <Phone tabs={<Tabs items={CUST_TABS} view="pay" />}>
      <Head title="Pay" />
      <Card className="mx-4">
        <Kv l="Method" r="MTN MoMo" />
        {last ? (
          <>
            <Kv l="Status" r={last.status} />
            <Kv l="Id" r={last.id.slice(0, 10)} />
          </>
        ) : null}
        {last?.status === "UNKNOWN" ? (
          <p className="mt-3 text-sm text-muted-foreground">Do not pay again. This stays UNKNOWN until recon.</p>
        ) : null}
      </Card>
      {last?.status === "UNKNOWN" ? null : (
        <div className="px-4 pt-2">
          <Button onClick={pay}>Pay now</Button>
        </div>
      )}
    </Phone>
  );
}

function Help() {
  const { cases, openCase, error } = useTrust();
  const last = cases[cases.length - 1];
  const cats = [
    ["PAYMENT_NOT_SHOWING", "Payment not showing"],
    ["WRONG_AMOUNT", "Wrong amount"],
    ["NOT_MY_LOAN", "I did not take this loan"],
    ["HARASSMENT", "Harassment"],
    ["DATA", "Data"],
    ["OTHER", "Other"],
  ] as const;
  return (
    <Phone tabs={<Tabs items={CUST_TABS} view="help" />}>
      <Head title="Help" />
      <p className="px-6 text-sm text-muted-foreground">If something is wrong, you can complain here. We aim to answer in 20 days.</p>
      {error ? <p className="px-6 text-sm text-danger">{error}</p> : null}
      <div className="grid gap-2 px-4 pt-3">
        {cats.map(([id, label]) => (
          <Button key={id} variant="outline" onClick={() => openCase(id)}>
            {label}
          </Button>
        ))}
      </div>
      {last ? (
        <Card className="mx-4 mt-2">
          <Kv l="Case" r={last.id.slice(0, 10)} />
          <Kv l="Category" r={last.category} />
          <Kv l="Priority" r={last.priority} />
          <Kv l="SLA" r={last.slaDueAt.slice(0, 10)} />
        </Card>
      ) : null}
    </Phone>
  );
}

function CustomerFile() {
  const { user, applications, setView } = useTrust();
  const app = [...applications].reverse().find((a) => a.customerPhone === user?.phone);
  return (
    <Phone tabs={<Tabs items={CUST_TABS} view="loans" />}>
      <Head title="Your ask" />
      {!app ? (
        <Card className="mx-4">
          No ask yet.
          <Button className="mt-3" onClick={() => setView("ask")}>
            Ask
          </Button>
        </Card>
      ) : (
        <Card className="mx-4">
          <Kv l="Asked" r={ghs(app.askedMinor)} />
          <Kv l="Decision" r={app.gate.detail} />
          <p className="mt-3 text-sm text-muted-foreground">
            Licensed bureaux are queried for the partner, not shown as a public score here. Open Trust to see your score
            and money picture.
          </p>
          <Button className="mt-3" variant="outline" onClick={() => setView("money")}>
            Open Trust
          </Button>
        </Card>
      )}
    </Phone>
  );
}

function PartnerReport() {
  const { applications, selectedId, setView } = useTrust();
  const app = applications.find((a) => a.id === selectedId) ?? applications[applications.length - 1];
  if (!app?.report) {
    return (
      <Wide>
        <Card className="m-4">No report. A customer must send an ask with credit consent.</Card>
        <div className="px-4">
          <Button variant="ghost" className="sm:w-auto" onClick={() => setView("partner")}>
            Back
          </Button>
        </div>
      </Wide>
    );
  }
  return (
    <Wide>
      <header className="px-5 pt-6">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Credit report</p>
        <h1 className="font-display text-2xl">{app.customerName}</h1>
        <p className="text-sm text-muted-foreground">
          Partner file. Internal band is not a Trust Score. Snapshot {app.report.snapshotId}
        </p>
      </header>
      <ReportCards report={app.report} />
      <div className="px-4 pb-6">
        <Button variant="ghost" className="sm:w-auto" onClick={() => setView("partner")}>
          Back to queue
        </Button>
      </div>
    </Wide>
  );
}

function ReportCards({
  report,
  customer,
}: {
  report: import("@/lib/trust/credit").CreditReport;
  customer?: boolean;
}) {
  return (
    <div className="mt-3 grid gap-3 px-4 pb-6">
      <Card>
        <p className="font-medium">Identity</p>
        <Kv l="NIA" r={report.identity.status} />
        <Kv l="Reference" r={report.identity.niaReference ?? "—"} />
        <Kv l="Method" r={report.identity.method} />
      </Card>
      <Card>
        <p className="font-medium">Affordability</p>
        <Kv l="Formula" r={report.affordability.formula} />
        <Kv l="Outcome" r={report.affordability.outcome} />
        <Kv l="Counted income" r={report.affordability.countedDisplay === "UNAVAILABLE" ? "UNAVAILABLE" : ghs(Number(report.affordability.countedDisplay))} />
        <Kv l="Quality" r={`${report.affordability.qualityPct}%`} />
        <Kv l="Volume excluded" r={ghs(report.affordability.volumeExcludedMinor)} />
      </Card>
      <Card>
        <p className="font-medium">Credit bureaux</p>
        <p className="mb-2 text-xs text-muted-foreground">XDS, D&B and MyCredit Score. Thin file is not a zero score.</p>
        {report.bureaus.map((b) => (
          <div key={b.id} className="border-t border-border py-2">
            <div className="flex justify-between gap-2 text-sm">
              <span>{b.label}</span>
              <Badge tone={b.thinFile ? "warn" : "ok"}>{b.thinFile ? "Thin" : "Matched"}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{b.note}</p>
            {b.facilities.map((f) => (
              <Kv key={f.provider + f.product} l={`${f.provider} · ${f.product}`} r={`${ghs(f.outstandingMinor)} · ${f.status}`} />
            ))}
          </div>
        ))}
      </Card>
      {!customer ? (
        <Card>
          <p className="font-medium">Internal credit</p>
          <Kv l="Band" r={report.credit.band} />
          <Kv l="Reasons" r={report.credit.reasonCodes.join(", ")} />
          <Kv l="Fraud" r={report.fraud.action} />
          <Kv l="AML" r={report.aml.status} />
          <Kv l="Trust floor" r={ghs(report.dualRun.trustReferenceRun.floorMinor)} />
          <Kv l="Partner pack cap" r={ghs(report.dualRun.partnerPolicyRun.capMinor)} />
          <Kv l="Amount set by" r={report.dualRun.partnerPolicyRun.amountSetBy} />
          <p className="mt-2 text-xs text-muted-foreground">{report.credit.note}</p>
        </Card>
      ) : (
        <Card>
          <p className="text-sm text-muted-foreground">{report.credit.note}</p>
          <Kv l="Reporting snapshot" r={report.submission.status} />
        </Card>
      )}
      <Card>
        <p className="font-medium">Pipeline</p>
        {report.pipeline.map((s) => (
          <Kv key={s.name} l={s.name} r={`${s.status} · ${s.detail}`} />
        ))}
      </Card>
    </div>
  );
}

function Partner() {
  const { applications, setView, logout } = useTrust();
  return (
    <Wide>
      <header className="flex items-center justify-between px-5 pt-6">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <Landmark className="size-4" />
            <span className="text-xs uppercase tracking-wide">Partner</span>
          </div>
          <h1 className="font-display text-2xl">Desk</h1>
        </div>
        <Button variant="ghost" className="w-auto" onClick={logout}>
          Log out
        </Button>
      </header>
      <p className="px-5 text-sm text-muted-foreground">You originate. Trust sends the customer’s capacity file and bureau references.</p>
      <div className="mt-4 overflow-x-auto px-3">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-muted-foreground">
              <th className="px-2 py-2">Customer</th>
              <th className="px-2 py-2">Asked</th>
              <th className="px-2 py-2">Trust floor</th>
              <th className="px-2 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {applications.length ? (
              applications.map((a) => (
                <tr key={a.id} className="border-t border-border">
                  <td className="px-2 py-3">
                    <button type="button" className="text-left" onClick={() => useTrust.getState().openReport(a.id)}>
                      {a.customerName}
                      <div className="text-xs text-muted-foreground">{a.profile}</div>
                    </button>
                  </td>
                  <td className="px-2 py-3 tabular-nums">{ghs(a.askedMinor)}</td>
                  <td className="px-2 py-3 tabular-nums">
                    {ghs(a.trustFloor.recommendedMinor)}
                    <div className="text-xs text-muted-foreground">{a.trustFloor.outcome}</div>
                  </td>
                  <td className="px-2 py-3">{a.report?.credit.band ?? a.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-2 py-6 text-muted-foreground" colSpan={4}>
                  No files yet. A customer must send an ask.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-4 pt-4">
        <Button variant="outline" className="sm:w-auto" onClick={() => setView("preports")}>
          Capacity report
        </Button>
      </div>
    </Wide>
  );
}

function PReports() {
  const q = qualityReport();
  const setView = useTrust((s) => s.setView);
  const inc = (p: ReturnType<typeof currentPicture>) =>
    p.incomeDisplay === "UNAVAILABLE" ? "UNAVAILABLE" : ghs(p.countedIncomeMinor);
  return (
    <Wide>
      <header className="px-5 pt-6">
        <h1 className="font-display text-2xl">Capacity report</h1>
        <p className="text-sm text-muted-foreground">No credit score. Floor only. Partner sets the amount.</p>
      </header>
      <div className="mt-4 grid gap-3 px-4 sm:grid-cols-2">
        <Card>
          <p className="font-medium">Informal</p>
          <Kv l="Counted income" r={inc(q.informal)} />
          <Kv l="Quality" r={`${q.informal.dataQualityPct}%`} />
          <Kv l="Volume excluded" r={ghs(q.informal.affordability.volumeExcludedMinor)} />
          <Kv l="Outcome" r={q.informal.affordability.outcome} />
        </Card>
        <Card>
          <p className="font-medium">Salary</p>
          <Kv l="Counted income" r={inc(q.salary)} />
          <Kv l="Quality" r={`${q.salary.dataQualityPct}%`} />
          <Kv l="Outcome" r={q.salary.affordability.outcome} />
        </Card>
      </div>
      <div className="px-4 pt-4">
        <Button variant="ghost" className="sm:w-auto" onClick={() => setView("partner")}>
          Back to queue
        </Button>
      </div>
    </Wide>
  );
}

function Ops() {
  const { cases, logout } = useTrust();
  const recon = runDemoRecon();
  const q = qualityReport();
  const p1 = cases.filter((c) => c.priority === "P1").length;
  return (
    <Wide>
      <header className="flex items-center justify-between px-5 pt-6">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <Shield className="size-4" />
            <span className="text-xs uppercase tracking-wide">Operations</span>
          </div>
          <h1 className="font-display text-2xl">Controls</h1>
        </div>
        <Button variant="ghost" className="w-auto" onClick={logout}>
          Log out
        </Button>
      </header>
      <div className="mt-4 grid gap-3 px-4 sm:grid-cols-2">
        <Card>
          <p className="font-medium">Recon</p>
          <Kv l="Status" r={recon.status} />
          <Kv l="Matched" r={String(recon.matched)} />
          <Kv l="Exceptions" r={String(recon.exceptions)} />
          <Kv l="Kill switch" r={String(recon.killSwitch)} />
        </Card>
        <Card>
          <p className="font-medium">Complaints</p>
          <Kv l="Open" r={String(cases.length)} />
          <Kv l="P1" r={String(p1)} />
          <Kv l="Informal unclassified" r={`${Math.round(q.informal.unclassifiedShare * 100)}%`} />
        </Card>
      </div>
      <div className="mt-4 overflow-x-auto px-4">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-muted-foreground">
              <th className="px-2 py-2">Ref</th>
              <th className="px-2 py-2">Result</th>
              <th className="px-2 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {recon.items.map((i) => (
              <tr key={i.externalReference} className="border-t border-border">
                <td className="px-2 py-3 font-mono text-xs">{i.externalReference}</td>
                <td className="px-2 py-3">{i.exceptionCode}</td>
                <td className="px-2 py-3">{i.resolutionAction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Card className="mx-4 mt-4">
        <p className="mb-2 font-medium">Connectors</p>
        <div className="flex flex-wrap gap-2">
          {CONNECTORS.map((c) => (
            <Badge key={c.id}>
              {c.label} · {c.mode}
            </Badge>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          A webhook is not payment success. CLOSE_RUN cannot hide HOLD_UNKNOWN.
        </p>
      </Card>
      <div className="px-4 pt-3">
        <Button variant="outline" className="sm:w-auto" onClick={() => useTrust.getState().setView("map")}>
          Architecture map
        </Button>
      </div>
    </Wide>
  );
}

function FlowMap() {
  const setView = useTrust((s) => s.setView);
  const rows = [
    ["Gate", "Pick customer / partner / ops. Sessions do not mix."],
    ["Signup / login", "Phone + PIN. OTP 123456 for new numbers."],
    ["Legal", "Terms + privacy. Trust is not the lender."],
    ["Consents", "Credit + affordability required before a bureau pull."],
    ["Ghana Card", "GHA-… + liveness + biometric. Last-four and photocopies rejected."],
    ["Wallet", "MTN / Telecel / AT. Raw movements only."],
    ["Money picture", "Volume vs salary/sales vs till. AFF-STRESS-1.0."],
    ["Ask", "Amount, term, purpose."],
    ["Engine", "DATA → QUALITY → FEATURES → IDENTITY → AFFORDABILITY → CREDIT → FRAUD → AML → EXPOSURE → POLICY → PRICING → DECISION"],
    ["Credit report", "XDS, D&B, MyCredit Score. Internal band ≠ Trust Score ≠ bureau score."],
    ["File / offer", "Trust floor. Partner sets amount."],
    ["Pay", "UNKNOWN until recon."],
    ["Help", "20-day complaint. Harassment / not-my-loan are P1."],
    ["Partner", "Queue + report. Pack cap vs Trust floor (dual run)."],
    ["Ops", "Recon, exceptions, connectors. CLOSE_RUN cannot hide HOLD_UNKNOWN."],
  ];
  return (
    <Wide>
      <header className="px-5 pt-6">
        <h1 className="font-display text-2xl">Architecture map</h1>
        <p className="text-sm text-muted-foreground">
          Same path as the original package. Partner originates. Volume is not income.
        </p>
      </header>
      <div className="mt-4 overflow-x-auto px-4 pb-6">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-muted-foreground">
              <th className="px-2 py-2">Step</th>
              <th className="px-2 py-2">Rule</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r[0]} className="border-t border-border">
                <td className="px-2 py-3 font-medium">{r[0]}</td>
                <td className="px-2 py-3 text-muted-foreground">{r[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 pb-6">
        <Button variant="ghost" className="sm:w-auto" onClick={() => setView("ops")}>
          Back
        </Button>
      </div>
    </Wide>
  );
}


