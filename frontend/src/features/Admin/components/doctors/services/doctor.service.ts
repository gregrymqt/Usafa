import api from "../../../../../shared/services/api.service";
import type { Page } from "../../../../../shared/utils/forPages.utils";
import type {
  Doctor,
  NewDoctorData,
  GetDoctorsParams,
} from "../types/doctor.type";

/**
 * O endpoint base para o recurso de médicos no backend.
 * Seguindo o padrão de /admin/patients
 */
const DOCTORS_ENDPOINT = "/admin/doctors";

/**
 * Busca a lista de médicos.
 */
export const getDoctors = async (
  params: GetDoctorsParams
): Promise<Page<Doctor>> => {
  const queryParams = new URLSearchParams({
    page: params.page.toString(),
    size: params.size.toString(),
  });

  if (params.search) {
    queryParams.append("search", params.search);
  }
  return await api.get<Page<Doctor>>(
    `${DOCTORS_ENDPOINT}?${queryParams.toString()}`
  );
};

export const createDoctor = async (data: NewDoctorData): Promise<Doctor> => {
  const formData = new FormData();

  // 1. O Backend espera o objeto JSON na parte "doctor"
  // Precisamos converter o objeto JS para String JSON e definir o Content-Type como application/json
  const doctorJson = JSON.stringify({
    name: data.name,
    email: data.email,
    crm: data.crm,
    specialty: data.specialty,
  });

  // Blob permite definir o content-type da parte específica do JSON
  const jsonBlob = new Blob([doctorJson], { type: "application/json" });
  formData.append("doctor", jsonBlob);

  // 2. O Backend espera o arquivo na parte "file"
  if (data.imageFile) {
    formData.append("file", data.imageFile);
  }

  // O axios/fetch define o boundary do multipart automaticamente se não setarmos Content-Type manual
  return await api.postFormData(DOCTORS_ENDPOINT, formData);
};

export const updateDoctor = async (
  id: string,
  data: Partial<NewDoctorData>
): Promise<Doctor> => {
  const formData = new FormData();

  const doctorJson = JSON.stringify({
    name: data.name,
    email: data.email,
    crm: data.crm,
    specialty: data.specialty,
  });

  const jsonBlob = new Blob([doctorJson], { type: "application/json" });
  formData.append("doctor", jsonBlob);

  if (data.imageFile) {
    formData.append("file", data.imageFile);
  }

  return await api.putFormData(`${DOCTORS_ENDPOINT}/${id}`, formData);
};

/**
 * Deleta um médico.
 */
export const deleteDoctor = async (id: number | string): Promise<void> => {
  await api.delete(`${DOCTORS_ENDPOINT}/${id}`);
};
