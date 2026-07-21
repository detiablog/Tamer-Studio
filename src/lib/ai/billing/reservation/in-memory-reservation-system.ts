import type { ReservationSystem, CreditReservation } from "../../types/billing";
import type { ReservationId, CreditAmount } from "../../types/billing";

export class InMemoryReservationSystem implements ReservationSystem {
  private reservations: Map<ReservationId, CreditReservation> = new Map();
  private byWorkspace: Map<string, ReservationId[]> = new Map();
  private byExecution: Map<string, ReservationId> = new Map();

  async reserve(
    walletId: string,
    workspaceId: string,
    executionId: string,
    amount: CreditAmount,
  ): Promise<CreditReservation> {
    const id = `res_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const createdAt = new Date().toISOString();
    const reservation: CreditReservation = {
      id,
      walletId,
      workspaceId,
      executionId,
      amount,
      status: "active",
      createdAt,
    };

    this.reservations.set(id, reservation);
    this.byWorkspace.set(workspaceId, [...(this.byWorkspace.get(workspaceId) ?? []), id]);
    this.byExecution.set(executionId, id);

    return reservation;
  }

  async confirm(reservationId: ReservationId, _actualCredits: CreditAmount): Promise<CreditReservation> {
    const reservation = this.reservations.get(reservationId);
    if (!reservation) {
      throw new Error(`Reservation ${reservationId} not found`);
    }

    reservation.status = "converted";
    reservation.releasedAt = new Date().toISOString();
    reservation.convertedTransactionId = `tx_${Date.now()}`;

    return reservation;
  }

  async release(reservationId: ReservationId): Promise<CreditReservation> {
    const reservation = this.reservations.get(reservationId);
    if (!reservation) {
      throw new Error(`Reservation ${reservationId} not found`);
    }

    reservation.status = "released";
    reservation.releasedAt = new Date().toISOString();

    return reservation;
  }

  async getActiveReservations(workspaceId: string): Promise<CreditReservation[]> {
    const ids = this.byWorkspace.get(workspaceId) ?? [];
    return ids
      .map((id) => this.reservations.get(id))
      .filter((r): r is CreditReservation => r !== undefined && r.status === "active");
  }

  async getByExecution(executionId: string): Promise<CreditReservation | undefined> {
    const id = this.byExecution.get(executionId);
    if (!id) return undefined;
    return this.reservations.get(id);
  }
}
