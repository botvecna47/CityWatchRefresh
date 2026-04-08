export interface Comment {
  id: string;
  author: { name: string; avatar: string };
  text: string;
  timestamp: string;
  upvotes: number;
  replies?: Comment[];
}

export interface Report {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  author: { name: string; avatar: string };
  timestamp: string;
  location: string;
  area: "North Area" | "South Area" | "East Area";
  status: "Reported" | "In Progress" | "Completed";
  upvotes: number;
  downvotes: number;
  comments: number;
  category: string;
  commentsList?: Comment[];
  assignedTo?: string;
  priority?: "Low" | "Medium" | "High" | "Critical";
}

export const mockReports: Report[] = [
  {
    id: "1",
    title: "Large pothole on Main Street causing traffic hazards",
    description: "A significant pothole has formed near the intersection of Main St and Oak Ave. Multiple vehicles have been damaged. Urgent repair needed. The pothole is approximately 2 feet wide and 6 inches deep, creating a serious danger for cyclists and motorcyclists. Several residents have filed complaints with the city council.",
    imageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&q=80",
    author: { name: "Sarah Johnson", avatar: "SJ" },
    timestamp: "2 hours ago",
    location: "Main St & Oak Ave",
    area: "North Area",
    status: "Reported",
    upvotes: 47,
    downvotes: 2,
    comments: 12,
    category: "Roads",
    priority: "High",
    assignedTo: "Alex Thompson",
    commentsList: [
      { id: "c1", author: { name: "Michael Chen", avatar: "MC" }, text: "I hit this pothole yesterday and my tire got damaged. This is extremely dangerous!", timestamp: "1 hour ago", upvotes: 8 },
      { id: "c2", author: { name: "Lisa Wang", avatar: "LW" }, text: "Same issue here. We need to put warning cones around it at minimum.", timestamp: "45 min ago", upvotes: 5, replies: [
        { id: "c2r1", author: { name: "Sarah Johnson", avatar: "SJ" }, text: "I've placed some temporary markers around it. Please be careful!", timestamp: "30 min ago", upvotes: 3 },
      ]},
      { id: "c3", author: { name: "David Park", avatar: "DP" }, text: "Has anyone contacted the roads department directly?", timestamp: "20 min ago", upvotes: 2 },
    ],
  },
  {
    id: "2",
    title: "Broken streetlight on Elm Boulevard - safety concern",
    description: "The streetlight at 245 Elm Blvd has been out for a week. The area is very dark at night, creating safety concerns for pedestrians. Multiple residents have reported near-miss incidents with vehicles due to poor visibility.",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80",
    author: { name: "Michael Chen", avatar: "MC" },
    timestamp: "5 hours ago",
    location: "245 Elm Boulevard",
    area: "South Area",
    status: "In Progress",
    upvotes: 31,
    downvotes: 0,
    comments: 8,
    category: "Lighting",
    priority: "Medium",
    assignedTo: "Maria Garcia",
    commentsList: [
      { id: "c4", author: { name: "Emily Rodriguez", avatar: "ER" }, text: "This is a school zone area. Children walk here every morning.", timestamp: "4 hours ago", upvotes: 12 },
      { id: "c5", author: { name: "James Morrison", avatar: "JM" }, text: "The electrical team visited today. Should be fixed by end of week.", timestamp: "2 hours ago", upvotes: 6 },
    ],
  },
  {
    id: "3",
    title: "Overflowing garbage bins at Central Park",
    description: "The public garbage bins near the playground at Central Park have been overflowing for three days. Attracting pests and causing odor. This is a health hazard, especially for children using the playground.",
    imageUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&q=80",
    author: { name: "Emily Rodriguez", avatar: "ER" },
    timestamp: "1 day ago",
    location: "Central Park - Playground Area",
    area: "East Area",
    status: "Completed",
    upvotes: 65,
    downvotes: 1,
    comments: 23,
    category: "Sanitation",
    priority: "Medium",
    assignedTo: "Robert Kim",
    commentsList: [
      { id: "c6", author: { name: "Sarah Johnson", avatar: "SJ" }, text: "Thank you for resolving this so quickly! The park looks great now.", timestamp: "2 hours ago", upvotes: 15 },
    ],
  },
  {
    id: "4",
    title: "Water main leak flooding residential street",
    description: "Water has been continuously leaking from a broken water main on Cedar Lane for the past 12 hours. Street is partially flooded. Residents are unable to access driveways.",
    imageUrl: "https://images.unsplash.com/photo-1504173010664-32509aeebb62?w=600&q=80",
    author: { name: "David Park", avatar: "DP" },
    timestamp: "8 hours ago",
    location: "Cedar Lane, Block 7",
    area: "North Area",
    status: "In Progress",
    upvotes: 89,
    downvotes: 0,
    comments: 34,
    category: "Water",
    priority: "Critical",
    assignedTo: "Alex Thompson",
    commentsList: [
      { id: "c7", author: { name: "Michael Chen", avatar: "MC" }, text: "The water pressure in nearby buildings has dropped significantly.", timestamp: "6 hours ago", upvotes: 9 },
    ],
  },
  {
    id: "5",
    title: "Damaged sidewalk creating accessibility barrier",
    description: "Cracked and uneven sidewalk tiles on River Road make it impossible for wheelchair users to pass safely. Multiple sections affected over a 200-meter stretch.",
    imageUrl: "https://images.unsplash.com/photo-1567789884554-0b844b597180?w=600&q=80",
    author: { name: "Lisa Wang", avatar: "LW" },
    timestamp: "3 days ago",
    location: "River Road, Section B",
    area: "South Area",
    status: "Reported",
    upvotes: 42,
    downvotes: 3,
    comments: 15,
    category: "Sidewalks",
    priority: "High",
    commentsList: [],
  },
  {
    id: "6",
    title: "Graffiti vandalism on community center walls",
    description: "Extensive graffiti has been sprayed on the east wall of the Maple Community Center overnight. Need cleanup and possibly security cameras.",
    imageUrl: "https://images.unsplash.com/photo-1533622597524-a1215e26c0a2?w=600&q=80",
    author: { name: "James Morrison", avatar: "JM" },
    timestamp: "12 hours ago",
    location: "Maple Community Center",
    area: "East Area",
    status: "Reported",
    upvotes: 18,
    downvotes: 5,
    comments: 6,
    category: "Vandalism",
    priority: "Low",
    commentsList: [],
  },
];

export interface Coordinator {
  id: string;
  name: string;
  email: string;
  area: "North Area" | "South Area" | "East Area";
  resolved: number;
  pending: number;
  status: "Active" | "Suspended" | "Inactive";
  joinedDate: string;
  phone: string;
  rating: number;
}

export const mockCoordinators: Coordinator[] = [
  { id: "c1", name: "Alex Thompson", email: "alex.t@citywatch.gov", area: "North Area", resolved: 34, pending: 5, status: "Active", joinedDate: "2024-01-15", phone: "+1 555-0101", rating: 4.8 },
  { id: "c2", name: "Maria Garcia", email: "maria.g@citywatch.gov", area: "South Area", resolved: 28, pending: 8, status: "Active", joinedDate: "2024-03-22", phone: "+1 555-0102", rating: 4.5 },
  { id: "c3", name: "Robert Kim", email: "robert.k@citywatch.gov", area: "East Area", resolved: 41, pending: 3, status: "Active", joinedDate: "2023-11-08", phone: "+1 555-0103", rating: 4.9 },
  { id: "c4", name: "Jennifer Lee", email: "jennifer.l@citywatch.gov", area: "North Area", resolved: 12, pending: 2, status: "Suspended", joinedDate: "2024-06-01", phone: "+1 555-0104", rating: 3.2 },
  { id: "c5", name: "Carlos Rivera", email: "carlos.r@citywatch.gov", area: "South Area", resolved: 8, pending: 0, status: "Inactive", joinedDate: "2024-08-15", phone: "+1 555-0105", rating: 4.0 },
];

export interface CityUser {
  id: string;
  name: string;
  email: string;
  role: "Citizen" | "Coordinator" | "Admin";
  reportsCount: number;
  joinedDate: string;
  status: "Active" | "Banned" | "Warned";
  lastActive: string;
}

export const mockUsers: CityUser[] = [
  { id: "u1", name: "Sarah Johnson", email: "sarah.j@email.com", role: "Citizen", reportsCount: 12, joinedDate: "2024-01-10", status: "Active", lastActive: "2 hours ago" },
  { id: "u2", name: "Michael Chen", email: "michael.c@email.com", role: "Citizen", reportsCount: 8, joinedDate: "2024-02-14", status: "Active", lastActive: "5 hours ago" },
  { id: "u3", name: "Emily Rodriguez", email: "emily.r@email.com", role: "Citizen", reportsCount: 15, joinedDate: "2023-12-01", status: "Active", lastActive: "1 day ago" },
  { id: "u4", name: "David Park", email: "david.p@email.com", role: "Citizen", reportsCount: 6, joinedDate: "2024-04-20", status: "Warned", lastActive: "8 hours ago" },
  { id: "u5", name: "Lisa Wang", email: "lisa.w@email.com", role: "Citizen", reportsCount: 3, joinedDate: "2024-07-05", status: "Active", lastActive: "3 days ago" },
  { id: "u6", name: "James Morrison", email: "james.m@email.com", role: "Citizen", reportsCount: 1, joinedDate: "2024-09-01", status: "Banned", lastActive: "1 week ago" },
  { id: "u7", name: "Nina Patel", email: "nina.p@email.com", role: "Citizen", reportsCount: 22, joinedDate: "2023-08-15", status: "Active", lastActive: "1 hour ago" },
];
