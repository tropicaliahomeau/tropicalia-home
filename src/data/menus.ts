export interface Meal {
    id: number;
    day: string;
    title: string;
    description: string;
    tags: string[];
    image: string;
    sides?: string[];
    dessert?: string;
}

export interface WeeklyMenu {
    id: string;
    name: string;
    startDate?: string;
    meals: Meal[];
}

export const MENUS: WeeklyMenu[] = [
    {
        id: "week-1",
        name: "Week 1",
        meals: [
            {
                id: 101,
                day: "Monday",
                title: "Juliana’s de pollo miel mostaza",
                description: "Tiras de pollo en salsa miel mostaza acompañadas de arroz con fideos y vegetales salteados o al horno.",
                tags: ["Pollo", "Agridulce"],
                image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", // Placeholder
                sides: ["Arroz con fideos", "Vegetales salteados o al horno"]
            },
            {
                id: 102,
                day: "Tuesday",
                title: "Sopita de Lentejas & Carne Desmechada",
                description: "Sopa de lentejas casera acompañada de carne desmechada, arroz, huevo frito y tajada de plátano maduro.",
                tags: ["Tradicional", "Completo"],
                image: "https://images.unsplash.com/photo-1547592166-23acbe346499?auto=format&fit=crop&w=800&q=80", // Placeholder
                sides: ["Arroz", "Huevo frito", "Tajada de plátano maduro"]
            },
            {
                id: 103,
                day: "Wednesday",
                title: "Albóndigas en Salsa de Mora",
                description: "Albóndigas jugosas en salsa de mora servidas con puré de papa y vegetales al vapor con queso parmesano.",
                tags: ["Gourmet", "Carne"],
                image: "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=800&q=80", // Placeholder
                sides: ["Puré de papa", "Habichuela y zanahoria al vapor", "Queso Parmesano"]
            },
            {
                id: 104,
                day: "Thursday",
                title: "Frijoles Enchilados",
                description: "Frijoles con toque picante servidos con arroz blanco, totopos, guacamole y pico de gallo.",
                tags: ["Picante", "Mexicano"],
                image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80", // Placeholder
                sides: ["Arroz blanco", "Totopos", "Guacamole", "Pico de gallo"]
            },
            {
                id: 105,
                day: "Friday",
                title: "Sancocho Tradicional",
                description: "Sopa de sancocho con carne, papa, yuca y plátano. Acompañado de arroz, salsa de ají y tajada de bocadillo con queso.",
                tags: ["Sopa", "Típico"],
                image: "https://images.unsplash.com/photo-1574484284008-be9d62827669?auto=format&fit=crop&w=800&q=80", // Placeholder
                sides: ["Arroz", "Salsa de ají", "Tajada de bocadillo con queso campesino"]
            }
        ]
    },
    {
        id: "week-2",
        name: "Week 2",
        meals: [
            {
                id: 201,
                day: "Monday",
                title: "Arroz con Pollo",
                description: "Clásico arroz con pollo y verduras, servido con tajadas de plátano, salsa rosada y ensalada fresca.",
                tags: ["Clásico", "Pollo"],
                image: "https://images.unsplash.com/photo-1594957659220-413159074d6c?auto=format&fit=crop&w=800&q=80", // Placeholder
                sides: ["Tajadas de plátano", "Salsa rosada", "Ensalada fresca"]
            },
            {
                id: 202,
                day: "Tuesday",
                title: "Pasta Boloñesa",
                description: "Pasta con salsa boloñesa casera acompañada de pan de ajo. Incluye postre.",
                tags: ["Italiano", "Pasta"],
                image: "https://images.unsplash.com/photo-1626844131082-256783844137?auto=format&fit=crop&w=800&q=80", // Placeholder
                sides: ["Pan de ajo"],
                dessert: "Gelatina con leche condensada"
            },
            {
                id: 203,
                day: "Wednesday",
                title: "Sudado de Pollo",
                description: "Pollo sudado en salsa criolla servido con arroz con fideos y tajadas de plátano.",
                tags: ["Casero", "Reconfortante"],
                image: "https://images.unsplash.com/photo-1604908177453-7462950a6a3b?auto=format&fit=crop&w=800&q=80", // Placeholder
                sides: ["Arroz con fideos", "Tajadas de plátano"]
            },
            {
                id: 204,
                day: "Thursday",
                title: "Shepherd’s Pie Latino",
                description: "Pastel de carne molida con verduras, cubierto con puré de coliflor y papa gratinado con queso. Acompañado de pan de ajo.",
                tags: ["Gratinado", "Horneado"],
                image: "https://images.unsplash.com/photo-1612443015488-8422459bb6e2?auto=format&fit=crop&w=800&q=80", // Placeholder
                sides: ["Pan de ajo"]
            },
            {
                id: 205,
                day: "Friday",
                title: "Chuletas Vallunas",
                description: "Chuleta de cerdo apanada servida con arroz con cubitos de papa y ají de lulo.",
                tags: ["Valluno", "Frito"],
                image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=800&q=80", // Placeholder
                sides: ["Arroz con cubitos de papa", "Ají de lulo", "Aborrajado O Bocaditos de plátano"]
            }
        ]
    },
    {
        id: "week-3",
        name: "Week 3",
        meals: [
            {
                id: 301,
                day: "Monday",
                title: "Ajiaco Santafereño",
                description: "Sopa tradicional de ajiaco servida con pernil de pollo, arroz blanco y tajadas de plátano.",
                tags: ["Sopa", "Bogotano"],
                image: "https://images.unsplash.com/photo-1574484284008-be9d62827669?auto=format&fit=crop&w=800&q=80", // Placeholder
                sides: ["Pernil de pollo", "Arroz blanco", "Tajadas de plátano"]
            },
            {
                id: 302,
                day: "Tuesday",
                title: "Carne Desmechada & Patacones",
                description: "Carne desmechada en su jugo servida con arroz de cilantro, patacones y guacamole.",
                tags: ["Caribe", "Sabroso"],
                image: "https://images.unsplash.com/photo-1547592166-23acbe346499?auto=format&fit=crop&w=800&q=80", // Placeholder
                sides: ["Arroz de cilantro", "Patacones", "Salsa de guacamole"]
            },
            {
                id: 303,
                day: "Wednesday",
                title: "Pasta Penne al Pesto",
                description: "Pasta penne con pollo en salsa pesto cremosa, acompañada de tostadas con ajo.",
                tags: ["Internacional", "Pasta"],
                image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=800&q=80", // Placeholder
                sides: ["Tostadas con ajo"]
            },
            {
                id: 304,
                day: "Thursday",
                title: "Fajitas de Carne",
                description: "Fajitas de carne con pimentón y cebolla salteados, acompañadas de arroz con verduras y tortilla.",
                tags: ["Tex-Mex", "Salteado"],
                image: "https://images.unsplash.com/photo-1534352956036-cd81e27dd615?auto=format&fit=crop&w=800&q=80", // Placeholder
                sides: ["Arroz con verduras", "Tortilla"]
            },
            {
                id: 305,
                day: "Friday",
                title: "Frijolada Paisa",
                description: "Sopita de frijol con arroz, maicitos, chicharrón, chorizo y maduro en cubitos. Incluye nachos de arepa.",
                tags: ["Paisa", "Completo"],
                image: "https://images.unsplash.com/photo-1567608285969-48e4bbe2d78d?auto=format&fit=crop&w=800&q=80", // Placeholder
                sides: ["Arroz", "Chicharrón", "Chorizo", "Maduro", "Nachos de arepa", "Hogao"]
            }
        ]
    }
];
