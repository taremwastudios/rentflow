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

// Helper to parse drizzle-orm condition object and extract filter values
function parseCondition(condition: unknown, tableName: string): { email?: string; sessionId?: string; [key: string]: string | undefined } {
  const result: { email?: string; sessionId?: string; [key: string]: string | undefined } = {};
  
  if (!condition || typeof condition !== 'object') return result;
  
  const cond = condition as { queryChunks?: Array<{ name?: string; value?: unknown; table?: unknown }> };
  const chunks = cond.queryChunks || [];
  
  // Find column names and their corresponding values
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    if (chunk.name) {
      // Get the table info if available
      const tableInfo = chunk.table as { name?: string } | undefined;
      const columnTableName = tableInfo?.name;
      
      // Look at next chunk for the value
      const nextChunk = chunks[i + 1];
      if (nextChunk && nextChunk.value !== undefined) {
        const value = Array.isArray(nextChunk.value) ? nextChunk.value[0] : nextChunk.value;
        if (typeof value === 'string') {
          // Map column names to result keys
          if (chunk.name === 'email') {
            result.email = value;
          } else if (chunk.name === 'id' && columnTableName === 'sessions') {
            result.sessionId = value;
          } else if (chunk.name === 'id') {
            result.id = value;
          } else if (chunk.name === 'user_id') {
            result.userId = value;
          } else if (chunk.name === 'landlord_id') {
            result.landlordId = value;
          } else if (chunk.name === 'property_id') {
            result.propertyId = value;
          } else if (chunk.name === 'role') {
            result.role = value;
          } else if (chunk.name === 'verification_status') {
            result.verificationStatus = value;
          } else if (chunk.name === 'status') {
            result.status = value;
          }
        }
      }
    }
  }
  
  return result;
}

// The mock database object that mimics drizzle-orm's API
const db = {
  // Handle db.select({ session: sessions, user: users }) or db.select() - can be called with an object of fields
  select: (fields?: unknown): MockResult => {
    // If fields is provided like { session: sessions, user: users }, store it for innerJoin
    const selectFields = fields;
    return {
      from: (table: unknown): MockResult => {
        const tableName = getTableName(table);
        
        return {
          // Handle .where() with eq() conditions
          where: (condition: unknown): MockResult => {
            // Parse condition to extract filter values
            const filters = parseCondition(condition, tableName);
            
            const emailFilter = filters.email;
            const sessionIdFilter = filters.sessionId;
            const idFilter = filters.id;
            const roleFilter = filters.role;
            const verificationStatusFilter = filters.verificationStatus;
            const statusFilter = filters.status;
            
            return {
              // Handle .limit()
              limit: (count: number): MockResult => {
                // For users table with email filter, return matching user
                if (tableName === 'users' && emailFilter) {
                  const user = DEMO_USERS.find(u => u.email === emailFilter);
                  return user ? [user] : [];
                }
                // For sessions table with id filter, return matching session
                if (tableName === 'sessions' && sessionIdFilter) {
                  const session = sessions.get(sessionIdFilter);
                  if (session && session.expiresAt > new Date()) {
                    return [session];
                  }
                  return [];
                }
                return [];
              },
              // Handle execute without limit - return array
              execute: (): MockResult[] => {
                if (tableName === 'users' && emailFilter) {
                  const user = DEMO_USERS.find(u => u.email === emailFilter);
                  return user ? [user] : [];
                }
                if (tableName === 'sessions' && sessionIdFilter) {
                  const session = sessions.get(sessionIdFilter);
                  if (session && session.expiresAt > new Date()) {
                    return [session];
                  }
                  return [];
                }
                return [];
              },
            };
          },
          // Handle .innerJoin()
          innerJoin: (table2: unknown, condition: unknown): MockResult => {
            const table2Name = getTableName(table2);
            
            // Parse condition to extract filter values
            const filters = parseCondition(condition, tableName);
            
            const sessionId = filters.sessionId;
            const userId = filters.userId;
            const landlordId = filters.landlordId;
            const propertyId = filters.propertyId;
            
            return {
              where: (condition: unknown): MockResult => {
                return {
                  limit: (count: number): MockResult => {
                    // Check if this is a session lookup with user join
                    if (tableName === 'sessions' && table2Name === 'users' && sessionId) {
                      const session = sessions.get(sessionId);
                      if (session && session.expiresAt > new Date()) {
                        const user = DEMO_USERS.find(u => u.id === session.userId);
                        if (user) {
                          // Return the joined result in the format drizzle returns
                          return [{ session, user }];
                        }
                      }
                    }
                    return [];
                  },
                  execute: (): MockResult[] => {
                    if (tableName === 'sessions' && table2Name === 'users' && sessionId) {
                      const session = sessions.get(sessionId);
                      if (session && session.expiresAt > new Date()) {
                        const user = DEMO_USERS.find(u => u.id === session.userId);
                        if (user) {
                          return [{ session, user }];
                        }
                      }
                    }
                    return [];
                  },
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
