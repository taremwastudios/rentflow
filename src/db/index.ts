// Mock database for build time when no database is available
// This allows the build to pass without requiring cloud DB credentials
// For production, replace this with a real database connection

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MockResult = any;

// The mock database object that mimics drizzle-orm's API
const db = {
  // Handle db.select() - can be called with or without fields
  select: (...args: unknown[]): MockResult => {
    return {
      from: (table: unknown): MockResult => {
        return {
          // Handle .where() with eq() conditions
          where: (condition: unknown): MockResult => {
            return {
              // Handle .limit()
              limit: (count: number): MockResult => {
                // Return empty array directly
                return [];
              },
              // Handle execute without limit - return array
              execute: (): MockResult[] => [],
            };
          },
          // Handle .innerJoin()
          innerJoin: (table2: unknown, condition: unknown): MockResult => {
            return {
              where: (condition: unknown): MockResult => {
                return {
                  limit: (count: number): MockResult => [],
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
          execute: (): MockResult[] => [],
        };
      },
    };
  },

  // Handle db.insert(table).values(...).returning()
  insert: (table: unknown): MockResult => {
    return {
      values: (values: unknown): MockResult => {
        return {
          returning: (): MockResult[] => {
            // Return a mock inserted record
            return [{ id: 1 }];
          },
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
        return {
          execute: (): MockResult[] => [],
        };
      },
    };
  },
};

export { db };
