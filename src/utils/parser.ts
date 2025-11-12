import { BruCollection, BruFile, BruFolder } from "../types/index.js";
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, basename } from 'path';
import { minimatch } from 'minimatch';

export function parseBruCollection(folderPath: string, excludePatterns: string[]): BruCollection {
  const collectionName = basename(folderPath);

  // Initialize collection structure with defaults
  const bruCollection: BruCollection = {
    name: collectionName, // Default to folder name
    auth: 'none',
    folders: []
  };

  try {
    // Parse bruno.json for collection metadata
    const brunoJsonPath = join(folderPath, 'bruno.json');
    try {
      if (statSync(brunoJsonPath).isFile()) {
        const brunoJsonContent = readFileSync(brunoJsonPath, 'utf-8');
        const brunoJson = JSON.parse(brunoJsonContent);

        // Use the name from bruno.json if available
        if (brunoJson.name) {
          bruCollection.name = brunoJson.name;
        }

        // Parse other bruno.json properties if needed
        // brunoJson.version, brunoJson.type, etc.
      }
    } catch (error) {
      console.warn(`Warning: Could not parse bruno.json: ${error}`);
      // Continue with folder name as default
    }

    // Parse collection.bru for collection-level authentication
    const collectionBruPath = join(folderPath, 'collection.bru');
    try {
      if (statSync(collectionBruPath).isFile()) {
        const collectionBru = parseBru(collectionBruPath);

        // Extract auth configuration from collection.bru
        if (collectionBru['auth:basic']) {
          bruCollection.auth = 'basic';
          bruCollection['auth:basic'] = collectionBru['auth:basic'];
        } else if (collectionBru['auth:bearer']) {
          bruCollection.auth = 'bearer';
          bruCollection['auth:bearer'] = collectionBru['auth:bearer'];
        } else if (collectionBru['auth:digest']) {
          bruCollection.auth = 'digest';
          bruCollection['auth:digest'] = collectionBru['auth:digest'];
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not parse collection.bru: ${error}`);
      // Continue with default auth settings
    }

    // Read all items in the collection folder
    const items = readdirSync(folderPath);

    for (const item of items) {
      const itemPath = join(folderPath, item);
      const stats = statSync(itemPath);

      // Skip collection metadata files and parse only directories
      if (stats.isDirectory()) {
        // Recursively parse subfolders
        if (item === 'environments') {
          const environments = parseBruFolder(itemPath, excludePatterns);
          bruCollection.environments = bruCollection.environments || {};
          if (environments && environments.files.length > 0) {
            for (const environment of environments.files) {
              const envName = basename(environment.filename, '.bru');
              bruCollection.environments[envName] = {
                name: envName,
                variables: environment.variables || {}
              };
            }
          }
        } else {
          const subFolder = parseBruFolder(itemPath, excludePatterns);

          if (subFolder) {
            bruCollection.folders.push(subFolder);
          }
        }
      }
      // Note: We don't parse .bru files at collection level, only in folders
      // Collection-level files are bruno.json and collection.bru (already handled above)
    }

    // Sort folders alphabetically for consistent ordering
    bruCollection.folders.sort((a, b) => a.name.localeCompare(b.name));

    if (bruCollection.folders.length === 0) {
      console.warn(`Warning: Collection '${bruCollection.name}' contains no folders with .bru files.`);
    }

  } catch (error) {
    console.error(`Error reading collection folder ${folderPath}: ${error}`);
    throw new Error(`Failed to parse Bruno collection: ${error}`);
  }

  return bruCollection;
}

export function parseBruFolder(folderPath: string, excludePatterns: string[]): BruFolder | undefined {
  const folderName = basename(folderPath);

  // Initialize folder structure
  const bruFolder: BruFolder = {
    name: folderName, // Default to folder name
    files: [],
    folders: []
  };

  try {
    // Check if folder.bru exists and parse it for folder metadata
    const folderBruPath = join(folderPath, 'folder.bru');
    try {
      if (statSync(folderBruPath).isFile()) {
        const folderBru = parseBru(folderBruPath);
        // Use the name from folder.bru if available
        if (folderBru.meta.name) {
          bruFolder.name = folderBru.meta.name;
        }
      }
    } catch (error) {
      // folder.bru doesn't exist, use folder name as default (already set above)
    }

    // Read all items in the folder
    const items = readdirSync(folderPath);

    for (const item of items) {
      const itemPath = join(folderPath, item);
      const stats = statSync(itemPath);

      if (stats.isDirectory()) {
        // Recursively parse subfolders
        const subFolder = parseBruFolder(itemPath, excludePatterns);
        if (subFolder) {
          bruFolder.folders.push(subFolder);
        }
      } else if (stats.isFile() && item.endsWith('.bru') && item !== 'folder.bru') {
        // Parse .bru files (excluding folder.bru as it's metadata)
        try {
          const bruFile = parseBru(itemPath);
          if (!bruFile.meta.name) {
            // console.warn(`Warning: .bru file '${item}' has no name defined in meta block.`);
            // continue; // Skip files without a name
          }
          bruFolder.files.push(bruFile);
        } catch (error) {
          console.warn(`Warning: Could not parse ${itemPath}: ${error}`);
        }
      }
    }

    if (bruFolder.files.length === 0 && bruFolder.folders.length === 0) {
      console.warn(`Warning: Folder '${folderName}' is empty or contains no valid .bru files.`);
      return undefined; // Return undefined if no valid content
    }

    const matchedPattern: string | undefined = excludePatterns.find(pattern => minimatch(folderName, pattern));
    if (matchedPattern) {
      console.log(`Excluding folder '${folderName}' due to pattern match: ${matchedPattern}`);
      return undefined;
    }

    // Sort files by sequence number for consistent ordering
    bruFolder.files.sort((a, b) => a.meta.seq - b.meta.seq);

    // Sort folders alphabetically
    bruFolder.folders.sort((a, b) => a.name.localeCompare(b.name));

  } catch (error) {
    console.error(`Error reading folder ${folderPath}: ${error}`);
  }

  return bruFolder;
}

export function parseBru(filePath: string): BruFile {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const bruFile: BruFile = {
    filename: filePath,
    meta: {
      name: '',
      type: 'http',
      seq: 1
    }
  };

  let currentBlock: string | null = null;
  let currentContent: string[] = [];
  let braceCount = 0;
  let inBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];//.trim();

    // Skip empty lines and comments when not in a block
    if (!inBlock && (line === '' || line.startsWith('//'))) {
      continue;
    }

    // Check for block start
    const blockMatch = line.match(/^([a-zA-Z:\-]+)\s*\{/);
    if (blockMatch && !inBlock) {
      currentBlock = blockMatch[1];
      inBlock = true;
      braceCount = 1;

      // Check if the block has content on the same line
      const restOfLine = line.substring(blockMatch[0].length);//.trim();
      if (restOfLine) {
        if (restOfLine === '}') {
          // Empty block
          braceCount = 0;
          inBlock = false;
          processBlock(bruFile, currentBlock, []);
          currentBlock = null;
          currentContent = [];
        } else {
          currentContent.push(restOfLine);
        }
      }
      continue;
    }

    if (inBlock) {
      // Count braces to handle nested structures
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      braceCount += openBraces - closeBraces;

      if (braceCount === 0) {
        // End of block
        inBlock = false;

        // Remove the closing brace from the line if it's the only thing
        let contentLine = line;
        if (line === '}') {
          contentLine = '';
        } else if (line.endsWith('}')) {
          contentLine = line.substring(0, line.length - 1);//.trim();
        }

        if (contentLine) {
          currentContent.push(contentLine);
        }

        processBlock(bruFile, currentBlock!, currentContent);
        currentBlock = null;
        currentContent = [];
      } else {
        // Add line to current block content
        currentContent.push(line);
      }
    }
  }

  return bruFile;
}

function processBlock(bruFile: BruFile, blockType: string, content: string[]): void {
  const contentStr = content.map(line => line.trim()).join('\n');
  switch (blockType) {
    case 'meta':
      parseMeta(bruFile, contentStr);
      break;

    // HTTP Methods
    case 'get':
    case 'post':
    case 'put':
    case 'delete':
    case 'patch':
    case 'head':
    case 'options':
    case 'trace':
    case 'connect':
      parseHttpMethod(bruFile, blockType, contentStr);
      break;

    // Auth
    case 'auth':
      const authParams = parseKeyValuePairs(contentStr);
      bruFile.auth = authParams['mode'] || 'none';
      break;
    case 'auth:basic':
      parseAuthBasic(bruFile, contentStr);
      break;
    case 'auth:bearer':
      parseAuthBearer(bruFile, contentStr);
      break;
    case 'auth:digest':
      parseAuthDigest(bruFile, contentStr);
      break;

    // Parameters
    case 'params:query':
      parseParamsQuery(bruFile, contentStr);
      break;
    case 'params:path':
      parseParamsPath(bruFile, contentStr);
      break;

    // Headers
    case 'headers':
      parseHeaders(bruFile, contentStr);
      break;

    // Body variations
    case 'body':
      bruFile.body = contentStr;
      break;
    case 'body:json':
      bruFile['body:json'] = contentStr;
      break;
    case 'body:text':
      bruFile['body:text'] = contentStr;
      break;
    case 'body:xml':
      bruFile['body:xml'] = contentStr;
      break;
    case 'body:form-urlencoded':
      parseBodyForm(bruFile, contentStr, 'body:form-urlencoded');
      break;
    case 'body:multipart-form':
      console.log(`Parsing multipart form body for file: ${bruFile.filename}`, contentStr);
      parseBodyForm(bruFile, contentStr, 'body:multipart-form');
      break;
    case 'body:graphql':
      bruFile['body:graphql'] = contentStr;
      break;
    case 'body:graphql:vars':
      bruFile['body:graphql:vars'] = contentStr;
      break;

    // Scripts
    case 'script:pre-request':
      bruFile['script:pre-request'] = contentStr;
      break;
    case 'script:post-response':
      bruFile['script:post-response'] = contentStr;
      break;

    // Tests
    case 'tests':
      bruFile.tests = contentStr;
      break;

    case 'vars':
      bruFile.variables = parseKeyValuePairs(contentStr);
      break;

    case 'docs':
      bruFile.description = content.map((line) => line.startsWith('  ') ? line.slice(2) : line).join('\n');
      break;

    default:
      console.warn(`Unknown block type: ${blockType} in file ${bruFile.filename}`);
  }
}

function parseMeta(bruFile: BruFile, content: string): void {
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;

    const key = trimmed.substring(0, colonIndex).trim();
    const value = trimmed.substring(colonIndex + 1).trim();

    switch (key) {
      case 'name':
        bruFile.meta.name = value;
        break;
      case 'type':
        bruFile.meta.type = value as 'http' | 'graphql';
        break;
      case 'seq':
        bruFile.meta.seq = parseInt(value, 10) || 1;
        break;
    }
  }
}

function parseHttpMethod(bruFile: BruFile, method: string, content: string): void {
  const lines = content.split('\n');
  const request: any = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;

    const key = trimmed.substring(0, colonIndex).trim();
    const value = trimmed.substring(colonIndex + 1).trim();

    switch (key) {
      case 'url':
        request.url = value;
        break;
      case 'body':
        request.body = value;
        break;
      case 'auth':
        request.auth = value;
        break;
    }
  }

  bruFile[method as keyof BruFile] = request;
}

function parseAuthBasic(bruFile: BruFile, content: string): void {
  const lines = content.split('\n');
  const auth: any = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;

    const key = trimmed.substring(0, colonIndex).trim();
    const value = trimmed.substring(colonIndex + 1).trim();

    if (key === 'username' || key === 'password') {
      auth[key] = value;
    }
  }

  bruFile['auth:basic'] = auth;
}

function parseAuthBearer(bruFile: BruFile, content: string): void {
  const lines = content.split('\n');
  const auth: any = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;

    const key = trimmed.substring(0, colonIndex).trim();
    const value = trimmed.substring(colonIndex + 1).trim();

    if (key === 'token') {
      auth.token = value;
    }
  }

  bruFile['auth:bearer'] = auth;
}

function parseAuthDigest(bruFile: BruFile, content: string): void {
  const lines = content.split('\n');
  const auth: any = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;

    const key = trimmed.substring(0, colonIndex).trim();
    const value = trimmed.substring(colonIndex + 1).trim();

    if (key === 'username' || key === 'password') {
      auth[key] = value;
    }
  }

  bruFile['auth:digest'] = auth;
}

function parseParamsQuery(bruFile: BruFile, content: string): void {
  bruFile['params:query'] = parseKeyValuePairs(content);
}

function parseParamsPath(bruFile: BruFile, content: string): void {
  bruFile['params:path'] = parseKeyValuePairs(content);
}

function parseHeaders(bruFile: BruFile, content: string): void {
  bruFile.headers = parseKeyValuePairs(content);
}

function parseBodyForm(bruFile: BruFile, content: string, type: 'body:form-urlencoded' | 'body:multipart-form'): void {
  bruFile[type] = parseKeyValuePairs(content);
}

function parseKeyValuePairs(content: string): Record<string, any> {
  const result: Record<string, any> = {};
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;

    const key = trimmed.substring(0, colonIndex).trim();
    let value = trimmed.substring(colonIndex + 1).trim();

    // Handle disabled parameters (prefixed with ~)
    if (key.startsWith('~')) {
      const actualKey = key.substring(1);
      result[actualKey] = { value, disabled: true };
    } else {
      // Try to parse as number if it looks like one
      if (/^\d+$/.test(value)) {
        result[key] = parseInt(value, 10);
      } else if (/^\d+\.\d+$/.test(value)) {
        result[key] = parseFloat(value);
      } else {
        result[key] = value;
      }
    }
  }

  return result;
}
