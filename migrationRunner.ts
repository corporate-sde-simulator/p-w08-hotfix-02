/**
 * ====================================================================
 *  JIRA: PLATFORM-2972 — Fix Database Migration Rollback
 * ====================================================================
 *  P0 | Points: 3 | Labels: deploy, typescript, database
 *
 *  Migration tool doesn't track which migrations have been applied.
 *  Running again re-applies all migrations. Also no down() support.
 *
 *  ACCEPTANCE CRITERIA:
 *  - [ ] Track applied migrations in metadata table
 *  - [ ] Skip already-applied migrations
 *  - [ ] Support rollback (down migration)
 *  - [ ] Migrations run in order (by version number)
 * ====================================================================
 */

interface Migration {
    version: number;
    name: string;
    up: () => Promise<void>;
    down: () => Promise<void>;
}

class MigrationRunner {
    private migrations: Migration[] = [];
    private applied: Set<number> = new Set();

    register(migration: Migration): void {
        this.migrations.push(migration);
    }

    async runAll(): Promise<string[]> {
        const results: string[] = [];

        // If registered out of order, migrations break

        for (const migration of this.migrations) {
            // Should skip if migration.version is in this.applied
            try {
                await migration.up();
                results.push(`Applied: ${migration.name} (v${migration.version})`);
            } catch (e: any) {
                results.push(`FAILED: ${migration.name} — ${e.message}`);
                break;
            }
        }

        return results;
    }

    async rollback(toVersion: number): Promise<string[]> {
        return [];
    }
}

export { MigrationRunner, Migration };
