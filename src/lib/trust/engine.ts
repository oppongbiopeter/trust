export const FORMULA = "AFF-STRESS-1.0";

export type Category =
  | "SALARY"
  | "SALES"
  | "FLOAT_PASSTHROUGH"
  | "AGENT_TILL"
  | "COLLECTION_ON_BEHALF"
  | "LOAN_DISBURSEMENT"
  | "LOAN_REPAYMENT"
  | "TRANSFER_IN"
  | "UNCLASSIFIED"
  | "HOUSEHOLD"
  | "SUSU_OR_SAVING"
  | "PURCHASE_STOCK";

export type Tx = {
  occurredAt: Date;
  amountMinor: number;
  direction: "CREDIT" | "DEBIT";
  counterparty: string;
  narrative: string;
  category: Category;
  confidence: number;
};

export type AffResult = {
  outcome: "PASS" | "FAIL" | "INFORMATION_REQUIRED";
  reasonCodes: string[];
  incomeMinor: number;
  incomeStarMinor: number;
  residualStarMinor: number;
  dstiStar: number;
  srcMinor: number;
  volumeExcludedMinor: number;
  classifiedCreditMinor: number;
};

const EXCLUDED: Category[] = [
  "FLOAT_PASSTHROUGH",
  "AGENT_TILL",
  "COLLECTION_ON_BEHALF",
  "LOAN_DISBURSEMENT",
  "TRANSFER_IN",
  "UNCLASSIFIED",
];

function loanish(text: string) {
  const t = text.toLowerCase();
  return ["loan", "credit", "advance", "lender", "disburs"].some((w) => t.includes(w));
}

function pstdev(vals: number[]) {
  if (!vals.length) return 0;
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const v = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length;
  return Math.sqrt(v);
}

function median(vals: number[]) {
  if (!vals.length) return 0;
  const s = [...vals].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
}

function percentile25(values: number[]) {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  if (s.length === 1) return s[0];
  return s[Math.max(0, Math.floor(0.25 * (s.length - 1)))];
}

export function classifyTransactions(txs: Tx[]): Tx[] {
  const byDay = new Map<string, Tx[]>();
  for (const tx of txs) {
    const key = tx.occurredAt.toISOString().slice(0, 10);
    const g = byDay.get(key) ?? [];
    g.push(tx);
    byDay.set(key, g);
  }
  for (const group of byDay.values()) {
    const credits = group.filter((t) => t.direction === "CREDIT");
    const debits = group.filter((t) => t.direction === "DEBIT");
    for (const c of credits) {
      const match = debits.find(
        (d) => Math.abs(d.amountMinor - c.amountMinor) <= Math.max(100, Math.floor(0.05 * c.amountMinor)),
      );
      if (match) {
        c.category = "FLOAT_PASSTHROUGH";
        c.confidence = 0.8;
      }
    }
  }

  const amounts = txs.filter((t) => t.direction === "CREDIT").map((t) => t.amountMinor);
  let agentLike = false;
  if (amounts.length >= 6) {
    const mx = Math.max(...amounts);
    const mn = Math.min(...amounts);
    agentLike = mx > 0 && (mx - mn) / mx <= 0.05;
  }

  const payerCredits = new Map<string, Tx[]>();
  for (const t of txs) {
    if (t.direction === "CREDIT" && t.category === "UNCLASSIFIED") {
      const k = t.counterparty || "_";
      const g = payerCredits.get(k) ?? [];
      g.push(t);
      payerCredits.set(k, g);
    }
  }

  for (const t of txs) {
    if (t.category !== "UNCLASSIFIED") continue;
    const blob = `${t.counterparty} ${t.narrative}`;
    if (loanish(blob)) {
      t.category = t.direction === "CREDIT" ? "LOAN_DISBURSEMENT" : "LOAN_REPAYMENT";
      t.confidence = 0.75;
      continue;
    }
    const low = blob.toLowerCase();
    if (t.direction === "DEBIT" && ["rent", "school", "ecg", "water", "food"].some((w) => low.includes(w))) {
      t.category = "HOUSEHOLD";
      t.confidence = 0.7;
      continue;
    }
    if (t.direction === "DEBIT" && ["stock", "inventory", "supplier"].some((w) => low.includes(w))) {
      t.category = "PURCHASE_STOCK";
      t.confidence = 0.65;
      continue;
    }
    if (agentLike && t.direction === "CREDIT") {
      t.category = "AGENT_TILL";
      t.confidence = 0.7;
      continue;
    }
    if (t.direction === "CREDIT") {
      const payer = (t.counterparty || "").toLowerCase();
      if (["", "wallet", "momo", "self", "till", "agent", "_"].includes(payer)) {
        t.category = "UNCLASSIFIED";
        t.confidence = 0.25;
        continue;
      }
      const same = payerCredits.get(t.counterparty || "_") ?? [];
      const salaryHint = ["salary", "payroll", "wage", "ltd", "limited", "company", "inc"].some((w) =>
        blob.toLowerCase().includes(w),
      );
      if (salaryHint && same.length >= 3) {
        const vals = same.map((x) => x.amountMinor);
        const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
        const vari = mean ? pstdev(vals) / mean : 1;
        if (vari <= 0.25) {
          t.category = "SALARY";
          t.confidence = 0.8;
          continue;
        }
      }
      t.category = "UNCLASSIFIED";
      t.confidence = 0.3;
    }
  }
  return txs;
}

export function maybePromoteSales(txs: Tx[], lookbackDays = 90): Tx[] {
  const credits = txs.filter((t) => t.direction === "CREDIT");
  const unclassified = credits.filter((t) => t.category === "UNCLASSIFIED");
  if (credits.length < 8 || !unclassified.length) return txs;
  const span =
    (Math.max(...txs.map((t) => t.occurredAt.getTime())) - Math.min(...txs.map((t) => t.occurredAt.getTime()))) /
    86400000;
  if (span < lookbackDays) return txs;
  const counterparties = new Set(unclassified.map((t) => t.counterparty).filter(Boolean));
  if (counterparties.size < 5) return txs;
  for (const t of unclassified) {
    if (t.counterparty && t.counterparty !== "wallet") {
      t.category = "SALES";
      t.confidence = 0.55;
    }
  }
  return txs;
}

export function assessAffordability(
  txs: Tx[],
  opts: {
    householdMinor?: number;
    existingDebtMinor?: number;
    informalDebtMinor?: number;
    newServiceMinor?: number;
    sigmaI?: number;
    sigmaH?: number;
    sigmaD?: number;
    sigmaS?: number;
    dstiMax?: number;
    bufferAbs?: number;
    bufferPct?: number;
    incomeFloor?: number;
    unclassifiedBlockShare?: number;
    variableHaircut?: number;
  } = {},
): AffResult {
  const householdMinor = opts.householdMinor ?? 0;
  const existingDebtMinor = opts.existingDebtMinor ?? 0;
  const informalDebtMinor = opts.informalDebtMinor ?? 0;
  const newServiceMinor = opts.newServiceMinor ?? 0;
  const sigmaH = opts.sigmaH ?? 0.1;
  const sigmaD = opts.sigmaD ?? 0.1;
  const sigmaS = opts.sigmaS ?? 0.05;
  const dstiMax = opts.dstiMax ?? 0.4;
  const bufferAbs = opts.bufferAbs ?? 15000;
  const bufferPct = opts.bufferPct ?? 0.1;
  const incomeFloor = opts.incomeFloor ?? 40000;
  const unclassifiedBlockShare = opts.unclassifiedBlockShare ?? 0.5;
  const variableHaircut = opts.variableHaircut ?? 0.5;

  const credits = txs.filter((t) => t.direction === "CREDIT");
  const volume = credits.reduce((a, t) => a + t.amountMinor, 0);
  const salary = txs.filter((t) => t.category === "SALARY" && t.direction === "CREDIT").map((t) => t.amountMinor);
  const sales = txs.filter((t) => t.category === "SALES" && t.direction === "CREDIT").map((t) => t.amountMinor);
  const repay = txs.filter((t) => t.category === "LOAN_REPAYMENT").reduce((a, t) => a + t.amountMinor, 0);
  const houseObs = txs.filter((t) => t.category === "HOUSEHOLD").reduce((a, t) => a + t.amountMinor, 0);
  const stock = txs.filter((t) => t.category === "PURCHASE_STOCK").reduce((a, t) => a + t.amountMinor, 0);

  const iRec = salary.length ? median(salary) : 0;
  const iVar = sales.length ? Math.floor(variableHaircut * percentile25(sales)) : 0;
  const income = iRec + iVar;
  const classified = salary.reduce((a, b) => a + b, 0) + sales.reduce((a, b) => a + b, 0);
  const unclass = credits.filter((t) => t.category === "UNCLASSIFIED");
  const unclassShare = volume ? unclass.reduce((a, t) => a + t.amountMinor, 0) / volume : 1;
  const codes: string[] = [];
  if (volume > classified) codes.push("AFF_VOLUME_REJECTED");

  if (!txs.length || unclassShare >= unclassifiedBlockShare || classified === 0) {
    codes.push("AFF_DATA_THIN");
    return {
      outcome: "INFORMATION_REQUIRED",
      reasonCodes: codes,
      incomeMinor: income,
      incomeStarMinor: 0,
      residualStarMinor: 0,
      dstiStar: 0,
      srcMinor: 0,
      volumeExcludedMinor: volume - classified,
      classifiedCreditMinor: classified,
    };
  }

  let sigmaI = opts.sigmaI;
  if (sigmaI == null) {
    if (iRec && iRec / Math.max(income, 1) >= 0.8) sigmaI = 0.15;
    else if (iVar && iVar / Math.max(income, 1) >= 0.5) sigmaI = 0.35;
    else sigmaI = 0.25;
  }

  const h = Math.max(householdMinor, houseObs);
  const sExist = Math.max(existingDebtMinor, repay) + informalDebtMinor;
  if (!informalDebtMinor && !existingDebtMinor && !repay) codes.push("AFF_OBLIGATIONS_UNDECLARED");

  const iStar = Math.floor((1 - sigmaI) * income);
  const hStar = Math.floor((1 + sigmaH) * h);
  const seStar = Math.floor((1 + sigmaD) * sExist);
  const snStar = Math.floor((1 + sigmaS) * newServiceMinor);
  const buf = Math.max(bufferAbs, Math.floor(bufferPct * iStar));
  const rStar = iStar - hStar - seStar - stock - snStar;
  const src = Math.max(0, iStar - hStar - seStar - stock - buf);
  const dsti = iStar ? (seStar + snStar) / iStar : 999;

  if (iStar < incomeFloor) {
    codes.push("AFF_FAIL_FLOOR");
    return {
      outcome: "FAIL",
      reasonCodes: codes,
      incomeMinor: income,
      incomeStarMinor: iStar,
      residualStarMinor: rStar,
      dstiStar: dsti,
      srcMinor: src,
      volumeExcludedMinor: volume - classified,
      classifiedCreditMinor: classified,
    };
  }

  let outcome: AffResult["outcome"] = "PASS";
  if (rStar < buf) {
    codes.push("AFF_FAIL_RESIDUAL");
    outcome = "FAIL";
  } else if (dsti > dstiMax) {
    codes.push("AFF_FAIL_DSTI");
    outcome = "FAIL";
  } else {
    codes.push("AFF_PASS");
    if (dsti > 0.3 || rStar < Math.floor(1.5 * buf)) codes.push("AFF_TIGHT");
  }

  return {
    outcome,
    reasonCodes: codes,
    incomeMinor: income,
    incomeStarMinor: iStar,
    residualStarMinor: rStar,
    dstiStar: dsti,
    srcMinor: src,
    volumeExcludedMinor: volume - classified,
    classifiedCreditMinor: classified,
  };
}

export function moneyPicture(txs: Tx[], aff: AffResult) {
  const credits = txs.filter((t) => t.direction === "CREDIT");
  const volume = credits.reduce((a, t) => a + t.amountMinor, 0);
  const salary = txs.filter((t) => t.category === "SALARY").reduce((a, t) => a + t.amountMinor, 0);
  const sales = txs.filter((t) => t.category === "SALES").reduce((a, t) => a + t.amountMinor, 0);
  const till = credits.filter((t) => EXCLUDED.includes(t.category)).reduce((a, t) => a + t.amountMinor, 0);
  const out = txs
    .filter((t) => ["HOUSEHOLD", "PURCHASE_STOCK", "LOAN_REPAYMENT"].includes(t.category))
    .reduce((a, t) => a + t.amountMinor, 0);
  const unclass = credits.filter((t) => t.category === "UNCLASSIFIED").reduce((a, t) => a + t.amountMinor, 0);
  return {
    volumeMinor: volume,
    salaryMinor: salary,
    salesMinor: sales,
    countedIncomeMinor: aff.incomeMinor,
    tillMinor: till,
    outMinor: out,
    unclassifiedMinor: unclass,
    unclassifiedShare: volume ? unclass / volume : 1,
    incomeDisplay: aff.outcome === "INFORMATION_REQUIRED" ? "UNAVAILABLE" : null,
    dataQualityPct: Math.round((1 - (volume ? unclass / volume : 1)) * 100),
    volumeIsNotIncome: true,
    affordability: { ...aff, formula: FORMULA },
  };
}

export function gateApplication(identityStatus: string, affOutcome: string, policyOk: boolean) {
  if (identityStatus !== "VERIFIED") {
    return {
      outcome: "INFORMATION_REQUIRED",
      reason: "ID_NOT_VERIFIED",
      detail: "Ghana Card must be NIA-verified before a file is sent to a partner.",
    };
  }
  if (affOutcome === "INFORMATION_REQUIRED") {
    return { outcome: "INFORMATION_REQUIRED", reason: "AFF_DATA_THIN", detail: "Do not invent income from wallet volume." };
  }
  if (affOutcome === "FAIL") {
    return { outcome: "DECLINE", reason: "AFF_FAIL", detail: "Stressed residual or DSTI failed." };
  }
  if (!policyOk) {
    return { outcome: "HOLD_SECURITY", reason: "POLICY_BLOCK", detail: "Policy engine blocked the recommendation." };
  }
  return {
    outcome: "APPROVE_WITH_CONDITIONS",
    reason: "FILE_READY",
    detail: "Partner sets the amount. This is not a Trust loan approval.",
  };
}

export function sampleTxs(profile: "informal" | "salary"): Tx[] {
  const day = (i: number) => new Date(Date.now() - i * 86400000);
  const txs: Tx[] = [];
  const base = (): Pick<Tx, "category" | "confidence"> => ({ category: "UNCLASSIFIED", confidence: 0 });
  if (profile === "salary") {
    for (let i = 0; i < 3; i++) {
      txs.push({
        occurredAt: day(30 * i),
        amountMinor: 240000,
        direction: "CREDIT",
        counterparty: "ACME LTD",
        narrative: "salary",
        ...base(),
      });
    }
    for (let i = 0; i < 2; i++) {
      txs.push({
        occurredAt: day(30 * i + 5),
        amountMinor: 40000,
        direction: "DEBIT",
        counterparty: "landlord",
        narrative: "rent",
        ...base(),
      });
    }
    return txs;
  }
  for (let i = 0; i < 90; i++) {
    txs.push({
      occurredAt: day(i),
      amountMinor: 8000,
      direction: "CREDIT",
      counterparty: "wallet",
      narrative: "",
      ...base(),
    });
    if (i % 3 === 0) {
      txs.push({
        occurredAt: day(i),
        amountMinor: 12000,
        direction: "CREDIT",
        counterparty: `buyer${i}`,
        narrative: "sale",
        ...base(),
      });
    }
  }
  txs.push({
    occurredAt: day(10),
    amountMinor: 40000,
    direction: "DEBIT",
    counterparty: "landlord",
    narrative: "rent",
    ...base(),
  });
  txs.push({
    occurredAt: day(12),
    amountMinor: 20000,
    direction: "DEBIT",
    counterparty: "supplier",
    narrative: "stock",
    ...base(),
  });
  return txs;
}

export function runPicture(profile: "informal" | "salary", askedMinor = 80000) {
  const txs = sampleTxs(profile);
  classifyTransactions(txs);
  maybePromoteSales(txs, 60);
  const aff = assessAffordability(txs, {
    householdMinor: profile === "salary" ? 60000 : 90000,
    existingDebtMinor: profile === "salary" ? 20000 : 0,
    informalDebtMinor: profile === "salary" ? 0 : 20000,
    newServiceMinor: Math.max(1, Math.floor(askedMinor * 0.28)),
    sigmaI: profile === "salary" ? 0.25 : 0.35,
  });
  return { txs, aff, picture: moneyPicture(txs, aff) };
}

export type ReconItem = {
  externalReference: string;
  exceptionCode: string;
  resolutionAction: string;
};

export function runDemoRecon(): {
  status: string;
  matched: number;
  exceptions: number;
  killSwitch: boolean;
  items: ReconItem[];
} {
  const items: ReconItem[] = [
    { externalReference: "MTN-OK-001", exceptionCode: "MATCHED", resolutionAction: "MATCH_CONFIRMED" },
    {
      externalReference: "MTN-UNK-002",
      exceptionCode: "UNKNOWN_PROVIDER_STATE",
      resolutionAction: "MARK_SUCCEEDED_AFTER_EVIDENCE",
    },
    { externalReference: "MTN-MISS-003", exceptionCode: "MISSING_INTERNAL", resolutionAction: "OPEN_EXCEPTION" },
    { externalReference: "MTN-AMT-004", exceptionCode: "AMOUNT_MISMATCH", resolutionAction: "HOLD_AND_INVESTIGATE" },
  ];
  return {
    status: "EXCEPTION",
    matched: 1,
    exceptions: 3,
    killSwitch: false,
    items,
  };
}

export const CONNECTORS = [
  { id: "mtn_momo", family: "telco", label: "MTN Mobile Money", mode: "demo" },
  { id: "telecel_cash", family: "telco", label: "Telecel Cash", mode: "demo" },
  { id: "at_money", family: "telco", label: "AT Money", mode: "demo" },
  { id: "example_mfi", family: "bank", label: "Example Microcredit", mode: "demo" },
  { id: "gcb", family: "bank", label: "GCB Bank", mode: "demo" },
  { id: "xds_ghana", family: "bureau", label: "XDS Data Ghana", mode: "demo" },
  { id: "dnb_ghana", family: "bureau", label: "Dun & Bradstreet Ghana", mode: "demo" },
  { id: "mycredit_score", family: "bureau", label: "MyCredit Score", mode: "demo" },
  { id: "nia_ivsp", family: "identity", label: "NIA IVSP / Ghana Card", mode: "demo" },
];
