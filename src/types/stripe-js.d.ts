export {};

type StripeCardElement = {
  mount: (el: string | HTMLElement) => void;
  unmount: () => void;
  on: (event: string, handler: (e: { error?: { message?: string } }) => void) => void;
};

type StripeElements = {
  create: (type: string, options?: Record<string, unknown>) => StripeCardElement;
};

type StripeConfirmResult = {
  error?: { message?: string };
  paymentIntent?: { id: string; status: string };
  setupIntent?: { id: string; status: string };
};

type StripeInstance = {
  elements: (options?: Record<string, unknown>) => StripeElements;
  confirmCardPayment: (clientSecret: string, data: Record<string, unknown>) => Promise<StripeConfirmResult>;
  confirmCardSetup: (clientSecret: string, data: Record<string, unknown>) => Promise<StripeConfirmResult>;
};

declare global {
  interface Window {
    Stripe?: (key: string) => StripeInstance;
  }
}
