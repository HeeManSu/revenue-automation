const API_BASE_URL = "http://localhost:8000";

export interface Contract {
  id: number;
  external_id?: string;
  customer_name?: string;
  file_name?: string;
  content_type?: string;
  total_value?: number;
  currency?: string;
  start_date?: string;
  end_date?: string;
  status: string;
  time_saved_hours?: number;
  created_at: string;
  updated_at: string;
}

export interface Obligation {
  id: number | null;
  name: string;
  type: string | null;
  recognition_method: string | null;
}

export interface RevenueSchedule {
  id: number;
  contract_id: number;
  obligation_id?: number | null;
  period_start?: string;
  period_end?: string;
  amount?: number;
  recognized: boolean;
  created_at: string;
  obligation?: Obligation | null;
}

export interface AuditMemo {
  id: number;
  contract_id: number;
  memo_text?: string;
  created_at: string;
}

export interface ContractStatus {
  contract_id: string;
  status: string;
  file_name?: string;
  created_at: string;
  updated_at: string;
  customer_name?: string;
  total_value?: number;
  currency?: string;
  time_saved_hours?: number;
}

export class ApiService {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  static async uploadContract(file: File): Promise<{ message: string }> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/contracts/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(
        `Upload failed: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  static async uploadSampleContract(
    contractId: string
  ): Promise<{ message: string }> {
    const sampleFiles = {
      acme: "sample-contracts/contract.md",
      neuraxis: "sample-contracts/MAX_NEURAXIS_2025.md",
      omega: "sample-contracts/MAX_OMEGA_2025.md",
    };

    if (!sampleFiles[contractId as keyof typeof sampleFiles]) {
      throw new Error(`Invalid contract ID: ${contractId}`);
    }

    const filePath = sampleFiles[contractId as keyof typeof sampleFiles];

    try {
      const response = await fetch(`/${filePath}`);
      if (!response.ok) {
        throw new Error(`Failed to load sample file: ${response.statusText}`);
      }

      const content = await response.text();
      const filename = filePath.split("/").pop() || "contract.md";

      const file = new File([content], filename, {
        type: "text/markdown",
      });

      return this.uploadContract(file);
    } catch (error) {
      throw new Error(
        `Failed to load sample contract: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  static async getContracts(): Promise<Contract[]> {
    return this.request<Contract[]>("/contracts");
  }

  static async getContract(id: number): Promise<Contract> {
    return this.request<Contract>(`/contracts/${id}`);
  }

  static async getRevenueSchedules(
    contractId: string
  ): Promise<RevenueSchedule[]> {
    return this.request<RevenueSchedule[]>(
      `/contracts/${contractId}/revenue-schedules`
    );
  }

  static async getAuditMemos(contractId: string): Promise<AuditMemo[]> {
    return this.request<AuditMemo[]>(`/contracts/${contractId}/audit-memos`);
  }

  static async getStructuredAuditMemo(contractId: string): Promise<any> {
    try {
      return await this.request<any>(
        `/contracts/${contractId}/audit-memos/structured`
      );
    } catch (error) {
      console.error(
        `Failed to fetch structured memo for contract ${contractId}:`,
        error
      );
      throw error;
    }
  }

  static async getContractStatus(contractId: string): Promise<ContractStatus> {
    return this.request<ContractStatus>(`/contracts/${contractId}/status`);
  }
}
