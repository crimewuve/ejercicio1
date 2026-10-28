import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiTodo, Ticket, TicketPriority } from '../models/ticket.model';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private readonly apiUrl = 'https://jsonplaceholder.typicode.com/todos';
  private readonly priorities: TicketPriority[] = ['alta', 'media', 'baja'];

  constructor(private http: HttpClient) {}

  /** GET al endpoint y transformación de la respuesta al modelo Ticket. */
  getTickets(): Observable<Ticket[]> {
    return this.http.get<ApiTodo[]>(this.apiUrl).pipe(
      map((todos) =>
        todos.slice(0, 40).map<Ticket>((todo) => ({
          id: todo.id,
          userId: todo.userId,
          title: todo.title,
          status: todo.completed ? 'completado' : 'pendiente',
          // La API no incluye prioridad: se genera una inicial de forma determinista.
          priority: this.priorities[todo.id % this.priorities.length],
        }))
      )
    );
  }
}
