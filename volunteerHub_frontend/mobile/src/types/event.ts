export enum EventCategory {
    Environment = 0,
    Education = 1,
    Health = 2,
    Community = 3,
    AnimalCare = 4,
    Social = 5,
    ElderlyCare = 6,
    Children = 7,
    DisabilitySupport = 8,
    FoodDistribution = 9,
    HomelessSupport = 10,
    DisasterRelief = 11,
    Cultural = 12,
    Sports = 13,
    Fundraising = 14
    }  
    
export const EVENT_CATEGORIES :{label: string, value: EventCategory}[] = [
    {label: "Environment", value: EventCategory.Environment},
    {label: "Education", value: EventCategory.Education},
    {label: "Health", value: EventCategory.Health},
    {label: "Community", value: EventCategory.Community},
    {label: "Animal Care", value: EventCategory.AnimalCare},
    {label: "Social", value: EventCategory.Social},
    {label: "Elderly Care", value: EventCategory.ElderlyCare},
    {label: "Children", value: EventCategory.Children},
    {label: "Disability Support", value: EventCategory.DisabilitySupport},
    {label: "Food Distribution", value: EventCategory.FoodDistribution},
    {label: "Homeless Support", value: EventCategory.HomelessSupport},
    {label: "Disaster Relief", value: EventCategory.DisasterRelief},
    {label: "Cultural", value: EventCategory.Cultural},
    {label: "Sports", value: EventCategory.Sports},
    {label: "Fundraising", value: EventCategory.Fundraising},
];

export type EventRequest ={
    title: string;
    description: string;
    category: EventCategory;
    startDateTime: string;
    endDateTime: string;
    locationName: string;
    address: string;
    latitude: number;
    longitude: number;
    maxVolunteers?: number | null;
}

export type EventResponse = {
    id: string;
    title: string;
    description: string;
    category: EventCategory;
    startDateTime: string;
    endDateTime: string;
    locationName: string;
    address: string;
    latitude: number;
    longitude: number;
    maxVolunteers?: number | null;
    status: EventStatus;
    createdAt: Date;
    createdById: string;
    distance?: number | null;
    adminNotes?: string;
    creatorName?: string;
    creatorEmail?: string;
}

export enum EventStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2
}

export type PagedResult<T> = {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
}