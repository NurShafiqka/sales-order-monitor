const currency = new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR" });
const number = new Intl.NumberFormat("en-MY");
const date = new Intl.DateTimeFormat("en-MY", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kuala_Lumpur",
});

const dateTime = new Intl.DateTimeFormat("en-MY", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Kuala_Lumpur",
});

export const formatCurrency = (value: number) => currency.format(value);
export const formatDateTime = (iso: string) => dateTime.format(new Date(iso));
export const formatNumber = (value: number) => number.format(value);
export const formatDate = (iso: string) => date.format(new Date(iso));
