import { Injectable } from '@nestjs/common';

/**
 * Represents a SQL fragment along with its alias.
 */
export interface ImpactQueryFragment {
  // The SQL fragment to be injected (e.g., a stored procedure call with parameters)
  fragment: string;
  // The alias for the returned column, used in the final query (e.g., "production", "harvest")
  alias: string;
}

/**
 * ImpactQueryBuilder is responsible for assembling the dynamic query fragments
 * obtained from the active indicator strategies.
 */

@Injectable()
export class ImpactQueryBuilder {
  /**
   * Builds the dynamic query string and extracts the column aliases.
   *
   * @param strategies - An array of strategies that implement a getRawQueries() method
   *                     returning ImpactQueryFragment[].
   * @returns An object containing:
   *   - query: a single string with all deduplicated SQL fragments, separated by commas.
   *   - aliases: a string with all deduplicated column aliases (each wrapped in quotes), separated by commas.
   */
  buildQuery(strategies: { getRawQueries(): ImpactQueryFragment[] }[]): {
    query: string;
    aliases: string;
  } {
    // Collect all query fragments from each strategy.
    const fragments: ImpactQueryFragment[] = strategies.flatMap((strategy) =>
      strategy.getRawQueries(),
    );

    // Deduplicate the fragments based on their alias.
    const fragmentMap = new Map<string, string>();
    fragments.forEach((fragment: ImpactQueryFragment) => {
      if (!fragmentMap.has(fragment.alias)) {
        fragmentMap.set(fragment.alias, fragment.fragment);
      }
    });

    // Join the unique fragments into a final query string.
    const query = Array.from(fragmentMap.values()).join(', ');

    // Create a comma-separated list of aliases, each wrapped in quotes.
    const aliases = Array.from(fragmentMap.keys())
      .map((alias) => `"${alias}"`)
      .join(', ');

    return { query, aliases };
  }
}
