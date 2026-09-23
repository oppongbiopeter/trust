const PIN_RE = /^GHA-\d{9}-\d$/;
const LAST4_RE = /^\d{4}$/;

const DEMO_VERIFIED: Record<string, { first: string; last: string; dob: string }> = {
  "GHA-000000001-1": { first: "Akosua", last: "Mensah", dob: "1994-03-12" },
  "GHA-000000002-2": { first: "Kwame", last: "Owusu", dob: "1988-11-02" },
};

export type IdentityResult = {
  status: string;
  method: string;
  reason: string;
  niaReference: string | null;
  pinSuffix: string | null;
};

export function normalizePin(raw: string) {
  let s = (raw || "").trim().toUpperCase().replace(/\s/g, "");
  if (s.startsWith("GHA") && !s.startsWith("GHA-")) s = "GHA-" + s.slice(3);
  return s;
}

export function verifyGhanaCard(opts: {
  pin: string;
  firstName: string;
  lastName: string;
  livenessPassed: boolean;
  biometricPassed: boolean;
  cardImage?: boolean;
}): IdentityResult {
  if (opts.cardImage) {
    return {
      status: "FAILED",
      method: "REJECTED_IMAGE",
      reason: "L.I. 2523: do not collect or store a Ghana Card photocopy.",
      niaReference: null,
      pinSuffix: null,
    };
  }
  const pin = normalizePin(opts.pin);
  if (LAST4_RE.test(pin)) {
    return {
      status: "FAILED",
      method: "INSUFFICIENT",
      reason: "Last four digits are not NIA verification.",
      niaReference: null,
      pinSuffix: null,
    };
  }
  if (!PIN_RE.test(pin)) {
    return {
      status: "FAILED",
      method: "INVALID",
      reason: "Ghana Card PIN must look like GHA-123456789-1.",
      niaReference: null,
      pinSuffix: null,
    };
  }
  if (!opts.livenessPassed) {
    return {
      status: "LIVENESS_REQUIRED",
      method: "REMOTE_ONBOARDING",
      reason: "Remote onboarding requires a liveness check.",
      niaReference: null,
      pinSuffix: pin.slice(-6),
    };
  }
  if (!opts.biometricPassed) {
    return {
      status: "BIOMETRIC_REQUIRED",
      method: "NIA_IVSP",
      reason: "L.I. 2523 requires a biometric match to NIA.",
      niaReference: null,
      pinSuffix: pin.slice(-6),
    };
  }
  const record = DEMO_VERIFIED[pin];
  if (!record) {
    return {
      status: "NO_MATCH",
      method: "DEMO_IVSP",
      reason: "No match in the demo NIA register for this PIN.",
      niaReference: null,
      pinSuffix: pin.slice(-6),
    };
  }
  if (
    record.first.toLowerCase() !== opts.firstName.trim().toLowerCase() ||
    record.last.toLowerCase() !== opts.lastName.trim().toLowerCase()
  ) {
    return {
      status: "NO_MATCH",
      method: "DEMO_IVSP",
      reason: "Name does not match. Primary data is corrected at NIA, not here.",
      niaReference: null,
      pinSuffix: pin.slice(-6),
    };
  }
  return {
    status: "VERIFIED",
    method: "DEMO_IVSP",
    reason: "Demo biometric + liveness match.",
    niaReference: "NIA-DEMO-" + pin.slice(-4),
    pinSuffix: pin.slice(-6),
  };
}
