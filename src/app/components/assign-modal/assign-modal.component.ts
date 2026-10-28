import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonNote,
  ModalController,
} from '@ionic/angular/standalone';

import { Ticket, TicketPriority, TicketStatus } from '../../models/ticket.model';

export interface AssignResult {
  status: TicketStatus;
  priority: TicketPriority;
}

@Component({
  selector: 'app-assign-modal',
  standalone: true,
  imports: [
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonNote,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Asignar ticket #{{ ticket.id }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cancel()">Cerrar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item lines="none">
        <ion-label class="ion-text-wrap">
          <h2>{{ ticket.title }}</h2>
          <p>Usuario {{ ticket.userId }}</p>
        </ion-label>
      </ion-item>

      <ion-item>
        <ion-select
          label="Estado"
          labelPlacement="floating"
          placeholder="Seleccione un estado"
          [(ngModel)]="status"
        >
          <ion-select-option value="pendiente">Pendiente</ion-select-option>
          <ion-select-option value="completado">Completado</ion-select-option>
        </ion-select>
      </ion-item>

      <ion-item>
        <ion-select
          label="Prioridad"
          labelPlacement="floating"
          placeholder="Seleccione una prioridad"
          [(ngModel)]="priority"
        >
          <ion-select-option value="alta">Alta</ion-select-option>
          <ion-select-option value="media">Media</ion-select-option>
          <ion-select-option value="baja">Baja</ion-select-option>
        </ion-select>
      </ion-item>

      @if (!isValid) {
        <ion-note color="danger" class="ion-padding-start">
          Estado y prioridad son obligatorios.
        </ion-note>
      }

      <ion-button
        expand="block"
        class="ion-margin-top"
        [disabled]="!isValid"
        (click)="save()"
      >
        Guardar cambios
      </ion-button>
    </ion-content>
  `,
})
export class AssignModalComponent implements OnInit {
  @Input() ticket!: Ticket;

  status: TicketStatus | null = null;
  priority: TicketPriority | null = null;

  constructor(private modalCtrl: ModalController) {}

  ngOnInit(): void {
    this.status = this.ticket.status;
    this.priority = this.ticket.priority;
  }

  get isValid(): boolean {
    return !!this.status && !!this.priority;
  }

  cancel(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  save(): void {
    if (!this.isValid) return;
    const result: AssignResult = { status: this.status!, priority: this.priority! };
    this.modalCtrl.dismiss(result, 'confirm');
  }
}
