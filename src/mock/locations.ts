export const states = ["Madhya Pradesh"];

export const cities = ["Indore", "Bhopal", "Ujjain", "Dewas", "Rau", "Pithampur"];

export const areas = [
  "Vijay Nagar",
  "Mahalaxmi Nagar",
  "Scheme 78",
  "Super Corridor",
  "Rau",
  "Nipania",
  "Palasia",
  "Bengali Square",
  "AB Road",
  "MR 10",
  "Ring Road",
  "Bhawarkuan",
  "Rajendra Nagar",
];

export const names = [
  "Amit Sharma",
  "Priya Jain",
  "Rahul Verma",
  "Neha Patel",
  "Saurabh Dubey",
  "Kavita Rathore",
  "Rohit Chouhan",
  "Meenal Agrawal",
  "Vikas Soni",
  "Anjali Gupta",
  "Manish Tiwari",
  "Pooja Yadav",
  "Nitin Bansal",
  "Swati Saxena",
  "Deepak Parmar",
  "Ritu Malviya",
  "Arjun Meena",
  "Payal Khandelwal",
  "Harsh Vyas",
  "Sneha Joshi",
];

export function mobile(index: number) {
  return `9${String(810000000 + index * 7919).slice(0, 9)}`;
}

export function pick<T>(items: T[], index: number) {
  return items[index % items.length];
}

export function date(index: number) {
  const day = String((index % 26) + 1).padStart(2, "0");
  return `${day}-06-2026`;
}
