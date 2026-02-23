
export interface KPI {
    label: string;
    value: number | string;
    change: number; // Percentage
    isCurrency?: boolean;
}

export interface ChartData {
    name: string;
    value: number;
    [key: string]: any;
}

export interface ManagementReport {
    weekId: string;
    kpis: {
        totalOrders: KPI;
        activeClients: KPI;
        returningClients: KPI;
        totalRevenue: KPI;
    };
    revenueTrend: ChartData[];
    dishDistribution: ChartData[];
    retentionRate: number; // 0-100
    customerStatus: {
        new: number;
        returning: number;
        lost: number;
    };
    pickupStats: {
        registrations: number;
        buyers: number;
        conversionRate: number;
        unclaimed: number;
    };
}

export const getManagementReport = async (): Promise<ManagementReport> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
        weekId: "Current Week",
        kpis: {
            totalOrders: { label: "Total Orders", value: 145, change: 12 },
            activeClients: { label: "Active Clients", value: 85, change: 5 },
            returningClients: { label: "Returning Clients", value: 68, change: 8 },
            totalRevenue: { label: "Total Revenue", value: 4850, change: 15, isCurrency: true },
        },
        revenueTrend: [
            { name: "Week 1", value: 3800 },
            { name: "Week 2", value: 4100 },
            { name: "Week 3", value: 3950 },
            { name: "Week 4", value: 4250 },
            { name: "Week 5", value: 4500 },
            { name: "Current", value: 4850 },
        ],
        dishDistribution: [
            { name: "Feijoada", value: 45 },
            { name: "Picanha", value: 38 },
            { name: "Fish Tacos", value: 32 },
            { name: "Moqueca", value: 25 },
            { name: "Chicken Bowl", value: 18 },
        ],
        retentionRate: 78,
        customerStatus: {
            new: 15,
            returning: 68,
            lost: 4,
        },
        pickupStats: {
            registrations: 92,
            buyers: 85,
            conversionRate: 92.4,
            unclaimed: 2,
        }
    };
};
