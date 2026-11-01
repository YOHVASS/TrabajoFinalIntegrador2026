
export type EstadoHabilitacion =
    | "HABILITADO"
    | "NO_HABILITADO"
    | "PENDIENTE";

export type Sexo = "FEMENINO" | "MASCULINO" | "X";

export interface Participante {
    id: number;
    dni: string;
    nombre: string;
    apellido: string;
    fechaNacimiento: string;
    sexo: Sexo;
    facultad: string;
    email: string;
    telefono: string;
    fotoUrl: string | null;
    qrCode: string | null;
    estadoHabilitacion: EstadoHabilitacion;
    fechaAlta: string;
}

export interface PaginaResponse<T> {
    contenido: T[];
    pagina: number;
    tamanio: number;
    totalElementos: number;
    totalPaginas: number;
}
