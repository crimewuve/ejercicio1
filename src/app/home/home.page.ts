import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonItem,
  IonLabel,
  IonList,
  IonAvatar,
  IonBadge,
  IonSpinner,
  IonNote,
  ModalController,
  ToastController,
} from '@ionic/angular/standalone';

import { TicketService } from '../services/ticket.service';
import {
  DashboardMetrics,
  Ticket,
  TicketPriority,
  TicketStatus,
} from '../models/ticket.model';
import {
  AssignModalComponent,
  AssignResult,
} from '../components/assign-modal/assign-modal.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonItem,
    IonLabel,
    IonList,
    IonAvatar,
    IonBadge,
    IonSpinner,
    IonNote,
  ],
})
export class HomePage implements OnInit {
  /** Datos originales: nunca se mutan al filtrar, solo al reasignar un ticket. */
  private allTickets: Ticket[] = [];

  /** Lista visible tras aplicar filtros y orden. */
  tickets: Ticket[] = [];

  metrics: DashboardMetrics = { total: 0, completados: 0, pendientes: 0, eficiencia: 0 };

  // Filtros enlazados con [ngModel]
  search = '';
  statusFilter: 'todos' | TicketStatus = 'todos';
  priorityFilter: 'todas' | TicketPriority = 'todas';

  loading = true;
  error = false;

  private readonly priorityWeight: Record<TicketPriority, number> = {
    alta: 0,
    media: 1,
    baja: 2,
  };

  constructor(
    private ticketService: TicketService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.loading = true;
    this.error = false;
    this.ticketService.getTickets().subscribe({
      next: (data) => {
        this.allTickets = data;
        this.refresh();
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  /** Recalcula métricas y lista visible a partir de los datos originales. */
  refresh(): void {
    this.computeMetrics();
    this.applyFilters();
  }

  /** reduce(): cuenta completados/pendientes y calcula el % de eficiencia. */
  private computeMetrics(): void {
    const total = this.allTickets.length;
    const completados = this.allTickets.reduce(
      (acc, t) => acc + (t.status === 'completado' ? 1 : 0),
      0
    );
    this.metrics = {
      total,
      completados,
      pendientes: total - completados,
      eficiencia: total ? Math.round((completados / total) * 100) : 0,
    };
  }

  /** filter() por texto/estado/prioridad + sort() por prioridad y luego id. */
  applyFilters(): void {
    const term = this.search.trim().toLowerCase();

    this.tickets = this.allTickets
      .filter((t) => (this.statusFilter === 'todos' ? true : t.status === this.statusFilter))
      .filter((t) => (this.priorityFilter === 'todas' ? true : t.priority === this.priorityFilter))
      .filter((t) => !term || t.title.toLowerCase().includes(term) || String(t.id) === term)
      .sort(
        (a, b) =>
          this.priorityWeight[a.priority] - this.priorityWeight[b.priority] || a.id - b.id
      );
  }

  clearFilters(): void {
    this.search = '';
    this.statusFilter = 'todos';
    this.priorityFilter = 'todas';
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return !!this.search || this.statusFilter !== 'todos' || this.priorityFilter !== 'todas';
  }

  async openAssignModal(ticket: Ticket): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: AssignModalComponent,
      componentProps: { ticket },
    });
    await modal.present();

    const { data, role } = await modal.onWillDismiss<AssignResult>();
    if (role !== 'confirm' || !data) return;

    // map(): actualiza solo el ticket modificado sin tocar los demás
    this.allTickets = this.allTickets.map((t) =>
      t.id === ticket.id ? { ...t, status: data.status, priority: data.priority } : t
    );
    this.refresh();

    const toast = await this.toastCtrl.create({
      message: `Ticket #${ticket.id} actualizado: ${data.status}, prioridad ${data.priority}`,
      duration: 2500,
      color: 'success',
      position: 'bottom',
    });
    await toast.present();
  }

  statusColor(status: TicketStatus): string {
    return status === 'completado' ? 'success' : 'warning';
  }

  priorityColor(priority: TicketPriority): string {
    return priority === 'alta' ? 'danger' : priority === 'media' ? 'warning' : 'medium';
  }

  initials(ticket: Ticket): string {
    return `U${ticket.userId}`;
  }

  trackById(_: number, t: Ticket): number {
    return t.id;
  }
}
