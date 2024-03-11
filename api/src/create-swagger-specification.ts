import * as fs from 'fs';
import * as crypto from 'crypto';
import * as process from 'process';

function hashContent(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

const active: boolean = false;

export async function createOrUpdateSwaggerSpec(document: any): Promise<void> {
  if (active && process.env.NODE_ENV == 'development') {
    const documentString: string = JSON.stringify(document);
    const currentHash: string = hashContent(documentString);

    const specPath: string = './swagger-spec.json';
    if (fs.existsSync(specPath)) {
      const existingSpec: string = fs.readFileSync(specPath, 'utf8');
      const existingHash: string = hashContent(existingSpec);

      if (currentHash !== existingHash) {
        console.log('Swagger spec has changed. Updating...');
        fs.writeFileSync(specPath, documentString);
      } else {
        console.log('No changes in Swagger spec.');
      }
    } else {
      console.log('Swagger spec does not exist. Creating...');
      fs.writeFileSync(specPath, documentString);
    }
  } else {
    console.log('Swagger spec update is not active.');
    return;
  }
}