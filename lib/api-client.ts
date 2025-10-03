export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }))
    throw new ApiError(response.status, error.error || "Request failed")
  }

  return response.json()
}

export const api = {
  jobs: {
    list: (params?: {
      search?: string
      status?: string
      page?: number
      pageSize?: number
      sort?: string
    }) => {
      const searchParams = new URLSearchParams()
      if (params?.search) searchParams.set("search", params.search)
      if (params?.status) searchParams.set("status", params.status)
      if (params?.page) searchParams.set("page", params.page.toString())
      if (params?.pageSize) searchParams.set("pageSize", params.pageSize.toString())
      if (params?.sort) searchParams.set("sort", params.sort)

      return fetchApi<PaginatedResponse<any>>(`/api/jobs?${searchParams}`)
    },
    create: (data: any) =>
      fetchApi("/api/jobs", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchApi(`/api/jobs/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    reorder: (id: string, fromOrder: number, toOrder: number) =>
      fetchApi(`/api/jobs/${id}/reorder`, {
        method: "PATCH",
        body: JSON.stringify({ fromOrder, toOrder }),
      }),
  },
  candidates: {
    list: (params?: {
      search?: string
      stage?: string
      page?: number
      pageSize?: number
    }) => {
      const searchParams = new URLSearchParams()
      if (params?.search) searchParams.set("search", params.search)
      if (params?.stage) searchParams.set("stage", params.stage)
      if (params?.page) searchParams.set("page", params.page.toString())
      if (params?.pageSize) searchParams.set("pageSize", params.pageSize.toString())

      return fetchApi<PaginatedResponse<any>>(`/api/candidates?${searchParams}`)
    },
    create: (data: any) =>
      fetchApi("/api/candidates", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchApi(`/api/candidates/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    getTimeline: (id: string) => fetchApi<any[]>(`/api/candidates/${id}/timeline`),
  },
  assessments: {
    get: (jobId: string) => fetchApi<any>(`/api/assessments/${jobId}`),
    save: (jobId: string, data: any) =>
      fetchApi(`/api/assessments/${jobId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    submit: (jobId: string, data: any) =>
      fetchApi(`/api/assessments/${jobId}/submit`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
}
