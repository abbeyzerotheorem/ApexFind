import { PlaceHolderImages } from './placeholder-images';

export const PlaceHolderAgents = [
    {
      id: 1,
      name: "Amina Adebayo",
      title: "Lead Agent",
      company: "Apex Realty",
      imageUrl: PlaceHolderImages.find((img) => img.id === "agent-1")?.imageUrl ?? "",
      imageHint: PlaceHolderImages.find((img) => img.id === "agent-1")?.imageHint ?? "",
      experience: 8,
      sales: 120,
      rating: 4.9,
      reviewCount: 75,
      location: "Lagos",
      languages: ["English", "Yoruba"],
      specialties: ["Luxury Homes", "First-time Buyers"]
    },
    {
      id: 2,
      name: "Chinedu Okoro",
      title: "Senior Partner",
      company: "Urban Dwellings",
      imageUrl: PlaceHolderImages.find((img) => img.id === "agent-2")?.imageUrl ?? "",
      imageHint: PlaceHolderImages.find((img) => img.id === "agent-2")?.imageHint ?? "",
      experience: 12,
      sales: 250,
      rating: 4.8,
      reviewCount: 112,
      location: "Abuja",
      languages: ["English", "Igbo"],
      specialties: ["Commercial Properties", "Relocation"]
    },
    {
      id: 3,
      name: "Fatima Bello",
      title: "Associate Broker",
      company: "Kano Properties",
      imageUrl: PlaceHolderImages.find((img) => img.id === "agent-4")?.imageUrl ?? "",
      imageHint: PlaceHolderImages.find((img) => img.id === "agent-4")?.imageHint ?? "",
      experience: 6,
      sales: 85,
      rating: 4.9,
      reviewCount: 60,
      location: "Kano",
      languages: ["English", "Hausa"],
      specialties: ["Land Sales", "New Developments"]
    },
    {
      id: 4,
      name: "David Adeleke",
      title: "Real Estate Consultant",
      company: "Osun Homes",
      imageUrl: PlaceHolderImages.find((img) => img.id === "agent-5")?.imageUrl ?? "",
      imageHint: PlaceHolderImages.find((img) => img.id === "agent-5")?.imageHint ?? "",
      experience: 5,
      sales: 60,
      rating: 4.7,
      reviewCount: 45,
      location: "Ibadan",
      languages: ["English", "Yoruba"],
      specialties: ["Rentals", "Property Management"]
    },
     {
      id: 5,
      name: "Ngozi Eze",
      title: "Principal Agent",
      company: "Enugu Estates",
      imageUrl: PlaceHolderImages.find((img) => img.id === "agent-6")?.imageUrl ?? "",
      imageHint: PlaceHolderImages.find((img) => img.id === "agent-6")?.imageHint ?? "",
      experience: 10,
      sales: 150,
      rating: 5.0,
      reviewCount: 95,
      location: "Port Harcourt",
      languages: ["English", "Igbo"],
      specialties: ["Waterfront Properties", "Investment Properties"]
    },
     {
      id: 6,
      name: "Ibrahim Musa",
      title: "Agent",
      company: "Northern Realty",
      imageUrl: PlaceHolderImages.find((img) => img.id === "agent-3")?.imageUrl ?? "",
      imageHint: PlaceHolderImages.find((img) => img.id === "agent-3")?.imageHint ?? "",
      experience: 4,
      sales: 40,
      rating: 4.6,
      reviewCount: 30,
      location: "Kaduna",
      languages: ["English", "Hausa"],
      specialties: ["Residential Sales", "First-time Buyers"]
    }
  ];
  
  export type Agent = typeof PlaceHolderAgents[0];