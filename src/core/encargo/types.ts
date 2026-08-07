export const ENCARGO_SERVICES = [
  {
    key: "web",
    label: "Página web / landing",
    hint: "Sitio o landing funcional según brief",
  },
  {
    key: "chatbot",
    label: "Chatbot",
    hint: "Asistente conversacional / automatización de respuestas",
  },
  {
    key: "automation",
    label: "Automatización",
    hint: "Flujos ops / integraciones (n8n u orquestación interna)",
  },
] as const;

export type EncargoServiceKey = (typeof ENCARGO_SERVICES)[number]["key"];

export const ENCARGO_STEP_ROLES = [
  "reasoning",
  "design",
  "code",
  "qa",
] as const;

export type EncargoStepRole = (typeof ENCARGO_STEP_ROLES)[number];

export type EncargoStatus =
  | "draft"
  | "ready"
  | "awaiting_approval"
  | "running"
  | "completed"
  | "cancelled";

export type EncargoStepStatus =
  | "pending"
  | "proposed"
  | "approved"
  | "running"
  | "done"
  | "rejected"
  | "failed";

export type Encargo = {
  id: string;
  clientId: string;
  clientName: string;
  leadId: string | null;
  serviceKey: EncargoServiceKey;
  serviceLabel: string;
  description: string;
  status: EncargoStatus;
  projectId: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EncargoStep = {
  id: string;
  encargoId: string;
  sortOrder: number;
  role: EncargoStepRole;
  agentId: string;
  status: EncargoStepStatus;
  proposal: string;
  output: string;
  runId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EncargoView = {
  encargo: Encargo;
  steps: EncargoStep[];
};

export function isEncargoServiceKey(v: string): v is EncargoServiceKey {
  return ENCARGO_SERVICES.some((s) => s.key === v);
}

export function serviceLabelFor(key: EncargoServiceKey): string {
  return ENCARGO_SERVICES.find((s) => s.key === key)?.label || key;
}

export function agentIdForRole(role: EncargoStepRole): string {
  return `delivery.${role}`;
}
