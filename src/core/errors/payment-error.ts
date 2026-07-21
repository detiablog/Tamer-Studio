export class PaymentError extends Error {
  constructor(message: string, public code = "PAYMENT_ERROR") {
    super(message);
    this.name = "PaymentError";
  }
}

export class PaymentFailedError extends PaymentError {
  constructor(message = "Payment failed") {
    super(message, "PAYMENT_FAILED");
  }
}

export class InsufficientCreditsError extends PaymentError {
  constructor(message = "Insufficient credits") {
    super(message, "PAYMENT_INSUFFICIENT_CREDITS");
  }
}
