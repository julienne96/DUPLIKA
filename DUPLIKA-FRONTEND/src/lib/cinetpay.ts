export interface CinetPayCheckoutData {
  apiKey: string;
  siteId: string;
  notifyUrl: string;
  mode: string;
  closeAfterResponse: boolean;
  transactionId: string;
  amount: number;
  currency: string;
  channels: string;
  description: string;
  metadata: string;
  customer: {
    id: string;
    name: string;
    surname: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
  };
}

export interface CinetPayPopupResult {
  status?: string;
  amount?: string;
  currency?: string;
  payment_method?: string;
  operator_id?: string;
  message?: string;
  description?: string;
}

interface CinetPaySdk {
  setConfig(config: Record<string, unknown>): void;
  getCheckout(data: Record<string, unknown>): void;
  waitResponse(callback: (data: CinetPayPopupResult) => void): void;
  onClose(callback: (data?: CinetPayPopupResult) => void): void;
  onError(callback: (data?: CinetPayPopupResult) => void): void;
}

declare global {
  interface Window {
    CinetPay?: CinetPaySdk;
  }
}

const SDK_URL = "https://cdn.cinetpay.com/seamless/main.js";
let sdkPromise: Promise<CinetPaySdk> | null = null;

export function loadCinetPaySdk(): Promise<CinetPaySdk> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Le paiement CinetPay nécessite un navigateur."));
  }

  if (window.CinetPay) {
    return Promise.resolve(window.CinetPay);
  }

  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise<CinetPaySdk>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SDK_URL}"]`);
    const script = existing ?? document.createElement("script");

    const onLoad = () => {
      if (window.CinetPay) {
        resolve(window.CinetPay);
        return;
      }

      sdkPromise = null;
      reject(new Error("Le SDK CinetPay n'a pas pu être initialisé."));
    };

    const onError = () => {
      sdkPromise = null;
      reject(new Error("Le guichet CinetPay est momentanément indisponible."));
    };

    script.addEventListener("load", onLoad, { once: true });
    script.addEventListener("error", onError, { once: true });

    if (!existing) {
      script.src = SDK_URL;
      script.async = true;
      document.head.appendChild(script);
    }
  });

  return sdkPromise;
}

export async function openCinetPayPopup(
  checkout: CinetPayCheckoutData,
): Promise<CinetPayPopupResult> {
  const sdk = await loadCinetPaySdk();

  return new Promise<CinetPayPopupResult>((resolve, reject) => {
    let settled = false;

    const finish = (data: CinetPayPopupResult = {}) => {
      if (settled) return;
      settled = true;
      resolve(data);
    };

    sdk.setConfig({
      apikey: checkout.apiKey,
      site_id: /^\d+$/.test(checkout.siteId) ? Number(checkout.siteId) : checkout.siteId,
      notify_url: checkout.notifyUrl,
      mode: checkout.mode,
      close_after_response: checkout.closeAfterResponse,
    });

    sdk.getCheckout({
      transaction_id: checkout.transactionId,
      amount: checkout.amount,
      currency: checkout.currency,
      channels: checkout.channels,
      description: checkout.description,
      metadata: checkout.metadata,
      customer_id: checkout.customer.id,
      customer_name: checkout.customer.name,
      customer_surname: checkout.customer.surname,
      customer_email: checkout.customer.email,
      customer_phone_number: checkout.customer.phone,
      customer_address: checkout.customer.address,
      customer_city: checkout.customer.city,
      customer_country: checkout.customer.country,
    });

    sdk.waitResponse(finish);
    sdk.onClose(finish);
    sdk.onError((data = {}) => {
      if (settled) return;
      settled = true;
      reject(
        new Error(
          data.description ?? data.message ?? "Le paiement CinetPay n'a pas pu être lancé.",
        ),
      );
    });
  });
}
