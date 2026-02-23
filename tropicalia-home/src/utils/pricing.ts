// Pricing Logic for Tropicalia HOME V2

interface ExtraItem {
    id: string;
    price: number;
    quantity: number;
}

interface PriceCalculationResult {
    subtotalDays: number;
    subtotalExtras: number;
    total: number;
    isFullWeek: boolean;
    pricePerDay: number;
}

export const PRICING_RULES = {
    FULL_WEEK_DAYS: 5,
    FULL_WEEK_PRICE: 85.00,
    daily_price_under_5_days: 18.00, // Derived from prompt: 4 days = $72 ($18/day)
};

export function calculateOrderTotal(
    selectedDaysCount: number,
    extras: ExtraItem[] = []
): PriceCalculationResult {
    const isFullWeek = selectedDaysCount >= PRICING_RULES.FULL_WEEK_DAYS;

    // Calculate Days Cost
    let subtotalDays = 0;
    let pricePerDay = 0;

    if (isFullWeek) {
        // If they select 5 (or logic could allow >5 if weekend supported later, but rule says 5 days)
        // Adjust if they somehow select more than 5? Assuming max 5 M-F.
        // Rule: "Semana completa (5 días) = $85"
        // If user selected 6 days (hypothetically), we might need clarification. 
        // Assuming strict M-F cycle.
        subtotalDays = PRICING_RULES.FULL_WEEK_PRICE;
        pricePerDay = PRICING_RULES.FULL_WEEK_PRICE / 5; // $17
    } else {
        // Rule: "Si el cliente elige menos de 5 días, el precio por día sube $1"
        // Prompt example: 4 days = $72 ($18/day).
        // $17 (base) + $1 = $18. Correct.
        pricePerDay = PRICING_RULES.daily_price_under_5_days;
        subtotalDays = selectedDaysCount * pricePerDay;
    }

    // Calculate Extras Cost
    const subtotalExtras = extras.reduce((acc, item) => {
        return acc + (item.price * item.quantity);
    }, 0);

    const total = subtotalDays + subtotalExtras;

    return {
        subtotalDays,
        subtotalExtras,
        total,
        isFullWeek,
        pricePerDay
    };
}
