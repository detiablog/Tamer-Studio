import type { CreditReservation, ReservationId, CreditAmount } from "../../types/billing";

export interface ReservationSystem {
  reserve(
    walletId: string,
    workspaceId: string,
    executionId: string,
    amount: CreditAmount,
  ): Promise<CreditReservation>;
  confirm(reservationId: ReservationId, actualCredits: CreditAmount): Promise<CreditReservation>;
  release(reservationId: ReservationId): Promise<CreditReservation>;
  getActiveReservations(workspaceId: string): Promise<CreditReservation[]>;
  getByExecution(executionId: string): Promise<CreditReservation | undefined>;
}
