/**
 * Raw demo population. Order matters: members are placed in the binary tree
 * in this order using the same placement engine as live registrations.
 */
export type SeedPerson = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  code: string;
  /** id of the sponsoring member (admin is the root sponsor). */
  sponsor: string;
  /** Founder package code purchased, if any. */
  pkg: "F1" | "F2" | "F3" | null;
  joined: string;
};

export const ADMIN_PERSON = {
  id: "usr_admin",
  name: "Nadia Petrov",
  email: "admin@nexora.io",
  code: "NXR-ADMIN",
  joined: "2025-09-01T09:00:00.000Z",
} as const;

export const CURRENT_USER_ID = "usr_alex";

export const SEED_PEOPLE: SeedPerson[] = [
  { id: "usr_alex", name: "Alex Morgan", email: "alex.morgan@nexora.io", phone: "+1 415 555 0134", code: "NXR-ALEX01", sponsor: "usr_admin", pkg: "F3", joined: "2026-01-14T10:20:00.000Z" },
  { id: "usr_priya", name: "Priya Nair", email: "priya.nair@example.com", code: "NXR-PRIYA2", sponsor: "usr_alex", pkg: "F2", joined: "2026-02-03T14:05:00.000Z" },
  { id: "usr_marcus", name: "Marcus Bell", email: "marcus.bell@example.com", code: "NXR-MBELL3", sponsor: "usr_alex", pkg: "F3", joined: "2026-02-19T09:40:00.000Z" },
  { id: "usr_elena", name: "Elena Rossi", email: "elena.rossi@example.com", code: "NXR-EROSS4", sponsor: "usr_alex", pkg: "F1", joined: "2026-03-11T17:15:00.000Z" },
  { id: "usr_sofia", name: "Sofia Almeida", email: "sofia.almeida@example.com", code: "NXR-SALME5", sponsor: "usr_alex", pkg: "F3", joined: "2026-04-02T11:30:00.000Z" },
  { id: "usr_daniel", name: "Daniel Okafor", email: "daniel.okafor@example.com", code: "NXR-DOKAF6", sponsor: "usr_priya", pkg: "F3", joined: "2026-04-22T08:50:00.000Z" },
  { id: "usr_chloe", name: "Chloe Dubois", email: "chloe.dubois@example.com", code: "NXR-CDUBO7", sponsor: "usr_priya", pkg: "F2", joined: "2026-05-06T13:10:00.000Z" },
  { id: "usr_rahul", name: "Rahul Mehta", email: "rahul.mehta@example.com", code: "NXR-RMEHT8", sponsor: "usr_marcus", pkg: "F3", joined: "2026-05-19T16:25:00.000Z" },
  { id: "usr_hannah", name: "Hannah Schmidt", email: "hannah.schmidt@example.com", code: "NXR-HSCHM9", sponsor: "usr_marcus", pkg: "F1", joined: "2026-06-08T10:00:00.000Z" },
  { id: "usr_omar", name: "Omar Haddad", email: "omar.haddad@example.com", code: "NXR-OHADD2", sponsor: "usr_elena", pkg: "F3", joined: "2026-06-25T12:45:00.000Z" },
  { id: "usr_lucia", name: "Lucia Fernandez", email: "lucia.fernandez@example.com", code: "NXR-LFERN3", sponsor: "usr_sofia", pkg: "F2", joined: "2026-07-09T15:35:00.000Z" },
  { id: "usr_tomasz", name: "Tomasz Kowalski", email: "tomasz.kowalski@example.com", code: "NXR-TKOWA4", sponsor: "usr_daniel", pkg: "F3", joined: "2026-07-23T09:20:00.000Z" },
  { id: "usr_liam", name: "Liam O'Connor", email: "liam.oconnor@example.com", code: "NXR-LOCON5", sponsor: "usr_rahul", pkg: "F3", joined: "2026-08-04T18:05:00.000Z" },
  { id: "usr_mei", name: "Mei Lin", email: "mei.lin@example.com", code: "NXR-MLIN66", sponsor: "usr_chloe", pkg: "F2", joined: "2026-08-15T07:55:00.000Z" },
  { id: "usr_kenji", name: "Kenji Watanabe", email: "kenji.watanabe@example.com", code: "NXR-KWATA7", sponsor: "usr_alex", pkg: null, joined: "2026-08-21T20:10:00.000Z" },
  { id: "usr_aisha", name: "Aisha Rahman", email: "aisha.rahman@example.com", code: "NXR-ARAHM8", sponsor: "usr_daniel", pkg: null, joined: "2026-09-02T11:15:00.000Z" },
  { id: "usr_victor", name: "Victor Andrade", email: "victor.andrade@example.com", code: "NXR-VANDR9", sponsor: "usr_omar", pkg: "F3", joined: "2026-09-11T14:40:00.000Z" },
  { id: "usr_zara", name: "Zara Khan", email: "zara.khan@example.com", code: "NXR-ZKHAN2", sponsor: "usr_lucia", pkg: "F1", joined: "2026-09-20T09:30:00.000Z" },
];
