export interface AssignedPatient {
  _id: string;
  fullName: string;
  email: string;
}

export interface PatientsResponse {
  success: boolean;
  data: AssignedPatient[];
  pagination: {
    currentPage: number;
    limit: number;
    totalPatients: number;
    totalPages: number;
  };
}