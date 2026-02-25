// Mock database for build time when no database is available
// This allows the build to pass without requiring cloud DB credentials
// For production, replace this with a real database connection

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MockResult = any;

// Seed data for demo/testing purposes
const DEMO_USERS = [
  {
    id: 1,
    name: "Demo Landlord",
    email: "landlord@demo.com",
    phone: "+256700000000",
    passwordHash: "ed93cd0a364809b0d7e1b196d94321093be3e90644d93b4b0914ec5017d1e60b", // password
    role: "landlord" as const,
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: "Admin User",
    email: "admin@demo.com",
    phone: "+256700000001",
    passwordHash: "ed93cd0a364809b0d7e1b196d94321093be3e90644d93b4b0914ec5017d1e60b", // password
    role: "admin" as const,
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// In-memory session storage
const sessions: Map<string, { id: string; userId: number; expiresAt: Date; createdAt: Date }> = new Map();

// Helper to extract table name from schema
function getTableName(table: unknown): string {
  if (table && typeof table === 'object' && 'tableName' in table) {
    return (table as { tableName: string }).tableName;
  }
  return String(table);
}

// The mock database object that mimics drizzle-orm's API
const db = {
  // Handle db.select() - can be called with or without fields
  select: (...args: unknown[]): MockResult => {
    return {
      from: (table: unknown): MockResult => {
        const tableName = getTableName(table);
        
        return {
          // Handle .where() with eq() conditions
          where: (condition: unknown): MockResult => {
            // Try to extract the email from the condition for user queries
            let emailFilter: string | null = null;
            
            // Simple check for eq() in condition - this is a rough approximation
            if (condition && typeof condition === 'object') {
              const cond = condition as { left?: { column?: { name?: string } }; right?: unknown };
              if (cond?.left?.column?.name === 'email' && cond.right) {
                emailFilter = String(cond.right);
              }
            }
            
            return {
              // Handle .limit()
              limit: (count: number): MockResult => {
                // For users table with email filter, return matching user
                if (tableName === 'users' && emailFilter) {
                  const user = DEMO_USERS.find(u => u.email === emailFilter);
                  return user ? [user] : [];
                }
                return [];
              },
              // Handle execute without limit - return array
              execute: (): MockResult[] => {
                if (tableName === 'users' && emailFilter) {
                  const user = DEMO_USERS.find(u => u.email === emailFilter);
                  return user ? [user] : [];
                }
                return [];
              },
            };
          },
          // Handle .innerJoin()
          innerJoin: (table2: unknown, condition: unknown): MockResult => {
            return {
              where: (condition: unknown): MockResult => {
                return {
                  limit: (count: number): MockResult => {
                    // Check if this is a session lookup with user join
                    if (tableName === 'sessions') {
                      // Try to find the session
                      let sessionId: string | null = null;
                      if (condition && typeof condition === 'object') {
                        const cond = condition as { left?: { column?: { name?: string } }; right?: unknown };
                        if (cond?.left?.column?.name === 'id' && cond.right) {
                          sessionId = String(cond.right);
                        }
                      }
                      if (sessionId) {
                        const session = sessions.get(sessionId);
                        if (session && session.expiresAt > new Date()) {
                          const user = DEMO_USERS.find(u => u.id === session.userId);
                          if (user) {
                            return [{ session, user }];
                          }
                        }
                      }
                    }
                    return [];
                  },
                  execute: (): MockResult[] => [],
                };
              },
            };
          },
          // Handle .orderBy()
          orderBy: (...args: unknown[]): MockResult => {
            return {
              limit: (count: number): MockResult => [],
              execute: (): MockResult[] => [],
            };
          },
          // Handle execute without where - return array
          execute: (): MockResult[] => {
            if (tableName === 'users') {
              return DEMO_USERS;
            }
            return [];
          },
        };
      },
    };
  },

  // Handle db.insert(table).values(...).returning()
  insert: (table: unknown): MockResult => {
    const tableName = getTableName(table);
    let insertedId = Math.floor(Math.random() * 10000) + 100;
    
    return {
      values: (values: unknown): MockResult => {
        // Handle users table - assign ID
        if (tableName === 'users') {
          const userValues = values as { email?: string; name?: string; passwordHash?: string; role?: string; phone?: string };
          const newUser = {
            id: insertedId,
            name: userValues.name || '',
            email: userValues.email || '',
            phone: userValues.phone || null,
            passwordHash: userValues.passwordHash || '',
            role: (userValues.role || 'tenant') as 'admin' | 'landlord' | 'tenant',
            avatarUrl: null as string | null,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          // Add to demo users for this session
          (DEMO_USERS as unknown as any[]).push(newUser);
          return {
            returning: (): MockResult[] => [newUser],
          };
        }
        
        // Handle sessions table
        if (tableName === 'sessions') {
          const sessionValues = values as { id: string; userId: number; expiresAt: Date };
          sessions.set(sessionValues.id, {
            id: sessionValues.id,
            userId: sessionValues.userId,
            expiresAt: sessionValues.expiresAt,
            createdAt: new Date(),
          });
          return {
            returning: (): MockResult[] => [sessionValues],
          };
        }
        
        return {
          returning: (): MockResult[] => [{ id: insertedId }],
        };
      },
    };
  },

  // Handle db.update(table).set(...).where(...)
  update: (table: unknown): MockResult => {
    return {
      set: (values: unknown): MockResult => {
        return {
          where: (condition: unknown): MockResult => {
            return {
              execute: (): MockResult[] => [],
            };
          },
        };
      },
    };
  },

  // Handle db.delete(table).where(...)
  delete: (table: unknown): MockResult => {
    return {
      where: (condition: unknown): MockResult => {
        // Handle session deletion
        const tableName = getTableName(table);
        if (tableName === 'sessions') {
          let sessionId: string | null = null;
          if (condition && typeof condition === 'object') {
            const cond = condition as { left?: { column?: { name?: string } }; right?: unknown };
            if (cond?.left?.column?.name === 'id' && cond.right) {
              sessionId = String(cond.right);
            }
          }
          if (sessionId) {
            sessions.delete(sessionId);
          }
        }
        return {
          execute: (): MockResult[] => [],
        };
      },
    };
  },
};

export { db };
