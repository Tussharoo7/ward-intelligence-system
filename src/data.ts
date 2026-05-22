import { User, Ward, Candidate, Issue, FeedbackEntry, LeaderboardEntry } from './types';

// Let's create prominent wards with specific local descriptions
export const PROMINENT_WARDS_INFO = [
  { id: 1, name: "Gandhi Nagar / Airport Road", population: 28400 },
  { id: 4, name: "Nanda Nagar", population: 31200 },
  { id: 10, name: "Vijay Nagar", population: 42000 },
  { id: 18, name: "LIG Colony Area", population: 24500 },
  { id: 25, name: "Khajrana Chowk Area", population: 45600 },
  { id: 32, name: "Palasia / Saket", population: 19800 },
  { id: 45, name: "Rajwada / Sarafa Market", population: 18200 },
  { id: 54, name: "Annapurna Mandir Area", population: 33500 },
  { id: 62, name: "Bhawarkua / University Rd", population: 39100 },
  { id: 75, name: "Manik Bagh Road", population: 27900 },
  { id: 85, name: "Bicholi Hapsi Suburbs", population: 21400 }
];

// Helper to look up ward name
export function getWardName(wardNum: number): string {
  const prom = PROMINENT_WARDS_INFO.find(w => w.id === wardNum);
  if (prom) return prom.name;
  
  // Generic Indore Sector ward names
  const areas = ["Sudama Nagar Sector", "Sch No 54", "Sch No 78", "Bengali Square Area", 
                 "Choithram Range", "Rau Bypass Sector", "Malharganj Grid", "Chhatripura Sector",
                 "Dwarkapuri Ext", "Kanadiya Road Belt", "Lokmanya Nagar", "MR 10 Corridor"];
  const sectorName = areas[wardNum % areas.length];
  return `${sectorName} (Ward ${wardNum})`;
}

// Generate standard candidates list
export function generateCandidates(wardId: number): Candidate[] {
  const parties: ('BJP' | 'INC' | 'AAP' | 'IND')[] = ['BJP', 'INC', 'AAP', 'IND'];
  
  // Create candidate names based on ward id
  const maleFirstNames = ["Suresh", "Ramesh", "Anil", "Sanjay", "Vijay", "Rajesh", "Kamlesh", "Manoj", "Jitendra", "Shailendra", "Deepak", "Vikram"];
  const femaleFirstNames = ["Sunita", "Jyoti", "Kiran", "Mamta", "Preeti", "Alka", "Sadhana", "Pooja", "Maya", "Sharda", "Asha", "Rekha"];
  const lastNames = ["Patel", "Sharma", "Verma", "Trivedi", "Mandloi", "Yadav", "Choudhary", "Rathore", "Mishra", "Pandey", "Shrivastava", "Joshi"];

  const candidateCount = 3; // 3 candidates per ward (BJP, INC, plus either AAP or IND code-based)
  const candidates: Candidate[] = [];

  for (let i = 0; i < candidateCount; i++) {
    const isFemale = (wardId + i) % 3 === 0;
    const firstName = isFemale 
      ? femaleFirstNames[(wardId * 7 + i * 11) % femaleFirstNames.length]
      : maleFirstNames[(wardId * 5 + i * 13) % maleFirstNames.length];
    const lastName = lastNames[(wardId * 3 + i * 17) % lastNames.length];
    const name = `${firstName} ${lastName}`;
    
    const party = parties[i % parties.length];
    const id = `w${wardId}-c${i + 1}-${party.toLowerCase()}`;
    
    // Support percentages base: BJP & Congress are primary, with some AAP/IND variation
    let supportPercent = 40; // Base
    if (party === 'BJP') {
      supportPercent = 45 + ((wardId * 73) % 15) - 5; // 40% - 55%
    } else if (party === 'INC') {
      supportPercent = 35 + ((wardId * 47) % 15) - 3; // 32% - 47%
    } else {
      supportPercent = 100 - 45 - 35; // residual share split
    }

    // Sparkline support history trends (5 data points over last 5 weeks)
    const trend: number[] = [];
    let cur = supportPercent - 4;
    for (let t = 0; t < 5; t++) {
      cur += ((wardId * 13 + t * 41) % 4) - 1.5; // subtle walk
      trend.push(Math.round(Math.max(2, Math.min(98, cur))));
    }
    // Set the latest trend value as current support percent
    supportPercent = trend[4];

    // Mock comments for analysis
    const comments = [
      {
        id: `${id}-com1`,
        authorName: isFemale ? "Rajesh Solanki" : "Priya Mandloi",
        text: party === 'BJP' 
          ? `Work in development has been positive, especially our park sanitation.`
          : `Water shortages still persist, need a change of councillor here!`,
        sentiment: party === 'BJP' ? ('positive' as const) : ('negative' as const),
        timestamp: "2026-05-20"
      },
      {
        id: `${id}-com2`,
        authorName: "Amit Guru",
        text: `Very reliable figure, accessible on WhatsApp during monsoon waterlogging.`,
        sentiment: 'positive' as const,
        timestamp: "2026-05-18"
      }
    ];

    candidates.push({
      id,
      wardId,
      name,
      party,
      photoUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`,
      bio: `${party} candidate for Ward ${wardId}. Dedicated social worker focused on Indore Swachh Bharat cleanliness ranking preservation, water pipelines, and LED street lighting.`,
      supportPercent,
      trend,
      comments
    });
  }

  // Normalize support percentage to total exactly 100%
  const total = candidates.reduce((sum, c) => sum + c.supportPercent, 0);
  candidates.forEach(c => {
    c.supportPercent = Math.round((c.supportPercent / total) * 100);
  });

  return candidates;
}

// Generate Ward data
export function generateWards(): Ward[] {
  const wards: Ward[] = [];
  
  for (let id = 1; id <= 85; id++) {
    const info = PROMINENT_WARDS_INFO.find(w => w.id === id);
    const name = getWardName(id);
    const population = info ? info.population : 18000 + ((id * 437) % 15000);

    // Generate issues
    const categories = ['Water', 'Roads', 'Waste', 'Traffic', 'Electricity', 'Security'];
    const titles = [
      "Water Supply Pressure drop in Sector A",
      "Potholes on main connector lane causing traffic blocks",
      "Garbage collection truck missing its schedule on Wednesdays",
      "Bhawarkua market traffic light sync issues causing gridlocks",
      "Street lights non-functional around local school park",
      "CCTV installations needed near community temple node",
    ];

    const issueCount = 2 + (id % 3);
    const issues: Issue[] = [];

    for (let i = 0; i < issueCount; i++) {
      const idx = (id * i + i * 7) % titles.length;
      issues.push({
        id: `w${id}-i${i + 1}`,
        wardId: id,
        title: titles[idx],
        category: categories[idx % categories.length],
        severity: (id + i) % 3 === 0 ? 'High' : (id + i) % 3 === 1 ? 'Medium' : 'Low',
        upvotes: 12 + ((id * 5 + i * 19) % 120),
        status: i === 0 ? 'Resolved' : i === 1 ? 'In Progress' : 'Open'
      });
    }

    const candidates = generateCandidates(id);
    const candidateIds = candidates.map(c => c.id);
    
    const supportData: Record<string, number> = {};
    candidates.forEach(c => {
      supportData[c.id] = c.supportPercent;
    });

    wards.push({
      id,
      number: id,
      name,
      population,
      issues,
      candidateIds,
      supportData,
      lastUpdated: new Date().toISOString().split('T')[0]
    });
  }

  return wards;
}

// Full datasets
export const WARDS_DATA = generateWards();
export const ALL_CANDIDATES_DATA = WARDS_DATA.flatMap(w => generateCandidates(w.id));

// Generate leaderborad entries
export const LEADERBOARD_WARD_DATA: LeaderboardEntry[] = [
  { userId: "u12", userName: "Aman Agrawal", wardId: 10, points: 520, rank: 1, avatarSeed: "aman" },
  { userId: "u15", userName: "Radha Dwivedi", wardId: 10, points: 410, rank: 2, avatarSeed: "radha" },
  { userId: "u18", userName: "Subrat Joshi", wardId: 25, points: 380, rank: 3, avatarSeed: "subrat" },
  { userId: "u25", userName: "Preeti Chouhan", wardId: 32, points: 350, rank: 4, avatarSeed: "preeti" },
  { userId: "u36", userName: "Vikram Rathore", wardId: 45, points: 290, rank: 5, avatarSeed: "vikram" }
];

export const LEADERBOARD_CITY_DATA: LeaderboardEntry[] = [
  { userId: "u99", userName: "Kailash Mandloi", wardId: 54, points: 1250, rank: 1, avatarSeed: "kailash" },
  { userId: "u82", userName: "Deepa Shrivastava", wardId: 62, points: 1100, rank: 2, avatarSeed: "deepa" },
  { userId: "u12", userName: "Aman Agrawal", wardId: 10, points: 520, rank: 3, avatarSeed: "aman" },
  { userId: "u15", userName: "Radha Dwivedi", wardId: 10, points: 410, rank: 4, avatarSeed: "radha" },
  { userId: "u02", userName: "Sanjay Patel Indore", wardId: 1, points: 390, rank: 5, avatarSeed: "sanjay" }
];
