export const PetSpecies = {
    DOG: 'DOG',
    CAT: 'CAT',
    BIRD: 'BIRD',
    FISH: 'FISH',
    RABBIT: 'RABBIT',
    HAMSTER: 'HAMSTER',
    GUINEA_PIG: 'GUINEA PIG',
    MOUSE_RAT: 'MOUSE RAT',
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
    birth_date?: string | null;
    age?: {
        years: number;
        months: number;
    };
}

export interface PetCreate {
    name: string;
    species: PetSpecies | string;
    breed?: string | null;
    birth_date?: string | null;
}

export type PetUpdate = Partial<PetCreate>;