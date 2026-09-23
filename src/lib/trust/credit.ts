import { FORMULA, gateApplication, runPicture } from "./engine";

export type BureauFacility = {
  provider: string;
  product: string;
  outstandingMinor: number;
  monthlyMinor: number;
  status: string;
};

export type BureauPull = {
  id: string;
  label: string;
  mode: "demo";
  thinFile: boolean;
  inquiries12m: number;
  facilities: BureauFacility[];
  worstStatus: string;
  note: string;
};

export type PipeStep = { name: string; status: string; detail: string };

export type CreditReport = {
  subjectName: string;
  subjectPhone: string;
  profile: "informal" | "salary";
  pulledAt: string;
  purpose: "credit_assessment";
  termWeeks: number;
  askPurpose: string;
  identity: { status: string; niaReference: string | null; method: string };
  bureaus: BureauPull[];
  affordability: {
    formula: string;
    outcome: string;
    reasonCodes: string[];
    countedDisplay: string;
    qualityPct: number;
    volumeExcludedMinor: number;
    dstiStar: number;
  };
  credit: {
    band: "THIN" | "LOW" | "MODERATE" | "HIGH";
    reasonCodes: string[];
    note: string;
  };
  fraud: { action: string };
  aml: { status: string };
  dualRun: {
    trustReferenceRun: { floorMinor: number; outcome: string };
    partnerPolicyRun: { capMinor: number; amountSetBy: string; note: string };
  };
  pipeline: PipeStep[];
  snapshotId: string;
  submission: { status: string; storeIn: string };
};

function snapshotId(payload: object) {
  const s = JSON.stringify(payload);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return "snap-" + (h >>> 0).toString(16);
}

export function pullBureaus(profile: "informal" | "salary"): BureauPull[] {
  const thin = profile === "informal";
  const salaryFacilities: BureauFacility[] = [
    {
      provider: "Bank A",
      product: "Personal loan",
      outstandingMinor: 1840000,
      monthlyMinor: 125000,
      status: "Current",
    },
    {
      provider: "Fintech X",
      product: "Digital loan",
      outstandingMinor: 620000,
      monthlyMinor: 85000,
      status: "Current",
    },
  ];
  const noteThin = "Informal / thin file is expected. Do not invent a bureau score.";
  return [
    {
      id: "xds_ghana",
      label: "XDS Data Ghana",
      mode: "demo",
      thinFile: thin,
      inquiries12m: thin ? 0 : 2,
      facilities: thin ? [] : salaryFacilities,
      worstStatus: thin ? "NONE" : "Current",
      note: thin ? noteThin : "Matched facilities returned. Reference only.",
    },
    {
      id: "dnb_ghana",
      label: "Dun and Bradstreet Credit Bureau Limited",
      mode: "demo",
      thinFile: thin,
      inquiries12m: thin ? 0 : 1,
      facilities: thin ? [] : salaryFacilities.slice(0, 1),
      worstStatus: thin ? "NONE" : "Current",
      note: thin ? noteThin : "Matched facilities returned. Reference only.",
    },
    {
      id: "mycredit_score",
      label: "MyCredit Score Limited",
      mode: "demo",
      thinFile: true,
      inquiries12m: 0,
      facilities: [],
      worstStatus: "NONE",
      note: "No match / thin file. Do not invent a bureau score.",
    },
  ];
}

export function runPipeline(opts: {
  identityStatus: string;
  profile: "informal" | "salary";
  askedMinor: number;
  consentsOk: boolean;
}) {
  const { aff, picture } = runPicture(opts.profile, opts.askedMinor);
  const bureaus = pullBureaus(opts.profile);
  const packCap = opts.profile === "informal" ? 80000 : 180000;
  let floor = opts.profile === "informal" ? 80000 : Math.min(opts.askedMinor, packCap);
  if (aff.outcome !== "PASS") floor = Math.min(floor, Math.max(0, aff.srcMinor));
  const steps: PipeStep[] = [
    { name: "DATA", status: picture.volumeMinor > 0 ? "OK" : "FAIL", detail: "Wallet movements from telco statement" },
    {
      name: "QUALITY",
      status: aff.outcome === "INFORMATION_REQUIRED" ? "INFORMATION_REQUIRED" : "OK",
      detail: `Unclassified ${Math.round(picture.unclassifiedShare * 100)}% · quality ${picture.dataQualityPct}%`,
    },
    { name: "FEATURES", status: "OK", detail: "Salary and sales only. Volume is not income." },
    {
      name: "IDENTITY",
      status: opts.identityStatus === "VERIFIED" ? "OK" : "INFORMATION_REQUIRED",
      detail: "Ghana Card NIA IVSP biometric + liveness",
    },
    { name: "AFFORDABILITY", status: aff.outcome, detail: aff.reasonCodes.join(", ") || FORMULA },
    {
      name: "CREDIT",
      status: bureaus.every((b) => b.thinFile) ? "THIN" : "OK",
      detail: "XDS · D&B · MyCredit Score. No invented bureau score.",
    },
    { name: "FRAUD", status: "ALLOW", detail: "Demo ALLOW — not a silent skip of the stage" },
    { name: "AML", status: "CLEAR", detail: "Demo CLEAR — KYC/CDD still a required stage" },
    { name: "EXPOSURE", status: opts.askedMinor <= 300000 ? "OK" : "HOLD", detail: "Asked within product bound GH₵ 3,000" },
    {
      name: "POLICY",
      status: opts.consentsOk && opts.identityStatus === "VERIFIED" ? "OK" : "HOLD_SECURITY",
      detail: "product.active ∧ verified ∧ consent ∧ fraud not BLOCK",
    },
    { name: "PRICING", status: "PARTNER", detail: "Partner sets price and amount" },
  ];
  const policyOk = opts.consentsOk && opts.identityStatus === "VERIFIED" && opts.askedMinor <= 300000;
  const gate = gateApplication(opts.identityStatus, aff.outcome, policyOk);
  steps.push({ name: "DECISION", status: gate.outcome, detail: gate.reason });
  return { steps, gate, floorMinor: floor, partnerCapMinor: packCap, aff, picture, bureaus };
}

export function assembleCreditReport(opts: {
  name: string;
  phone: string;
  profile: "informal" | "salary";
  identityStatus: string;
  niaReference: string | null;
  askedMinor: number;
  recommendedMinor: number;
  termWeeks: number;
  askPurpose: string;
  consentsOk: boolean;
}): CreditReport {
  const pipe = runPipeline({
    identityStatus: opts.identityStatus,
    profile: opts.profile,
    askedMinor: opts.askedMinor,
    consentsOk: opts.consentsOk,
  });
  const { aff, picture, bureaus, steps, gate, floorMinor, partnerCapMinor } = pipe;
  const anyFacility = bureaus.some((b) => b.facilities.length > 0);
  const thin = bureaus.every((b) => b.thinFile) || aff.outcome === "INFORMATION_REQUIRED";
  let band: CreditReport["credit"]["band"] = "MODERATE";
  const reasonCodes: string[] = [];
  if (thin) {
    band = "THIN";
    reasonCodes.push("CR_THIN_FILE");
  } else if (aff.outcome === "FAIL") {
    band = "HIGH";
    reasonCodes.push("CR_AFF_FAIL");
  } else if (anyFacility && aff.outcome === "PASS") {
    band = "LOW";
    reasonCodes.push("CR_BUREAU_CURRENT", "CR_AFF_PASS");
  }
  reasonCodes.push("CR_VOLUME_NOT_INCOME");

  return {
    subjectName: opts.name,
    subjectPhone: opts.phone,
    profile: opts.profile,
    pulledAt: new Date().toISOString(),
    purpose: "credit_assessment",
    termWeeks: opts.termWeeks,
    askPurpose: opts.askPurpose,
    identity: {
      status: opts.identityStatus,
      niaReference: opts.niaReference,
      method: "NIA_IVSP",
    },
    bureaus,
    affordability: {
      formula: FORMULA,
      outcome: aff.outcome,
      reasonCodes: aff.reasonCodes,
      countedDisplay: picture.incomeDisplay === "UNAVAILABLE" ? "UNAVAILABLE" : String(picture.countedIncomeMinor),
      qualityPct: picture.dataQualityPct,
      volumeExcludedMinor: aff.volumeExcludedMinor,
      dstiStar: aff.dstiStar,
    },
    credit: {
      band,
      reasonCodes,
      note: "Internal risk band for the partner file. Distinct from any customer Trust Score and from a bureau score.",
    },
    fraud: { action: "ALLOW" },
    aml: { status: "CLEAR" },
    dualRun: {
      trustReferenceRun: { floorMinor, outcome: aff.outcome },
      partnerPolicyRun: {
        capMinor: partnerCapMinor,
        amountSetBy: "Example Microcredit",
        note: "Partner originates and sets the amount. Trust floor is not an approval.",
      },
    },
    pipeline: steps,
    snapshotId: snapshotId({
      phone: opts.phone,
      aff: aff.outcome,
      band,
      gate: gate.outcome,
      floorMinor,
    }),
    submission: {
      status: "HELD_UNTIL_ORIGINATION",
      storeIn: "credit_reporting.submission",
    },
  };
}
