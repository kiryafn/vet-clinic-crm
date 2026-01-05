export const PetSpecies = {
    DOG: 'DOG',
    CAT: 'CAT',
    BIRD: 'BIRD',
    FISH: 'FISH',
    RABBIT: 'RABBIT',
    HAMSTER: 'HAMSTER',
    GUINEA_PIG: 'GUINEA_PIG',
    MOUSE_RAT: 'MOUSE_RAT',
    FERRET: 'FERRET',
    REPTILE: 'REPTILE',
    AMPHIBIAN: 'AMPHIBIAN',
    HORSE: 'HORSE',
    LIVESTOCK: 'LIVESTOCK',
    EXOTIC: 'EXOTIC',
    OTHER: 'OTHER'
} as const;

export type PetSpecies = (typeof PetSpecies)[keyof typeof PetSpecies];

export interface Pet {
    id: number;
    name: string;
    species: PetSpecies | string;
    breed?: string | null;
    birth_date?: string | null; // ISO Date YYYY-MM-DD
    notes?: string | null;
    age?: {
        years: number;
        months: number;
    };
}

export interface PetCreateDto {
    name: string;
    species: PetSpecies | string;
    breed?: string | null;
    birth_date?: string | null;
    notes?: string;
}