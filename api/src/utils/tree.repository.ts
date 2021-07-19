import { TreeRepository } from 'typeorm';
import { isEqual } from 'lodash';

interface WithExplodedPath {
  explodedPath: string[];
}

export class ExtendedTreeRepository<
  Entity,
  CreateDto extends { parent?: Entity }
> extends TreeRepository<Entity> {
  /**
   * Takes a list of DTO objects and saves them as a tree
   * It uses importData[pathKey]:string as a fully realized materialized path
   *
   * @param importData
   * @param pathKey
   */
  public async saveListToTree(
    importData: CreateDto[],
    pathKey: keyof CreateDto,
  ): Promise<Entity[]> {
    let rest: (CreateDto & WithExplodedPath)[] = importData.map(
      (importElem: CreateDto) => {
        const path: string = (importElem[pathKey] as unknown) as string;
        return {
          ...importElem,
          explodedPath: path?.split('.') ?? [],
        };
      },
    );
    let matches: (Entity & WithExplodedPath)[] = [];
    let depth = 0;

    while (rest.length > 0) {
      const response = this.splitByPathDepth(rest, depth);
      if (
        response.rest.length > 0 &&
        response.matches.length === 0 &&
        depth > 1
      ) {
        throw new Error(
          `Potential split trees found at ${this.constructor.name}`,
        );
      }

      depth += 1;
      rest = response.rest;
      if (matches.length === 0) {
        matches = await Promise.all(
          response.matches.map(
            async (
              elem: CreateDto & WithExplodedPath,
            ): Promise<Entity & WithExplodedPath> => {
              const Entity: Entity & WithExplodedPath = ((await this.save(
                this.entityFromCreateDto(elem),
              )) as unknown) as Entity & WithExplodedPath;
              Entity.explodedPath = elem.explodedPath;
              return Entity;
            },
          ),
        );
      } else {
        await Promise.all(
          response.matches.map(async (match: CreateDto & WithExplodedPath) => {
            const parent:
              | (Entity & WithExplodedPath)
              | undefined = matches.find(
              (parent: Entity & WithExplodedPath) => {
                return isEqual(
                  match.explodedPath.slice(0, -1),
                  parent.explodedPath,
                );
              },
            );

            if (parent === undefined) {
              throw new Error(
                `Found unexpected orphan Entity "${JSON.stringify(
                  match,
                )}" with path "${match[pathKey]}" in repository ${
                  this.constructor.name
                }`,
              );
            }

            match.parent = parent;

            const entity: Entity & WithExplodedPath = (await this.save(
              this.entityFromCreateDto(match),
            )) as Entity & WithExplodedPath;
            entity.explodedPath = match.explodedPath;
            matches.push(entity);
          }),
        );
      }
    }
    return matches;
  }

  private splitByPathDepth(
    list: (CreateDto & WithExplodedPath)[],
    depth: number,
  ): {
    matches: (CreateDto & WithExplodedPath)[];
    rest: (CreateDto & WithExplodedPath)[];
  } {
    const result: {
      matches: (CreateDto & WithExplodedPath)[];
      rest: (CreateDto & WithExplodedPath)[];
    } = {
      matches: [],
      rest: [],
    };

    list.forEach((elem: CreateDto & WithExplodedPath) => {
      if (elem.explodedPath.length === depth) {
        result.matches.push(elem);
      } else {
        result.rest.push(elem);
      }
    });

    return result;
  }

  /*
   * Creates a new instance of the given entity
   *
   * @param create Properties of the instance to create.
   * @param info Additional request metadata
   * @return The entity instance to be created
   */
  private entityFromCreateDto(create: CreateDto): Entity {
    /**
     * Probably not the best way of doing it but it should address at least
     * simple use cases. See:
     * https://stackoverflow.com/questions/17382143/create-a-new-object-from-type-parameter-in-generic-class#26696476
     */
    const model: Record<string, any> = {};

    // eslint-disable-next-line @typescript-eslint/typedef
    Object.entries(create).forEach(([key, value]) => {
      model[key] = value;
    });

    return model as Entity;
  }
}
