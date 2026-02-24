// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MockDB = any;

// Mock database for build time when no database is available
// This allows the build to pass without requiring cloud DB credentials
const db: MockDB = {
  select: () => ({ 
    from: () => ({ 
      where: () => ({ 
        limit: () => [],
        execute: () => []
      }),
      orderBy: () => ({
        limit: () => [],
        execute: () => []
      })
    }) 
  }),
  insert: () => ({ 
    values: () => ({ 
      returning: () => [{ id: 1 }] 
    }) 
  }),
  update: () => ({ 
    set: () => ({ 
      where: () => [] 
    }) 
  }),
  delete: () => ({ 
    where: () => [] 
  }),
};

export { db };
