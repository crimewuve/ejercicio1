/** Respuesta cruda del endpoint https://jsonplaceholder.typicode.com/todos */
export interface ApiTodo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

export type TicketStatus = 'completado' | 'pendiente';
export type TicketPriority = 'alta' | 'media' | 'baja';

/** Modelo de dominio: un ticket de soporte (IT Helpdesk). */
export interface Ticket {
  id: number;
  userId: number;
  title: string;
  status: TicketStatus;
  /** La API no trae prioridad: se asigna y gestiona localmente. */
  priority: TicketPriority;
}

export interface DashboardMetrics {
  total: number;
  completados: number;
  pendientes: number;
  /** Porcentaje de eficiencia de resolución (completados / total * 100). */
  eficiencia: number;
}
