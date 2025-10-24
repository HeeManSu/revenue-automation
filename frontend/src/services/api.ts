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
  created_at: string;
  updated_at: string;
}

export interface RevenueSchedule {
  id: number;
  contract_id: number;
  period_start?: string;
  period_end?: string;
  amount?: number;
  recognized: boolean;
  created_at: string;
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

  static async getContracts(): Promise<Contract[]> {
    return this.request<Contract[]>("/contracts");
  }

  static async getContract(id: number): Promise<Contract> {
    return this.request<Contract>(`/contracts/${id}`);
  }

  static async getRevenueSchedules(
    contractId: number
  ): Promise<RevenueSchedule[]> {
    return this.request<RevenueSchedule[]>(
      `/contracts/${contractId}/revenue-schedules`
    );
  }

  static async getAuditMemos(contractId: number): Promise<AuditMemo[]> {
    return this.request<AuditMemo[]>(`/contracts/${contractId}/audit-memos`);
  }

  static async getContractStatus(contractId: string): Promise<ContractStatus> {
    return this.request<ContractStatus>(`/contracts/${contractId}/status`);
  }
}
